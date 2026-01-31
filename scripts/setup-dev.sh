#!/bin/bash

echo "Setting up Tourist Safety System - Development Environment"
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
if ! command_exists node; then
    echo -e "${RED}Error: Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if Python is installed
if ! command_exists python3; then
    echo -e "${RED}Error: Python3 is not installed. Please install Python3 first.${NC}"
    exit 1
fi

# Check if pip is installed
if ! command_exists pip3; then
    echo -e "${RED}Error: pip3 is not installed. Please install pip3 first.${NC}"
    exit 1
fi

echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to install frontend dependencies${NC}"
    exit 1
fi

echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to install backend dependencies${NC}"
    exit 1
fi
cd ..

echo -e "${YELLOW}Installing AI service dependencies...${NC}"
cd ai-service
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to install AI service dependencies${NC}"
    exit 1
fi
cd ..

echo -e "${YELLOW}Compiling smart contracts...${NC}"
npx hardhat compile
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to compile smart contracts${NC}"
    exit 1
fi

echo
echo -e "${GREEN}Setup completed successfully!${NC}"
echo
echo "To start the system:"
echo "1. Run './start-all.sh' to start all services"
echo "2. Or use individual commands:"
echo "   - Frontend: npm run dev"
echo "   - Backend: cd backend && python3 main.py"
echo "   - AI Service: cd ai-service && python3 app.py"
echo "   - Blockchain: npx hardhat node"
echo
