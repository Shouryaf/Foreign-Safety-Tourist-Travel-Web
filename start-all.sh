#!/bin/bash

# Tourist Safety Prototype - Startup Script
echo "🚀 Starting Tourist Safety Prototype..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}Port $1 is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}Port $1 is available${NC}"
        return 0
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

# Check if required ports are available
echo -e "${BLUE}Checking port availability...${NC}"
check_port 3001 || exit 1
check_port 8000 || exit 1
check_port 5173 || exit 1
check_port 8545 || exit 1

# Start MongoDB (if not running)
echo -e "${BLUE}Starting MongoDB...${NC}"
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
sed -i.bak "s/CONTRACT_ADDRESS=.*/CONTRACT_ADDRESS=$CONTRACT_ADDRESS/" backend/.env

# Start Backend Server
echo -e "${BLUE}Starting Backend Server (Python FastAPI)...${NC}"
cd backend
python main.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
wait_for_service "http://localhost:3001/api/health" "Backend Server"

# Start AI Service
echo -e "${BLUE}Starting AI Service...${NC}"
cd ai-service
python main.py > ../logs/ai-service.log 2>&1 &
AI_PID=$!
cd ..

# Wait for AI service to be ready
wait_for_service "http://localhost:8000/health" "AI Service"

# Start Frontend
echo -e "${BLUE}Starting Frontend...${NC}"
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

# Create logs directory if it doesn't exist
mkdir -p logs

echo -e "${GREEN}🎉 Tourist Safety Prototype is now running!${NC}"
echo ""
echo -e "${BLUE}Services:${NC}"
echo -e "  ${GREEN}Frontend:${NC}     http://localhost:5173"
echo -e "  ${GREEN}Backend:${NC}      http://localhost:3001"
echo -e "  ${GREEN}AI Service:${NC}   http://localhost:8000"
echo -e "  ${GREEN}Blockchain:${NC}    http://localhost:8545"
echo ""
echo -e "${BLUE}Contract Address:${NC} $CONTRACT_ADDRESS"
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
