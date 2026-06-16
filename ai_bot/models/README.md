# Place your trained model checkpoint here.
# The file must be named: best_model.pth
#
# Expected checkpoint format (torch.save):
#   {
#       "model_state": model.state_dict(),   # required
#       "epoch": int,                        # optional
#       "val_acc": float,                    # optional
#   }
#
# The MODEL_PATH environment variable (default: /models/best_model.pth)
# points the ai-worker container to this file.
