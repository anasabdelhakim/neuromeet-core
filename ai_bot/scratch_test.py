import numpy as np
import torch
import torchvision.transforms as T
from PIL import Image

def numpy_val_transform(frame: np.ndarray) -> np.ndarray:
    img = frame.astype(np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    img = (img - mean) / std
    return np.transpose(img, (2, 0, 1))

val_transform = T.Compose([
    T.ToPILImage(),
    T.Resize((224, 224)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

frame = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)

np_out = numpy_val_transform(frame)
pt_out = val_transform(frame).numpy()

diff = np.abs(np_out - pt_out).max()
print(f"Max difference: {diff}")
