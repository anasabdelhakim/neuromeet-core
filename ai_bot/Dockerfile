FROM pytorch/pytorch:2.2.0-cuda12.1-cudnn8-runtime

WORKDIR /app

# Install OS-level dependencies for OpenCV headless and ONNX Runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgl1-mesa-glx \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code (model.py must be included in the build context)
COPY . .

# Pre-download PyTorch Vision Transformer weights during Docker build 
# This prevents the 330MB download delay on the first run in production!
RUN python -c "import torchvision.models as models; models.vit_b_16(weights=models.ViT_B_16_Weights.DEFAULT)"

# ── Environment (override in docker-compose or K8s secrets) ──────────────────
ENV MODEL_PATH=models/best_model.pth
ENV LIVEKIT_URL=wss://your-livekit-server
ENV LIVEKIT_API_KEY=devkey
ENV LIVEKIT_API_SECRET=secret
ENV AI_WORKER_PORT=7860

# ── Expose dispatch server port ───────────────────────────────────────────────
EXPOSE 8080

# Start the dispatch server (which spawns bot.py subprocesses per room)
CMD ["uvicorn", "dispatch_server:app", "--host", "0.0.0.0", "--port", "8080"]
