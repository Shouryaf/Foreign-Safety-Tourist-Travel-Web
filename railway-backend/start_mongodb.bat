@echo off
echo Starting MongoDB manually...
echo.

REM Create data directory if it doesn't exist
if not exist "data\db" (
    echo Creating MongoDB data directory...
    mkdir data\db
)

REM Try to find MongoDB installation
set MONGODB_PATH=""
if exist "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" (
    set MONGODB_PATH="C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
) else if exist "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" (
    set MONGODB_PATH="C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
) else if exist "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" (
    set MONGODB_PATH="C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe"
) else (
    echo MongoDB not found in standard locations.
    echo Please install MongoDB from: https://www.mongodb.com/try/download/community
    echo Or update the path in this script.
    pause
    exit /b 1
)

echo Starting MongoDB from: %MONGODB_PATH%
echo Data directory: %cd%\data\db
echo.

REM Start MongoDB with local data directory
%MONGODB_PATH% --dbpath "%cd%\data\db" --port 27017

pause
