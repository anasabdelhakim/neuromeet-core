"""
model.py — NeuroMeet Engagement Detection Model

Architecture (exactly matches the trained checkpoint):
  Input:  (B, 16, 3, 224, 224)  ← batch × 16 frames × RGB × 224×224
  ResNet50 (layer4 unfrozen) → AdaptiveAvgPool2d(1,1) → flatten
  → (B, 16, 2048)  ← 2048-d feature per frame
  LSTM(input=2048, hidden=256, layers=1, bidirectional=False)
  → last timestep → Dropout(0.6) → Linear(256→1)
  → scalar logit → sigmoid at inference → engagement_prob ∈ [0,1]
"""

import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as T

# ─── ImageNet normalisation constants ─────────────────────────────────────────
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]
SEQ_LEN  = 16
IMG_SIZE = 224

# ─── Inference transform (mirrors the validation transform used during training)
val_transform = T.Compose([
    T.ToPILImage(),
    T.Resize((IMG_SIZE, IMG_SIZE)),
    T.ToTensor(),
    T.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])


class EngagementModel(nn.Module):
    """
    ResNet50 (CNN backbone) + LSTM temporal model for engagement detection.

    freeze_cnn=True  → only train LSTM + head  (fine-tuning phase 1)
    freeze_cnn=False → unfreeze ResNet layer4   (fine-tuning phase 2, production)
    """

    def __init__(self, freeze_cnn: bool = False):
        super().__init__()

        # ── CNN Backbone (ResNet50, pretrained) ──────────────────────────────
        backbone = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)

        # Remove the final FC layer — we only need up to the pooling step
        self.cnn = nn.Sequential(*list(backbone.children())[:-1])   # → (B, 2048, 1, 1)

        if freeze_cnn:
            # Freeze all backbone layers
            for param in self.cnn.parameters():
                param.requires_grad = False
        else:
            # Freeze everything *except* layer4 (fine-tuning)
            for name, param in self.cnn.named_parameters():
                param.requires_grad = "7" in name  # layer4 is children()[7]

        # ── Temporal LSTM ────────────────────────────────────────────────────
        self.lstm = nn.LSTM(
            input_size=2048,
            hidden_size=256,
            num_layers=1,
            batch_first=True,
            bidirectional=False,
        )

        # ── Classification Head ───────────────────────────────────────────────
        self.dropout = nn.Dropout(p=0.6)
        self.classifier = nn.Linear(256, 1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: (B, T, C, H, W)  where T=SEQ_LEN=16

        Returns:
            logits: (B,)  — apply sigmoid externally for probabilities
        """
        B, T, C, H, W = x.shape

        # ── Per-frame CNN features ────────────────────────────────────────────
        # Merge batch and time dims so ResNet sees (B*T, C, H, W)
        x = x.view(B * T, C, H, W)
        features = self.cnn(x)                    # (B*T, 2048, 1, 1)
        features = features.view(B, T, 2048)      # (B,   T,   2048)

        # ── LSTM over the temporal sequence ───────────────────────────────────
        lstm_out, _ = self.lstm(features)         # (B, T, 256)
        last_hidden  = lstm_out[:, -1, :]         # (B, 256) — last timestep only

        # ── Head ──────────────────────────────────────────────────────────────
        out = self.dropout(last_hidden)
        logits = self.classifier(out).squeeze(-1) # (B,)

        return logits
