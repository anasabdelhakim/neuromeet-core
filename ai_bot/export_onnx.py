import torch
import os
from model import EngagementModel

def export():
    print("Loading PyTorch model...")
    device = torch.device("cpu")
    model = EngagementModel(freeze_cnn=False)
    
    # Load the PyTorch weights
    ckpt = torch.load("models/best_model.pth", map_location=device)
    state_dict = ckpt["model_state"] if isinstance(ckpt, dict) and "model_state" in ckpt else (ckpt["state_dict"] if isinstance(ckpt, dict) and "state_dict" in ckpt else ckpt)
    
    model.load_state_dict(state_dict)
    model.eval()
    
    print("Exporting to ONNX (this might take a minute)...")
    # Batch size 1, Sequence Length 24, 3 Channels, 224x224
    dummy_input = torch.randn(1, 24, 3, 224, 224)
    
    output_path = "models/engagement.onnx"
    
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
    )
    
    print(f"✅ Successfully exported to {output_path}!")
    print("You can now upload this .onnx file to Hugging Face instead of the .pth file.")

if __name__ == "__main__":
    export()
