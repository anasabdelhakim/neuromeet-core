@echo off
echo ========================================================
echo Deploying Backend to Hugging Face
echo ========================================================

echo 1. Cleaning up old deployment branches...
git branch -D hf-backend-only >nul 2>&1

echo 2. Extracting only the backend folder...
git subtree split --prefix backend -b hf-backend-only

echo 3. Force pushing directly to Hugging Face...
git push huggingface hf-backend-only:main --force

echo ========================================================
echo Deployment Complete! Check Hugging Face for the build.
echo ========================================================
pause
