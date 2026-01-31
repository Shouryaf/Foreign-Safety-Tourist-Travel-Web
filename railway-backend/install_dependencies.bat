@echo off
echo Installing Railway Backend Dependencies...
echo.

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install core dependencies
echo Installing FastAPI and Uvicorn...
pip install fastapi==0.104.1 uvicorn==0.24.0

echo Installing MongoDB drivers...
pip install motor==3.3.2 pymongo==4.6.0

echo Installing Pydantic and validation...
pip install pydantic==2.5.0 email-validator==2.1.0

echo Installing environment and security...
pip install python-dotenv==1.0.0 python-multipart==0.0.6

echo Installing authentication...
pip install bcrypt==4.1.2 python-jose[cryptography]==3.3.0 passlib[bcrypt]==1.7.4

echo Installing additional utilities...
pip install aiofiles==23.2.1 httpx==0.25.2 python-dateutil==2.8.2 jinja2==3.1.2

echo.
echo Dependencies installed successfully!
echo.
echo To start the railway backend:
echo 1. Ensure MongoDB is running
echo 2. Run: python app.py
echo.
pause
