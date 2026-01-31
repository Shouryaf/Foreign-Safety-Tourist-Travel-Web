@echo off
echo Running Python test...
python simple_test.py
if %errorlevel% neq 0 (
    echo Python script failed with error level %errorlevel%
    python --version
    pip list | findstr "web3 eth"
)
pause
