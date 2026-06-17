@echo off
echo ========================================================
echo Deploying AI Bot to Hugging Face
echo ========================================================

echo 1. Cleaning up old deployment branches...
git branch -D hf-ai-only >nul 2>&1

echo 2. Extracting only the ai_bot folder...
git subtree split --prefix ai_bot -b hf-ai-only

echo 3. Force pushing directly to Hugging Face AI Space...
REM Make sure to replace "huggingface-ai" with the correct remote name for your new Space!
git push huggingface-ai hf-ai-only:main --force

echo ========================================================
echo Deployment Complete! Check Hugging Face for the build.
echo ========================================================
pause
