#!/bin/bash

# Tourist Safety Prototype - Stop Script
echo "🛑 Stopping Tourist Safety Prototype..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to kill process by PID
kill_process() {
    local pid=$1
    local name=$2
    
    if [ -f "$pid" ]; then
        local actual_pid=$(cat "$pid")
        if kill -0 "$actual_pid" 2>/dev/null; then
            echo -e "${YELLOW}Stopping $name (PID: $actual_pid)...${NC}"
            kill "$actual_pid"
            sleep 2
            
            # Force kill if still running
            if kill -0 "$actual_pid" 2>/dev/null; then
                echo -e "${RED}Force killing $name...${NC}"
                kill -9 "$actual_pid"
            fi
            
            echo -e "${GREEN}$name stopped${NC}"
        else
            echo -e "${BLUE}$name was not running${NC}"
        fi
        rm -f "$pid"
    else
        echo -e "${BLUE}No PID file found for $name${NC}"
    fi
}

# Stop services in reverse order
echo -e "${BLUE}Stopping services...${NC}"

# Stop Frontend
kill_process "logs/frontend.pid" "Frontend"

# Stop AI Service
kill_process "logs/ai-service.pid" "AI Service"

# Stop Backend
kill_process "logs/backend.pid" "Backend"

# Stop Hardhat
kill_process "logs/hardhat.pid" "Hardhat Blockchain"

# Stop MongoDB
echo -e "${YELLOW}Stopping MongoDB...${NC}"
if pgrep -x "mongod" > /dev/null; then
    pkill -x "mongod"
    echo -e "${GREEN}MongoDB stopped${NC}"
else
    echo -e "${BLUE}MongoDB was not running${NC}"
fi

# Clean up any remaining processes
echo -e "${BLUE}Cleaning up remaining processes...${NC}"

# Kill any remaining Node.js processes on our ports
for port in 3001 5173; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}Killing process on port $port (PID: $pid)${NC}"
        kill -9 "$pid" 2>/dev/null
    fi
done

# Kill any remaining Python processes on port 8000
pid=$(lsof -ti:8000 2>/dev/null)
if [ ! -z "$pid" ]; then
    echo -e "${YELLOW}Killing AI service on port 8000 (PID: $pid)${NC}"
    kill -9 "$pid" 2>/dev/null
fi

# Kill any remaining Hardhat processes on port 8545
pid=$(lsof -ti:8545 2>/dev/null)
if [ ! -z "$pid" ]; then
    echo -e "${YELLOW}Killing Hardhat on port 8545 (PID: $pid)${NC}"
    kill -9 "$pid" 2>/dev/null
fi

echo -e "${GREEN}✅ All services stopped successfully!${NC}"
echo ""
echo -e "${BLUE}To start again, run: ./start-all.sh${NC}"
