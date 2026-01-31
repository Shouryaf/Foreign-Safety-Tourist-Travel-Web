#!/bin/bash

# Tourist Safety Prototype - Python Startup Script
echo "🐍 Starting Tourist Safety Prototype with Python Backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if Python is installed
check_python() {
    if command -v python3 &> /dev/null; then
        echo -e "${GREEN}Python 3 found: $(python3 --version)${NC}"
        return 0
    elif command -v python &> /dev/null; then
        echo -e "${GREEN}Python found: $(python --version)${NC}"
        return 0
    else
        echo -e "${RED}Python not found! Please install Python 3.8+${NC}"
        return 1
    fi
}

# Function to check if pip is installed
check_pip() {
    if command -v pip3 &> /dev/null; then
        echo -e "${GREEN}pip3 found${NC}"
        return 0
    elif command -v pip &> /dev/null; then
        echo -e "${GREEN}pip found${NC}"
        return 0
    else
        echo -e "${RED}pip not found! Please install pip${NC}"
        return 1
    fi
}

# Function to install Python dependencies
install_python_deps() {
    echo -e "${BLUE}Installing Python dependencies...${NC}"
    
    # Install backend dependencies
    if [ -f "backend/requirements.txt" ]; then
        echo -e "${YELLOW}Installing backend dependencies...${NC}"
        cd backend
        pip3 install -r requirements.txt || pip install -r requirements.txt
        cd ..
    fi
    
    # Install AI service dependencies
    if [ -f "ai-service/requirements.txt" ]; then
        echo -e "${YELLOW}Installing AI service dependencies...${NC}"
        cd ai-service
        pip3 install -r requirements.txt || pip install -r requirements.txt
        cd ..
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    echo -e "${YELLOW}Waiting for $service_name to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}$service_name is ready!${NC}"
            return 0
        fi
        
        echo -e "${BLUE}Attempt $attempt/$max_attempts - $service_name not ready yet...${NC}"
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}$service_name failed to start within expected time${NC}"
    return 1
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"
check_python || exit 1
check_pip || exit 1

# Create logs directory
mkdir -p logs

# Install dependencies
install_python_deps

# Check if MongoDB is running
echo -e "${BLUE}Checking MongoDB...${NC}"
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${YELLOW}Starting MongoDB...${NC}"
    mongod --dbpath ./data/db --fork --logpath ./logs/mongodb.log
    sleep 3
else
    echo -e "${GREEN}MongoDB is already running${NC}"
fi

# Start Hardhat blockchain network
echo -e "${BLUE}Starting Hardhat blockchain network...${NC}"
cd contracts
npx hardhat node > ../logs/hardhat.log 2>&1 &
HARDHAT_PID=$!
cd ..

# Wait for blockchain to be ready
sleep 5

# Deploy contracts
echo -e "${BLUE}Deploying smart contracts...${NC}"
cd contracts
npx hardhat run scripts/deploy.js --network localhost > ../logs/deploy.log 2>&1
cd ..

# Extract contract address from deployment log
CONTRACT_ADDRESS=$(grep "TouristID deployed to:" logs/deploy.log | cut -d' ' -f5)
if [ -z "$CONTRACT_ADDRESS" ]; then
    echo -e "${RED}Failed to get contract address${NC}"
    exit 1
fi

echo -e "${GREEN}Contract deployed to: $CONTRACT_ADDRESS${NC}"

# Update backend .env with contract address
echo -e "${BLUE}Updating backend configuration...${NC}"
if [ -f "backend/.env" ]; then
    sed -i.bak "s/CONTRACT_ADDRESS=.*/CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" backend/.env
else
    cp backend/env.example backend/.env
    sed -i.bak "s/CONTRACT_ADDRESS=.*/CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" backend/.env
fi

# Start Python Backend Server
echo -e "${BLUE}Starting Python Backend Server (FastAPI)...${NC}"
cd backend
python3 main.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
wait_for_service "http://localhost:3001/health" "Python Backend Server"

# Start AI Service
echo -e "${BLUE}Starting AI Service (FastAPI)...${NC}"
cd ai-service
python3 main.py > ../logs/ai-service.log 2>&1 &
AI_PID=$!
cd ..

# Wait for AI service to be ready
wait_for_service "http://localhost:8000/health" "AI Service"

# Start Frontend
echo -e "${BLUE}Starting Frontend (React + Vite)...${NC}"
cd project
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to be ready
wait_for_service "http://localhost:5173" "Frontend"

# Save PIDs for cleanup
echo $HARDHAT_PID > logs/hardhat.pid
echo $BACKEND_PID > logs/backend.pid
echo $AI_PID > logs/ai-service.pid
echo $FRONTEND_PID > logs/frontend.pid

echo -e "${GREEN}🎉 Tourist Safety Prototype with Python Backend is now running!${NC}"
echo ""
echo -e "${BLUE}Services:${NC}"
echo -e "  ${GREEN}Frontend:${NC}     http://localhost:5173 (React + Vite)"
echo -e "  ${GREEN}Backend:${NC}      http://localhost:3001 (Python FastAPI)"
echo -e "  ${GREEN}AI Service:${NC}   http://localhost:8000 (Python FastAPI)"
echo -e "  ${GREEN}Blockchain:${NC}    http://localhost:8545 (Hardhat)"
echo ""
echo -e "${BLUE}Contract Address:${NC} $CONTRACT_ADDRESS"
echo ""
echo -e "${YELLOW}Python Backend Benefits:${NC}"
echo -e "  ✅ Consistent with AI service (same language)"
echo -e "  ✅ Better async/await support"
echo -e "  ✅ Superior type safety with Pydantic"
echo -e "  ✅ Automatic API documentation"
echo -e "  ✅ Better performance than Node.js"
echo ""
echo -e "${YELLOW}To stop all services, run: ./stop-all.sh${NC}"
echo -e "${YELLOW}To view logs, check the logs/ directory${NC}"
echo ""

# Keep script running
echo -e "${BLUE}Press Ctrl+C to stop all services${NC}"
trap 'echo -e "\n${YELLOW}Stopping all services...${NC}"; ./stop-all.sh; exit' INT

# Wait for user interrupt
while true; do
    sleep 1
done
