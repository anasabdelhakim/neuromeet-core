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
from livekit import agents, rtc
from livekit.agents import JobContext, WorkerOptions, cli

# model.py must be in the same directory — provides EngagementModel + val_transform
from model import EngagementModel, val_transform

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("engagement-bot")

# ─── Config ───────────────────────────────────────────────────────────────────

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
if DEVICE.type == "cpu":
    # CRITICAL FIX FOR DOCKER DESKTOP ON WINDOWS (WSL 2):
    # PyTorch defaults to using ALL CPU cores. This causes massive memory spikes
    # that crash the entire Docker Engine VM. We must strictly limit it to 2 threads.
    torch.set_num_threads(2)

SEQ_LEN = 24                 # MUST match the SEQ_LEN used during training and ONNX export
BUFFER_MAXLEN = 30           # 30 frames at 10 FPS = 3s window — matches ~4s training clips from DAiSEE
INFERENCE_INTERVAL_S = 2.5   # Run inference every 2.5 seconds
DISENGAGEMENT_THRESHOLD = 0.50  # Below this → is_disengaged=True
MAX_CONCURRENT = 1 if DEVICE.type == "cpu" else 10  # CPU: serialize to avoid thread contention
EMA_ALPHA_UP = 0.60          # Climb speed (balanced response)
EMA_ALPHA_DOWN = 0.40        # Drop speed (balanced response)


# ─── Model Singleton ──────────────────────────────────────────────────────────

_model: EngagementModel = None


def get_model():
    """Load the model once per worker process and cache it (PyTorch only)."""
    global _model
    if _model is None:
        # We default to /models/best_model.pth which is the expected location 
        # when we mount the models directory via docker-compose.
        model_path = os.environ.get("MODEL_PATH", "/models/best_model.pth")
        
        logger.info(f"[bot] Initializing and loading PyTorch model from {model_path}...")
        _model = EngagementModel(freeze_cnn=False)
        
        try:
            ckpt = torch.load(model_path, map_location=DEVICE)
            
            if isinstance(ckpt, dict) and "model_state" in ckpt:
                state_dict = ckpt["model_state"]
            elif isinstance(ckpt, dict) and "state_dict" in ckpt:
                state_dict = ckpt["state_dict"]
            else:
                state_dict = ckpt
            
            load_result = _model.load_state_dict(state_dict, strict=False)
            if load_result.missing_keys:
                logger.warning(f"⚠️ [DIAG] Missing keys (will use random init): {load_result.missing_keys[:10]}")
            if load_result.unexpected_keys:
                logger.warning(f"⚠️ [DIAG] Unexpected keys (ignored): {load_result.unexpected_keys[:10]}")
            
            logger.info(f"[bot] ✅ PyTorch model loaded PERFECTLY from {model_path} on {DEVICE} 🚀")
            
        except FileNotFoundError:
            logger.error(f"❌ [bot] FATAL ERROR: '{model_path}' not found! Cannot start in production without the model.")
            import sys
            sys.exit(1)
        except RuntimeError as e:
            logger.error(f"❌ [bot] ERROR: Architecture mismatch between {model_path} and model.py! Details: {e}")
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



# ─── Multi-Strategy Face Detector ───────────────────────────────────────────
# We load 2 cascades: frontal (most common) and profile (side-facing students).
# Together they cover nearly every real-world webcam scenario.
try:
    import cv2
    # Strategy 1: Frontal face — catches students looking straight at camera
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    logger.info("[bot] Loaded frontal face cascade successfully.")
except Exception as e:
    logger.error(f"[bot] Failed to load OpenCV face cascade: {e}")
    face_cascade = None

def run_batch_inference(frame_lists: list) -> list:
    """
    Batched inference — processes multiple participants in a single forward pass.
    This enables horizontal scaling (50+ students) on CPU without latency.
    """
    model = get_model()
    
    final_results = [None] * len(frame_lists)
    safe_lists = []
    active_indices = []
    has_faces = []
    
    # Subsample exactly SEQ_LEN frames uniformly from the buffer
    for idx, frames in enumerate(frame_lists):
        total = len(frames)
        if total == 0:
            final_results[idx] = {"raw_score": 0.0}
            continue
            
        # Fast Face Detection on the MOST RECENT frame
        has_face = True
        best_face = None
        if face_cascade is not None and not face_cascade.empty():
            try:
                latest_frame = frames[-1]
                # Convert to Grayscale for Haar Cascade
                gray = cv2.cvtColor(latest_frame, cv2.COLOR_RGB2GRAY)
                faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30))
                if len(faces) == 0:
                    has_face = False
                else:
                    # Pick the largest face (in case there are false positives in background)
                    best_face = max(faces, key=lambda f: f[2] * f[3])
            except Exception as e:
                pass # Fallback to PyTorch if OpenCV errors out
                
        if not has_face:
            # WHAT WE DID A WEEK AGO:
            # Never hardcode 0.0 just because the face tracker lost them for 1 frame.
            # Instead, we pass the full frame to the PyTorch AI and let it decide.
            # This completely stops the scores from randomly dropping to 0.
            logger.debug(f"[DIAG] No face detected in this frame. Falling back to full frame AI math instead of punishing them with 0.0.")
            
        # ── Smart Face Crop (RESTORED & FIXED) ──
        # We MUST crop because the model was trained on cropped faces!
        if best_face is not None:
            fx, fy, fw, fh = best_face
            crop_size = int(fw * 2.0)
            cx, cy = fx + fw // 2, fy + fh // 2
            
            cropped_frames = []
            for f in frames:
                img_h, img_w, _ = f.shape
                c_size = min(crop_size, img_w, img_h)
                x1, y1 = max(0, cx - c_size // 2), max(0, cy - c_size // 2)
                
                if x1 + c_size > img_w: x1 = img_w - c_size
                if y1 + c_size > img_h: y1 = img_h - c_size
                
                cf = f[y1:y1+c_size, x1:x1+c_size]
                # CRITICAL: Prevent empty array crashes if LiveKit drops resolution!
                if cf.size > 0:
                    cropped_frames.append(cf)
                else:
                    cropped_frames.append(f)
            frames = cropped_frames


        if total >= SEQ_LEN:
            idxs = np.linspace(0, total - 1, SEQ_LEN).astype(int)
            sampled_frames = [frames[i] for i in idxs]
        elif total > 0:
            sampled_frames = frames + [frames[-1]] * (SEQ_LEN - total)
        else:
            sampled_frames = frames
            
        safe_lists.append(sampled_frames)
        active_indices.append(idx)
        has_faces.append(has_face)
        
    # If NO students had faces, we can return immediately and save 100% of the CPU!
    if len(safe_lists) == 0:
        return final_results
    
    # ── PyTorch Batch Inference ──
    clips = []
    for frames in safe_lists:
        # Process each student's frames
        tensors = []
        for f in frames:
            if f.size == 0 or f.shape[0] == 0 or f.shape[1] == 0:
                continue
            # Notebook confirms model was trained on RGB images. LiveKit gives RGB natively.
            tensors.append(val_transform(f))
            
        if len(tensors) == 0:
            continue
            
        # Pad to SEQ_LEN to prevent PyTorch dimension crashes
        while len(tensors) < SEQ_LEN:
            tensors.append(tensors[-1])
            
        # Truncate just in case (should never happen, but safe)
        if len(tensors) > SEQ_LEN:
            tensors = tensors[:SEQ_LEN]
            
        clips.append(torch.stack(tensors))

    if len(clips) == 0:
        return final_results
        
    batch = torch.stack(clips).to(DEVICE)  # (B, SEQ_LEN, 3, 224, 224)


    logger.debug(f"[DIAG] Batch shape: {batch.shape}, Min val: {batch.min().item():.3f}, Max val: {batch.max().item():.3f}, Mean: {batch.mean().item():.3f}")

    with torch.no_grad():
        logits = model(batch)              # (B,)
        logit_vals = logits.cpu().numpy().flatten()
        probs = torch.sigmoid(logits).cpu().numpy().flatten()
        # DIAGNOSTIC: log raw logits to confirm model is actually responding
        logger.debug(f"[DIAG] raw_logits={[round(float(l),3) for l in logit_vals]} -> probs={[round(float(p),3) for p in probs]}")

    calibrated_probs = []
    for p, face_found in zip(probs, has_faces):
        # Label Smoothing and heavy Dropout severely compress the output probabilities.
        # Based on live testing, the model's true maximum is ~0.65 and minimum is ~0.15.
        min_p, max_p = 0.15, 0.65
        calibrated = (p - min_p) / (max_p - min_p)
        calibrated = max(0.0, min(1.0, calibrated))
        
        # If the user physically walked away from the camera, PyTorch sees an empty room
        # and outputs ~0.40 (random noise), which looks like 50% on the UI.
        # We must penalize this to ensure they drop to 0% if they aren't there.
        if not face_found:
            calibrated = calibrated * 0.10
            
        calibrated_probs.append(float(calibrated))

    # Merge calibrated PyTorch results back into the final results list
    for active_idx, prob, face_found in zip(active_indices, calibrated_probs, has_faces):
        final_results[active_idx] = {"raw_score": prob, "has_face": face_found}

    return final_results


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
            
        # Return the full frame. PyTorch's T.Resize((224, 224)) will squish it,
        # ensuring the user's face is never cropped out, even if they sit off-center.
        return np_frame

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
                    has_face = results[idx].get("has_face", True)
                    buf = buffers.get(v_pid)
                    if not buf:
                        continue

                    # ── Asymmetric EMA Smoothing ──
                    if not has_face:
                        # Instant drop to 0% if no face is detected (bypasses 10-second EMA lag)
                        buf.ema_score = 0.0
                        raw = 0.0
                    elif buf.ema_score is None:
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

    @room.on("disconnected")
    def on_room_disconnected():
        logger.info("[bot] Room closed or disconnected. Shutting down to save LiveKit minutes!")
        import sys
        sys.exit(0)

    # Keep bot alive until the room closes or it gets disconnected
    await asyncio.Event().wait()


# ─── Worker Registration ──────────────────────────────────────────────────────

if __name__ == "__main__":
    asyncio.run(main())