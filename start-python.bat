@echo off
echo 🐍 Starting Tourist Safety Prototype with Python Backend...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found! Please install Python 3.8+
    pause
    exit /b 1
)

echo ✅ Python found
python --version

REM Check if pip is installed
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip not found! Please install pip
    pause
    exit /b 1
)

echo ✅ pip found

REM Create logs directory
if not exist logs mkdir logs

REM Install Python dependencies
echo 📦 Installing Python dependencies...

REM Install backend dependencies
if exist backend\requirements.txt (
    echo Installing backend dependencies...
    cd backend
    pip install -r requirements.txt
    cd ..
)

REM Install AI service dependencies
if exist ai-service\requirements.txt (
    echo Installing AI service dependencies...
    cd ai-service
    pip install -r requirements.txt
    cd ..
)

REM Check if MongoDB is running
echo 🔍 Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe" >NUL
if errorlevel 1 (
    echo ⚠️ MongoDB not running. Please start MongoDB manually.
    echo You can start it with: mongod --dbpath ./data/db
    pause
)

REM Start Hardhat blockchain network
echo ⛓️ Starting Hardhat blockchain network...
cd contracts
start "Hardhat Blockchain" cmd /k "npx hardhat node"
cd ..

REM Wait for blockchain to start
timeout /t 5 /nobreak >nul

REM Deploy contracts
echo 📄 Deploying smart contracts...
cd contracts
npx hardhat run scripts/deploy.js --network localhost > ..\logs\deploy.log 2>&1
cd ..

REM Extract contract address
for /f "tokens=5" %%a in ('findstr "TouristID deployed to:" logs\deploy.log') do set CONTRACT_ADDRESS=%%a

if "%CONTRACT_ADDRESS%"=="" (
    echo ❌ Failed to get contract address
    pause
    exit /b 1
)

echo ✅ Contract deployed to: %CONTRACT_ADDRESS%

REM Update backend .env with contract address
echo 🔧 Updating backend configuration...
if not exist backend\.env (
    copy backend\env.example backend\.env
)

powershell -Command "(Get-Content backend\.env) -replace 'CONTRACT_ADDRESS=.*', 'CONTRACT_ADDRESS=%CONTRACT_ADDRESS%' | Set-Content backend\.env"

REM Start Python Backend Server
echo 🚀 Starting Python Backend Server (FastAPI)...
cd backend
start "Python Backend" cmd /k "python main.py"
cd ..

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start AI Service
echo 🤖 Starting AI Service (FastAPI)...
cd ai-service
start "AI Service" cmd /k "python main.py"
cd ..

REM Wait for AI service to start
timeout /t 3 /nobreak >nul

REM Start Frontend
echo 🌐 Starting Frontend (React + Vite)...
cd project
start "Frontend" cmd /k "npm run dev"
cd ..

echo.
echo 🎉 Tourist Safety Prototype with Python Backend is now running!
echo.
echo 📊 Services:
echo   🌐 Frontend:     http://localhost:5173 (React + Vite)
echo   🐍 Backend:      http://localhost:3001 (Python FastAPI)
echo   🤖 AI Service:   http://localhost:8000 (Python FastAPI)
echo   ⛓️ Blockchain:    http://localhost:8545 (Hardhat)
echo.
echo 📄 Contract Address: %CONTRACT_ADDRESS%
echo.
echo ✅ Python Backend Benefits:
echo   ✅ Consistent with AI service (same language)
echo   ✅ Better async/await support
echo   ✅ Superior type safety with Pydantic
echo   ✅ Automatic API documentation
echo   ✅ Better performance than Node.js
echo.
echo Press any key to continue...
pause >nul
