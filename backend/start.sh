#!/bin/sh

echo "Applying NestJS database schema..."
bunx prisma db push --accept-data-loss

echo "Downloading AI model weights..."
mkdir -p ai_bot/models
MODEL_FILE="ai_bot/models/best_model.pth"
MODEL_URL="https://huggingface.co/datasets/forgien5252/neuromeet-models/resolve/main/best_model.pth"

if [ ! -f "$MODEL_FILE" ]; then
    echo "  -> Downloading best_model.pth from Hugging Face Dataset..."
    wget -q --show-progress -O "$MODEL_FILE" "$MODEL_URL"
    echo "  -> Download complete!"
else
    echo "  -> Model already exists, skipping download."
fi

echo "Starting Python AI Bot in background..."
cd ai_bot
uvicorn dispatch_server:app --host 127.0.0.1 --port 8080 &
cd ..

echo "Starting NestJS Server..."
bun dist/main.js
