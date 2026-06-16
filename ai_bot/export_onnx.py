"""
export_onnx.py — Convert PyTorch EngagementModel to ONNX format

Usage:
  python export_onnx.py --checkpoint /models/best_model.pth --output /models/engagement.onnx

This strips all PyTorch training overhead (autograd graphs, optimizer state,
gradient tracking) and produces a pure inference-optimized ONNX file.

Performance gains:
  - ONNX Runtime on CPU: ~2-3x faster than PyTorch
  - ONNX Runtime on CUDA: ~2x faster (no Python GIL overhead)
  - ONNX → TensorRT (NVIDIA): ~5-10x faster (future step)
"""

import argparse
import os

import torch
from model import EngagementModel, SEQ_LEN, IMG_SIZE


def export(checkpoint_path: str, output_path: str, opset: int = 17):
    print(f"[export] Loading checkpoint: {checkpoint_path}")

    model = EngagementModel(freeze_cnn=False)

    if os.path.exists(checkpoint_path):
        ckpt = torch.load(checkpoint_path, map_location="cpu")
        model.load_state_dict(ckpt["model_state"])
        print("[export] Loaded trained weights")
    else:
        print(f"[export] WARNING: {checkpoint_path} not found — exporting with random weights")

    model.eval()

    # Dummy input matching the model's expected shape: (batch, seq_len, channels, height, width)
    dummy_input = torch.randn(1, SEQ_LEN, 3, IMG_SIZE, IMG_SIZE)

    print(f"[export] Exporting ONNX (opset {opset}) → {output_path}")
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        opset_version=opset,
        input_names=["video_clip"],
        output_names=["logit"],
        dynamic_axes={
            "video_clip": {0: "batch_size"},   # Allow variable batch sizes
            "logit": {0: "batch_size"},
        },
    )

    # Verify the exported model
    import onnx
    onnx_model = onnx.load(output_path)
    onnx.checker.check_model(onnx_model)

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"[export] ✅ ONNX model exported and verified ({size_mb:.1f} MB)")
    print(f"[export] Input shape:  (batch, {SEQ_LEN}, 3, {IMG_SIZE}, {IMG_SIZE})")
    print(f"[export] Output shape: (batch,)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export EngagementModel to ONNX")
    parser.add_argument(
        "--checkpoint", default="/models/best_model.pth",
        help="Path to the PyTorch checkpoint (.pth)",
    )
    parser.add_argument(
        "--output", default="/models/engagement.onnx",
        help="Output path for the ONNX model",
    )
    parser.add_argument(
        "--opset", type=int, default=17,
        help="ONNX opset version",
    )
    args = parser.parse_args()
    export(args.checkpoint, args.output, args.opset)
