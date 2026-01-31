@echo off
echo Testing Tourist Safety System Components
echo.

echo Testing smart contracts...
call npx hardhat test
if %errorlevel% neq 0 (
    echo Error: Smart contract tests failed
    pause
    exit /b 1
)

echo.
echo Testing backend API...
cd backend
python -m pytest test_api.py -v
if %errorlevel% neq 0 (
    echo Warning: Backend tests not found or failed
)
cd ..

echo.
echo Testing AI service...
cd ai-service
python -m pytest test_ai.py -v
if %errorlevel% neq 0 (
    echo Warning: AI service tests not found or failed
)
cd ..

echo.
echo All available tests completed!
pause
