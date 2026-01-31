@echo off
echo Railway Backend Setup and Launch
echo ================================
echo.

REM Step 1: Install Python dependencies
echo 1. Installing Python dependencies...
pip install fastapi uvicorn motor pymongo pydantic python-dotenv email-validator python-multipart
echo.

REM Step 2: Create MongoDB data directory
echo 2. Setting up MongoDB data directory...
if not exist "data\db" (
    mkdir data\db
    echo Created data\db directory
)

REM Step 3: Start MongoDB in background
echo 3. Starting MongoDB...
start "MongoDB" cmd /c "mongod --dbpath data\db --port 27017"
echo MongoDB started in background on port 27017
echo.

REM Wait a moment for MongoDB to start
echo Waiting for MongoDB to initialize...
timeout /t 5 /nobreak > nul

REM Step 4: Start Railway Backend
echo 4. Starting Railway Backend API...
echo Backend will run on http://localhost:8001
echo.
python app.py

pause
