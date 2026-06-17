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

class ViTBackbone(nn.Module):
    """Wrapper to match the exact 'backbone.vit' key structure in best_model.pth"""
    def __init__(self):
        super().__init__()
        # Load standard ViT-Base 16
        self.vit = models.vit_b_16(weights=None)
        # Remove the classification head because we only want the raw 768-dim features
        self.vit.heads = nn.Identity()
        
    def forward(self, x):
        return self.vit(x)

class EngagementHead(nn.Module):
    """Wrapper to match the exact 'head.lstm' and 'head.fc' structure"""
    def __init__(self, input_dim=768, hidden_dim=96, num_layers=1):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=input_dim, 
            hidden_size=hidden_dim, 
            num_layers=num_layers, 
            batch_first=True
        )
        self.fc = nn.Linear(hidden_dim, 1)
        
    def forward(self, x):
        # x is (B, T, 768)
        lstm_out, _ = self.lstm(x)
        # We only care about the prediction after seeing the entire sequence
        last_hidden = lstm_out[:, -1, :] # (B, 96)
        out = self.fc(last_hidden)       # (B, 1)
        return out

class EngagementModel(nn.Module):
    """
    Vision Transformer (ViT Base) + LSTM temporal model for engagement detection.
    This exactly matches the architecture of the provided best_model.pth!
    """
    def __init__(self, freeze_cnn: bool = False):
        super().__init__()

        self.backbone = ViTBackbone()
        self.head = EngagementHead(input_dim=768, hidden_dim=96)

        if freeze_cnn:
            # Freeze all backbone layers if requested
            for param in self.backbone.parameters():
                param.requires_grad = False

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: (B, T, C, H, W)  where T=SEQ_LEN=16
        Returns:
            logits: (B,)  — apply sigmoid externally for probabilities
        """
        B, T, C, H, W = x.shape

        # ── Per-frame ViT features ────────────────────────────────────────────
        # Merge batch and time dims so ViT sees (B*T, C, H, W)
        x = x.view(B * T, C, H, W)
        
        # Pass all frames through the Vision Transformer -> returns (B*T, 768)
        features = self.backbone(x)
        
        # Reshape them back into a time sequence for the LSTM -> (B, T, 768)
        features = features.view(B, T, 768)

        # ── LSTM Head ─────────────────────────────────────────────────────────
        logits = self.head(features).squeeze(-1) # (B,)

        return logits
