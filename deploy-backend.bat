@echo off
echo ========================================================
echo Deploying Backend to Hugging Face (History-Free Mode)
echo ========================================================

echo 1. Cleaning up old temp directories...
if exist deploy_temp rmdir /s /q deploy_temp

echo 2. Copying backend folder to temporary directory...
mkdir deploy_temp
robocopy backend deploy_temp /E /NFL /NDL /XD node_modules dist _generated >nul

echo 3. Initializing fresh Git repository (removing old history)...
cd deploy_temp
git init >nul
git checkout -b main >nul
git add . >nul
git commit -m "Deploy Backend to Hugging Face" >nul

echo 4. Force pushing directly to Hugging Face...
git push https://huggingface.co/spaces/forgien5252/neuromeet-api main --force

echo 5. Cleaning up...
cd ..
rmdir /s /q deploy_temp

echo ========================================================
echo Deployment Complete! Check Hugging Face for the build.
echo ========================================================
pause
