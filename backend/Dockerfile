# ── Stage 1: Install & Build ──────────────────────────────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy lockfile + manifest first for layer caching
COPY package.json bun.lock ./
RUN bun install

# Copy the rest of the source
COPY . .

# Generate Prisma client (CRITICAL — NestJS imports from lib/prisma/_generated)
RUN bunx prisma generate

# Build the NestJS app (SWC compiler)
RUN bun run build

# Prune dev dependencies for the production image
RUN rm -f bun.lock && bun install --production

# ── Stage 2: Production Runtime (Backend + AI Bot) ────────────────────────────
FROM oven/bun:1 AS runtime
WORKDIR /app

# 1. Install OS dependencies for Python, OpenCV, ONNX Runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-dev \
    python3-pip \
    python3-venv \
    build-essential \
    wget \
    libglib2.0-0 \
    libgl1 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# 2. Setup Python Virtual Environment
ENV VIRTUAL_ENV=/app/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# 3. Install CPU PyTorch first (much smaller/faster than CUDA version)
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# 4. Copy AI Bot code
COPY ai_bot ./ai_bot

# 5. Filter out PyTorch from requirements (since we installed CPU version above) and install the rest
RUN grep -v -E 'torch|torchvision|torchaudio' ai_bot/requirements.txt > ai_bot/requirements_no_torch.txt \
    && pip install --no-cache-dir -r ai_bot/requirements_no_torch.txt

# 6. Copy NestJS build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/lib/prisma/_generated ./lib/prisma/_generated
COPY --from=builder /app/lib/prisma/_migrations ./lib/prisma/_migrations

# 7. Copy startup script
COPY start.sh ./start.sh
RUN chmod +x start.sh

# 8. Environment Variables
ENV NODE_ENV=production
# Prevent AI Bot from trying to find a GPU on Hugging Face CPU instances
ENV CUDA_VISIBLE_DEVICES=""
# Set AI Worker port to local 8080 (NestJS communicates with it on localhost)
ENV AI_WORKER_PORT=8080
# Set AI Worker model path
ENV MODEL_PATH=models/best_model.pth

# Only expose the NestJS port (Hugging Face routes here)
EXPOSE 7860

CMD ["./start.sh"]
