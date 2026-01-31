@echo off
echo Setting up Tourist Safety System - Development Environment
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed. Please install Python first.
    pause
    exit /b 1
)

echo Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo Installing backend dependencies...
cd backend
call pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error: Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo Installing AI service dependencies...
cd ai-service
call pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error: Failed to install AI service dependencies
    pause
    exit /b 1
)
cd ..

echo Compiling smart contracts...
call npx hardhat compile
if %errorlevel% neq 0 (
    echo Error: Failed to compile smart contracts
    pause
    exit /b 1
)

echo.
echo Setup completed successfully!
echo.
echo To start the system:
echo 1. Run 'start-all.bat' to start all services
echo 2. Or use individual commands:
echo    - Frontend: npm run dev
echo    - Backend: cd backend && python main.py
echo    - AI Service: cd ai-service && python app.py
echo    - Blockchain: npx hardhat node
echo.
pause
