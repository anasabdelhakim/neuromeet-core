import asyncio
import json
import logging
import math
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
SEQ_LEN = 24                 # MUST match the SEQ_LEN used during training and ONNX export
BUFFER_MAXLEN = 30           # 30 frames at 10 FPS = 3s window — matches ~4s training clips from DAiSEE
INFERENCE_INTERVAL_S = 5.0   # Run inference every N seconds — set above CPU inference time to avoid queue buildup
DISENGAGEMENT_THRESHOLD = 0.50  # Below this → is_disengaged=True
MAX_CONCURRENT = 1 if DEVICE.type == "cpu" else 10  # CPU: serialize to avoid thread contention
EMA_ALPHA_UP = 0.70          # Allow scores to climb at a reasonable pace (was 0.55 — too slow to recover)
EMA_ALPHA_DOWN = 0.75        # Keep disengagement detection responsive but not punishing (was 0.85)


# ─── Model Singleton ──────────────────────────────────────────────────────────

_model: EngagementModel = None


def get_model():
    """Load the model once per worker process and cache it. Supports PyTorch & ONNX."""
    global _model
    if _model is None:
        model_path = os.environ.get("MODEL_PATH", "/models/engagement.onnx")  # Default to ONNX for production speed
        
        if model_path.endswith(".onnx"):
            logger.info(f"[bot] Loading ONNX model from {model_path}...")
            providers = ['CUDAExecutionProvider', 'CPUExecutionProvider'] if DEVICE.type == "cuda" else ['CPUExecutionProvider']
            try:
                # ── ONNX Runtime CPU Tuning ──
                sess_options = ort.SessionOptions()
                sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
                cpu_count = os.cpu_count() or 2
                sess_options.intra_op_num_threads = cpu_count  # Parallelize within ops (matmul, conv)
                sess_options.inter_op_num_threads = 1          # Serialize between ops (we handle concurrency ourselves)
                sess_options.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
                _model = ort.InferenceSession(model_path, sess_options=sess_options, providers=providers)
                logger.info(f"[bot] ONNX model loaded with providers: {_model.get_providers()}, threads: intra={cpu_count}, inter=1")
            except Exception as e:
                logger.warning(f"⚠️ [bot] Failed to load ONNX model ({e}). Falling back to PyTorch best_model.pth...")
                # Fallback to PyTorch instead of random weights
                _model = EngagementModel(freeze_cnn=False)
                try:
                    ckpt = torch.load("models/best_model.pth", map_location=DEVICE)
                    state_dict = ckpt["model_state"] if isinstance(ckpt, dict) and "model_state" in ckpt else (ckpt["state_dict"] if isinstance(ckpt, dict) and "state_dict" in ckpt else ckpt)
                    _model.load_state_dict(state_dict)
                    logger.info("[bot] Successfully loaded PyTorch fallback from models/best_model.pth!")
                except Exception as p_err:
                    logger.warning(f"⚠️ [bot] Failed to load PyTorch fallback ({p_err}). NOW using random weights as a last resort! ⚠️")
                _model.to(DEVICE).eval()
        else:
            # We are running on CPU. Let PyTorch use all available threads
            # to process the massive Vision Transformer quickly.
            # (Removed set_num_threads(1) so it doesn't freeze the CPU)
            _model = EngagementModel(freeze_cnn=False)
            try:
                ckpt = torch.load(model_path, map_location=DEVICE)
                
                # Kaggle models could be saved as a raw state_dict or inside a dictionary
                if isinstance(ckpt, dict) and "model_state" in ckpt:
                    state_dict = ckpt["model_state"]
                elif isinstance(ckpt, dict) and "state_dict" in ckpt:
                    state_dict = ckpt["state_dict"]
                else:
                    state_dict = ckpt # Assume it's the raw state_dict
                
                # ── DIAGNOSTIC: Log checkpoint keys summary ──
                logger.info(f"[DIAG] Checkpoint type: {type(ckpt)}")
                if isinstance(ckpt, dict):
                    logger.info(f"[DIAG] Checkpoint top-level keys: {list(ckpt.keys())}")
                logger.info(f"[DIAG] State dict has {len(state_dict)} keys")
                logger.info(f"[DIAG] First 5 state_dict keys: {list(state_dict.keys())[:5]}")
                
                # Check if ViT backbone weights are actually present
                backbone_keys = [k for k in state_dict.keys() if 'backbone' in k]
                head_keys = [k for k in state_dict.keys() if 'head' in k]
                logger.info(f"[DIAG] backbone keys count={len(backbone_keys)}, head keys count={len(head_keys)}")
                if len(backbone_keys) == 0:
                    logger.error("❌ [DIAG] NO BACKBONE KEYS IN CHECKPOINT! ViT will use random weights → expect 15-30% scores!")
                
                # Use strict=False so we can detect missing keys without crashing
                load_result = _model.load_state_dict(state_dict, strict=False)
                if load_result.missing_keys:
                    logger.warning(f"⚠️ [DIAG] Missing keys (will use random init): {load_result.missing_keys[:10]}")
                if load_result.unexpected_keys:
                    logger.warning(f"⚠️ [DIAG] Unexpected keys (ignored): {load_result.unexpected_keys[:10]}")
                
                if not load_result.missing_keys and not load_result.unexpected_keys:
                    logger.info(f"[bot] ✅ PyTorch model loaded PERFECTLY from {model_path} on {DEVICE} 🚀")
                else:
                    logger.warning(f"[bot] ⚠️ Model loaded with mismatches — scores will be degraded!")
                
            except FileNotFoundError:
                logger.warning(f"⚠️ [bot] WARNING: '{model_path}' not found! Running with randomly initialized weights for testing. ⚠️")
            except RuntimeError as e:
                logger.error(f"❌ [bot] ERROR: Architecture mismatch between best_model.pth and model.py! Details: {e}")
                logger.warning("Running with randomly initialized weights as a fallback.")
            except Exception as e:
                logger.error(f"❌ [bot] Unexpected error loading PyTorch model: {e}")

            _model.to(DEVICE).eval()
    return _model


# ─── Per-Participant Frame Buffer ─────────────────────────────────────────────

class ParticipantBuffer:
    def __init__(self, participant_id: str):
        self.participant_id = participant_id
        self.frames: deque = deque(maxlen=BUFFER_MAXLEN)  # Sliding window — always holds the latest BUFFER_MAXLEN frames
        self.last_inference: float = 0.0
        self.active: bool = True
        self.is_inferring: bool = False
        self.last_frame_time: float = 0.0  # Used for frame rate throttling
        self.ema_score: float | None = None  # Exponential Moving Average of engagement score
        self.display_name: str = participant_id



# Calibrate probability removed to avoid artificial inflation of scores.

def run_batch_inference(frame_lists: list) -> list:
    """
    Batched inference — processes multiple participants in a single forward pass.
    This enables horizontal scaling (50+ students) on CPU without latency.
    """
    model = get_model()
    
    # Subsample exactly SEQ_LEN frames uniformly from the buffer
    safe_lists = []
    for frames in frame_lists:
        total = len(frames)
        if total >= SEQ_LEN:
            idxs = np.linspace(0, total - 1, SEQ_LEN).astype(int)
            sampled_frames = [frames[i] for i in idxs]
        elif total > 0:
            sampled_frames = frames + [frames[-1]] * (SEQ_LEN - total)
        else:
            sampled_frames = frames
        safe_lists.append(sampled_frames)
    
    if isinstance(model, ort.InferenceSession):
        # ── ONNX Batch Inference ──
        clips = []
        for frames in safe_lists:
            tensors = [numpy_val_transform(f) for f in frames]
            clips.append(np.stack(tensors))
            
        batch = np.stack(clips).astype(np.float32) # (B, SEQ_LEN, 3, 224, 224)
        ort_inputs = {model.get_inputs()[0].name: batch}
        logits = model.run(None, ort_inputs)[0]
        probs = 1.0 / (1.0 + np.exp(-logits))
        probs = probs.flatten()
    else:
        # ── PyTorch Batch Inference ──
        clips = []
        for frames in safe_lists:
            tensors = [val_transform(f) for f in frames]
            clips.append(torch.stack(tensors))

        batch = torch.stack(clips).to(DEVICE)  # (B, SEQ_LEN, 3, 224, 224)
        
        logger.info(f"[DIAG] Batch shape: {batch.shape}, Min val: {batch.min().item():.3f}, Max val: {batch.max().item():.3f}, Mean: {batch.mean().item():.3f}")

        with torch.no_grad():
            logits = model(batch)              # (B,)
            logit_vals = logits.cpu().numpy().flatten()
            probs = torch.sigmoid(logits).cpu().numpy().flatten()
            # DIAGNOSTIC: log raw logits to confirm model is actually responding
            logger.info(f"[DIAG] raw_logits={[round(float(l),3) for l in logit_vals]} -> probs={[round(float(p),3) for p in probs]}")

    return [{"raw_score": float(p)} for p in probs]


# ─── Per-Track Frame Consumer ─────────────────────────────────────────────────

async def consume_video_track(
    track: rtc.Track,
    participant: rtc.RemoteParticipant,
    buffers: Dict[str, ParticipantBuffer],
    round_robin_queue: asyncio.Queue,
):
    """
    Async task that reads frames from a participant's video track.

    KEY DESIGN DECISIONS for network stability:
    1. Heavy numpy/cv2 work (frombuffer + resize) is offloaded to a thread pool
       executor so it never blocks the asyncio event loop. Blocking the loop
       would stall LiveKit's WebRTC packet processing, causing the network
       degradation seen when multiple students join.
    2. We throttle to ~2 FPS (one frame every 0.5s) for buffer collection.
       At 2 FPS, 24 frames = 12 seconds of video coverage, which matches the
       training data clip length (24 frames uniformly sampled from ~2s clips).
    3. The deque uses maxlen=SEQ_LEN so it is always a sliding window of the
       most recent frames. We never call .clear() — inference can happen as
       soon as SEQ_LEN frames exist and the interval elapses.
    """
    pid = participant.identity
    display_name = participant.name or participant.identity
    buf = ParticipantBuffer(pid)
    buf.display_name = display_name
    buffers[pid] = buf

    loop = asyncio.get_event_loop()
    video_stream = rtc.VideoStream(track, format=rtc.VideoBufferType.RGB24)

    def _decode_frame(data_bytes: bytes, width: int, height: int):
        """Pure CPU bound, no LiveKit objects, no C++ locks."""
        np_frame = np.frombuffer(data_bytes, dtype=np.uint8)
        expected = height * width * 3
        if len(np_frame) == expected:
            np_frame = np_frame.reshape(height, width, 3)
        else:
            logger.warning(f"Frame padding: got {len(np_frame)}, expected {expected}")
            np_frame = np_frame[:expected].reshape(height, width, 3)
            
        # CRITICAL ML FIX: Never squish the aspect ratio!
        # Center-crop the image to a perfect square first, then let val_transform resize it.
        # This ensures faces remain proportional (not tall/thin) across different laptops.
        sz = min(width, height)
        y = (height - sz) // 2
        x = (width - sz) // 2
        square_frame = np_frame[y:y+sz, x:x+sz]
        
        return square_frame

    try:
        async for frame_event in video_stream:
            if not buf.active:
                break

            now_t = time.monotonic()

            # Throttle to ~10 FPS to match training clip temporal density.
            # Training: 24 frames from ~4s clips at 30 FPS ≈ 1 sample per 0.17s (6 FPS seen by LSTM).
            # At 10 FPS capture + 30-frame buffer: 24 from 30 ≈ 1 sample per 0.13s — much closer match.
            if now_t - buf.last_frame_time < 0.1:
                continue
            buf.last_frame_time = now_t

            # Extract raw bytes IN THE MAIN THREAD. 
            # Passing `frame_event.frame` directly to a thread pool blocks LiveKit's C++ WebRTC loop via the GIL!
            data_bytes = memoryview(frame_event.frame.data).tobytes()
            w, h = frame_event.frame.width, frame_event.frame.height

            # Offload decode+resize to thread pool — purely CPU bound now
            decoded = await loop.run_in_executor(None, _decode_frame, data_bytes, w, h)
            buf.frames.append(decoded)

            # Queue for inference as soon as we have SEQ_LEN real frames (not waiting for
            # the full BUFFER_MAXLEN). This prevents the 12-second frozen-face startup bias.
            if (
                len(buf.frames) >= SEQ_LEN
                and (now_t - buf.last_inference) >= INFERENCE_INTERVAL_S
                and not buf.is_inferring
            ):
                buf.is_inferring = True
                await round_robin_queue.put(pid)

    except Exception as e:
        logger.error(f"[bot] Error in consume_video_track for {pid}: {e}", exc_info=True)


# ─── Round-Robin Inference Worker ────────────────────────────────────────────

async def inference_worker(
    room: rtc.Room,
    buffers: Dict[str, ParticipantBuffer],
    round_robin_queue: asyncio.Queue,
    semaphore: asyncio.Semaphore,
):
    """
    Consumes participant IDs from the queue, runs batched inference in a thread pool,
    and publishes the result via LiveKit Data Channel (topic="engagement").

    The semaphore caps MAX_CONCURRENT parallel inferences. Dynamic batching
    allows 1 inference pass to score multiple students, dropping latency to zero.
    """
    loop = asyncio.get_event_loop()

    while True:
        pids = []
        # Block until at least one is available
        pid = await round_robin_queue.get()
        pids.append(pid)
        
        # Drain the queue up to a max batch size
        max_batch = 16 if DEVICE.type == "cpu" else 64
        while len(pids) < max_batch:
            try:
                pids.append(round_robin_queue.get_nowait())
            except asyncio.QueueEmpty:
                break
                
        valid_pids = []
        frame_lists = []
        display_names = []
        
        for p in pids:
            buf = buffers.get(p)
            if buf is None or not buf.active or len(buf.frames) < SEQ_LEN:
                round_robin_queue.task_done()
                if buf:
                    buf.is_inferring = False
                continue
                
            valid_pids.append(p)
            frame_lists.append(list(buf.frames))  # Snapshot the sliding window
            display_names.append(getattr(buf, 'display_name', p))
            
        if not valid_pids:
            continue

        async with semaphore:
            try:
                # ── Batched Inference ──
                results = await loop.run_in_executor(
                    None, run_batch_inference, frame_lists
                )

                for idx, v_pid in enumerate(valid_pids):
                    raw = results[idx]["raw_score"]
                    buf = buffers.get(v_pid)
                    if not buf:
                        continue

                    # ── Asymmetric EMA Smoothing ──
                    if buf.ema_score is None:
                        buf.ema_score = raw
                    else:
                        # Use a dynamic alpha: drop fast, climb slow
                        alpha = EMA_ALPHA_DOWN if raw < buf.ema_score else EMA_ALPHA_UP
                        buf.ema_score = alpha * raw + (1 - alpha) * buf.ema_score

                    smoothed = round(buf.ema_score, 4)
                    is_disengaged = smoothed < DISENGAGEMENT_THRESHOLD

                    payload = json.dumps({
                        "type": "engagement_update",
                        "participant_id": v_pid,
                        "participant_name": display_names[idx],
                        "engagement_score": smoothed,
                        "is_disengaged": is_disengaged,
                        "label": "disengaged" if is_disengaged else "engaged",
                        "ts": int(time.time() * 1000),
                    }).encode()

                    await room.local_participant.publish_data(
                        payload,
                        reliable=True,
                        topic="engagement",
                    )

                    logger.info(
                        f"[{display_names[idx]}] raw={raw:.3f} smoothed={smoothed:.3f} "
                        f"({'❌' if is_disengaged else '✅'})"
                    )

            except Exception as e:
                logger.error(f"Batched inference error for pids {valid_pids}: {e}", exc_info=True)
            finally:
                for v_pid in valid_pids:
                    buf = buffers.get(v_pid)
                    if buf:
                        buf.last_inference = time.monotonic()
                        buf.is_inferring = False
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

    # ── Start inference workers ──
    # CPU: 1 worker to avoid thread contention in ONNX Runtime
    # GPU: 3 workers to pipeline inference while frames are being collected
    num_workers = 1 if DEVICE.type == "cpu" else 3
    logger.info(f"[bot] Starting {num_workers} inference worker(s) on {DEVICE}")
    for _ in range(num_workers):
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
            is_instructor = False
            try:
                if participant.metadata:
                    meta = json.loads(participant.metadata)
                    if meta.get("role") == "INSTRUCTOR":
                        is_instructor = True
            except Exception:
                pass

            if is_instructor:
                logger.info(f"[bot] Ignoring instructor track: {participant.identity}")
                return

            if getattr(track, "name", "") == "screen":
                logger.info(f"[bot] Ignoring screen share track: {participant.identity}")
                return

            logger.info(f"[bot] Subscribing to student camera track: {participant.identity}")
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
        is_instructor = False
        try:
            if participant.metadata:
                meta = json.loads(participant.metadata)
                if meta.get("role") == "INSTRUCTOR":
                    is_instructor = True
        except Exception:
            pass

        if is_instructor:
            continue

        for pub in participant.track_publications.values():
            if pub.track and pub.kind == rtc.TrackKind.KIND_VIDEO:
                if getattr(pub.track, "name", "") == "screen":
                    continue
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
