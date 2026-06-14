import asyncio
import json
import logging
import os
import time
from collections import deque
from typing import Dict

import cv2
import numpy as np
import torch
import onnxruntime as ort
from livekit import agents, rtc
from livekit.agents import JobContext, WorkerOptions, cli

# model.py must be in the same directory — provides EngagementModel + val_transform
from model import EngagementModel, val_transform

def numpy_val_transform(frame: np.ndarray) -> np.ndarray:
    """Pure numpy version of val_transform for ONNX inference."""
    img = frame.astype(np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    img = (img - mean) / std
    return np.transpose(img, (2, 0, 1)) # HWC to CHW

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("engagement-bot")

# ─── Config ───────────────────────────────────────────────────────────────────

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
SEQ_LEN = 16                 # Number of frames per inference clip
INFERENCE_INTERVAL_S = 2.0   # Run inference every N seconds per participant
DISENGAGEMENT_THRESHOLD = 0.45  # Below this → is_disengaged=True (matches frontend)
MAX_CONCURRENT = 10          # Semaphore cap — prevents GPU OOM on large classes


# ─── Model Singleton ──────────────────────────────────────────────────────────

_model: EngagementModel = None


def get_model():
    """Load the model once per worker process and cache it. Supports PyTorch & ONNX."""
    global _model
    if _model is None:
        model_path = os.environ.get("MODEL_PATH", "/models/best_model.pth")
        
        if model_path.endswith(".onnx"):
            logger.info(f"[bot] Loading ONNX model from {model_path}...")
            providers = ['CUDAExecutionProvider', 'CPUExecutionProvider'] if DEVICE.type == "cuda" else ['CPUExecutionProvider']
            try:
                _model = ort.InferenceSession(model_path, providers=providers)
                logger.info(f"[bot] ONNX model loaded with providers: {_model.get_providers()}")
            except Exception as e:
                logger.error(f"[bot] Failed to load ONNX model: {e}")
                raise
        else:
            # Prevent OpenMP deadlocks on CPU in Docker by limiting threads
            if DEVICE.type == "cpu":
                torch.set_num_threads(1)
            
            _model = EngagementModel(freeze_cnn=False)
            try:
                ckpt = torch.load(model_path, map_location=DEVICE)
                _model.load_state_dict(ckpt["model_state"])
                logger.info(f"[bot] PyTorch model loaded from {model_path} on {DEVICE}")
            except FileNotFoundError:
                logger.warning(f"⚠️ [bot] WARNING: '{model_path}' not found! Running with randomly initialized weights for testing. ⚠️")

            _model.to(DEVICE).eval()
    return _model


# ─── Per-Participant Frame Buffer ─────────────────────────────────────────────

class ParticipantBuffer:
    def __init__(self, participant_id: str):
        self.participant_id = participant_id
        # maxlen=SEQ_LEN gives us a sliding window — always have the latest 16 frames
        self.frames: deque = deque(maxlen=SEQ_LEN)
        self.last_inference: float = 0.0
        self.active: bool = True


# ─── Synchronous Inference (runs in thread pool via run_in_executor) ──────────

def run_inference_sync(frames: list) -> dict:
    """
    Single-clip inference. Runs in a thread pool executor to avoid
    blocking the asyncio event loop. Supports both PyTorch and ONNX.
    """
    model = get_model()
    
    if isinstance(model, ort.InferenceSession):
        # ── ONNX Inference ──
        # frames are already 224x224 RGB uint8 numpy arrays
        tensors = [numpy_val_transform(f) for f in frames]
        clip = np.stack(tensors)[np.newaxis, ...]  # (1, 16, 3, 224, 224)
        
        ort_inputs = {model.get_inputs()[0].name: clip.astype(np.float32)}
        logits = model.run(None, ort_inputs)[0]
        # Sigmoid using numpy
        prob = 1.0 / (1.0 + np.exp(-logits[0]))
    else:
        # ── PyTorch Inference ──
        tensors = [val_transform(f) for f in frames]
        clip = torch.stack(tensors).unsqueeze(0).to(DEVICE)  # (1, 16, 3, 224, 224)

        with torch.no_grad():
            logit = model(clip)
            prob = torch.sigmoid(logit).item()

    return {
        "engagement_score": round(float(prob), 4),
        "is_disengaged": float(prob) < DISENGAGEMENT_THRESHOLD,
        "label": "engaged" if float(prob) >= DISENGAGEMENT_THRESHOLD else "disengaged",
    }


def run_batch_inference(frame_lists: list) -> list:
    """
    Batched inference — processes multiple participants in a single forward pass.
    """
    model = get_model()
    
    if isinstance(model, ort.InferenceSession):
        # ── ONNX Batch Inference ──
        clips = []
        for frames in frame_lists:
            tensors = [numpy_val_transform(f) for f in frames]
            clips.append(np.stack(tensors))
            
        batch = np.stack(clips).astype(np.float32) # (B, 16, 3, 224, 224)
        ort_inputs = {model.get_inputs()[0].name: batch}
        logits = model.run(None, ort_inputs)[0]
        probs = 1.0 / (1.0 + np.exp(-logits))
    else:
        # ── PyTorch Batch Inference ──
        clips = []
        for frames in frame_lists:
            tensors = [val_transform(f) for f in frames]
            clips.append(torch.stack(tensors))

        batch = torch.stack(clips).to(DEVICE)  # (B, 16, 3, 224, 224)

        with torch.no_grad():
            logits = model(batch)              # (B,)
            probs = torch.sigmoid(logits).cpu().numpy()

    return [
        {
            "engagement_score": round(float(p), 4),
            "is_disengaged": float(p) < DISENGAGEMENT_THRESHOLD,
            "label": "engaged" if float(p) >= DISENGAGEMENT_THRESHOLD else "disengaged",
        }
        for p in probs
    ]


# ─── Per-Track Frame Consumer ─────────────────────────────────────────────────

async def consume_video_track(
    track: rtc.Track,
    participant: rtc.RemoteParticipant,
    buffers: Dict[str, ParticipantBuffer],
    round_robin_queue: asyncio.Queue,
):
    """
    Async generator that reads frames from a single participant's video track,
    resizes to 224×224, and queues that participant for inference every
    INFERENCE_INTERVAL_S seconds once SEQ_LEN frames have been collected.
    """
    pid = participant.identity
    buf = ParticipantBuffer(pid)
    buffers[pid] = buf

    video_stream = rtc.VideoStream(track, format=rtc.VideoBufferType.RGB24)

    try:
        async for frame_event in video_stream:
            if not buf.active:
                break

            # Convert LiveKit VideoFrame → numpy RGB (224×224)
            frame = frame_event.frame
            
            # Handle potential stride/padding differences
            # size is len(frame.data), it might be frame.height * frame.width * 3
            np_frame = np.frombuffer(frame.data, dtype=np.uint8)
            
            # Use strict reshape if it perfectly matches, otherwise we might have to use strides
            expected_size = frame.height * frame.width * 3
            if len(np_frame) == expected_size:
                np_frame = np_frame.reshape(frame.height, frame.width, 3)
            else:
                # If padding exists, we need to extract the raw pixels ignoring padding
                logger.warning(f"Frame padding detected: size={len(np_frame)}, expected={expected_size}")
                # A robust fallback if needed, but usually reshape works
                np_frame = np_frame[:expected_size].reshape(frame.height, frame.width, 3)

            np_frame = cv2.resize(np_frame, (224, 224))
            buf.frames.append(np_frame)

            # Queue for inference when buffer is full and interval has elapsed
            now = time.monotonic()
            if (
                len(buf.frames) == SEQ_LEN
                and (now - buf.last_inference) >= INFERENCE_INTERVAL_S
            ):
                buf.last_inference = now
                await round_robin_queue.put(pid)
    except Exception as e:
        logger.error(f"[bot] Critical error in consume_video_track for {pid}: {e}", exc_info=True)


# ─── Round-Robin Inference Worker ────────────────────────────────────────────

async def inference_worker(
    room: rtc.Room,
    buffers: Dict[str, ParticipantBuffer],
    round_robin_queue: asyncio.Queue,
    semaphore: asyncio.Semaphore,
):
    """
    Consumes participant IDs from the queue, runs inference in a thread pool,
    and publishes the result via LiveKit Data Channel (topic="engagement").

    The semaphore caps MAX_CONCURRENT parallel inferences to prevent GPU OOM.
    """
    loop = asyncio.get_event_loop()

    while True:
        pid = await round_robin_queue.get()
        buf = buffers.get(pid)

        if buf is None or not buf.active or len(buf.frames) < SEQ_LEN:
            round_robin_queue.task_done()
            continue

        frames_snapshot = list(buf.frames)  # snapshot before inference

        async with semaphore:
            try:
                logger.info(f"[bot] Starting inference for {pid}...")
                result = await loop.run_in_executor(
                    None, run_inference_sync, frames_snapshot
                )
                logger.info(f"[bot] Inference finished for {pid}.")

                payload = json.dumps({
                    "type": "engagement_update",
                    "participant_id": pid,
                    **result,
                    "ts": int(time.time() * 1000),
                }).encode()

                # Publish to ALL room participants — frontend filters by topic
                await room.local_participant.publish_data(
                    payload,
                    reliable=True,
                    topic="engagement",
                )

                logger.info(
                    f"[{pid}] score={result['engagement_score']:.3f} "
                    f"({'❌' if result['is_disengaged'] else '✅'})"
                )

            except Exception as e:
                logger.error(f"Inference error for participant {pid}: {e}")
            finally:
                round_robin_queue.task_done()


# ─── Main Entrypoint ──────────────────────────────────────────────────────────

async def main():
    """
    Called by dispatch_server.py as a subprocess.
    Connects directly to the LiveKit room using the environment token.
    """
    url = os.environ.get("LIVEKIT_URL")
    token = os.environ.get("LIVEKIT_TOKEN")
    
    if not url or not token:
        logger.error("[bot] Missing LIVEKIT_URL or LIVEKIT_TOKEN")
        return

    room = rtc.Room()
    
    # Pre-load the PyTorch model into memory (and download ResNet weights if needed)
    # BEFORE starting parallel workers to avoid race conditions.
    logger.info("[bot] Initializing and loading PyTorch model...")
    get_model()

    logger.info("[bot] Connecting to LiveKit...")
    await room.connect(url, token)
    logger.info(f"[bot] Joined room: {room.name} on {DEVICE}")

    buffers: Dict[str, ParticipantBuffer] = {}
    round_robin_queue: asyncio.Queue = asyncio.Queue()
    semaphore = asyncio.Semaphore(MAX_CONCURRENT)

    # ── Start 3 parallel inference workers ──
    for _ in range(3):
        asyncio.create_task(
            inference_worker(room, buffers, round_robin_queue, semaphore)
        )

    # ── Subscribe to new tracks ──
    @room.on("track_subscribed")
    def on_track_subscribed(
        track: rtc.Track,
        publication: rtc.TrackPublication,
        participant: rtc.RemoteParticipant,
    ):
        if track.kind == rtc.TrackKind.KIND_VIDEO:
            logger.info(f"[bot] Subscribing to track: {participant.identity}")
            asyncio.create_task(
                consume_video_track(
                    track, participant, buffers, round_robin_queue
                )
            )

    # ── Cleanup on participant disconnect ──
    @room.on("participant_disconnected")
    def on_participant_left(participant: rtc.RemoteParticipant):
        pid = participant.identity
        if pid in buffers:
            buffers[pid].active = False
            del buffers[pid]
            logger.info(f"[bot] Cleaned up buffer for: {pid}")

    # ── Subscribe to tracks that already exist when the bot joins ──
    for participant in room.remote_participants.values():
        for pub in participant.track_publications.values():
            if pub.track and pub.kind == rtc.TrackKind.KIND_VIDEO:
                asyncio.create_task(
                    consume_video_track(
                        pub.track, participant, buffers, round_robin_queue
                    )
                )

    # Keep bot alive until the room closes
    await asyncio.Event().wait()


# ─── Worker Registration ──────────────────────────────────────────────────────

if __name__ == "__main__":
    asyncio.run(main())
