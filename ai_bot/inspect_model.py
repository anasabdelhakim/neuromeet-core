import torch
import pprint
import os

model_path = "/models/best_model.pth"
if not os.path.exists(model_path):
    model_path = "D:/Nile Unvirsity tasks/GRAD_PROJECT_NU/NeuroMeet/ai_bot/models/best_model.pth"

try:
    ckpt = torch.load(model_path, map_location="cpu")
    if isinstance(ckpt, dict) and "model_state" in ckpt:
        state_dict = ckpt["model_state"]
    elif isinstance(ckpt, dict) and "state_dict" in ckpt:
        state_dict = ckpt["state_dict"]
    else:
        state_dict = ckpt
        
    shapes = {k: tuple(v.shape) for k, v in state_dict.items() if "head" in k or "vit.conv_proj" in k}
    pprint.pprint(shapes)
except Exception as e:
    print("Error:", e)
