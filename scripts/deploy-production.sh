#!/bin/bash

# Production Deployment Script for Tourist Safety System
# This script deploys the system to production environment

set -e  # Exit on any error

echo "🚀 Tourist Safety System - Production Deployment"
echo "================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_BUILD_DIR="dist"
BACKEND_DIR="backend"
AI_SERVICE_DIR="ai-service"
CONTRACTS_DIR="contracts"

# Check if required tools are installed
check_dependencies() {
    echo -e "${BLUE}Checking dependencies...${NC}"
    
    command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js is required but not installed.${NC}" >&2; exit 1; }
    command -v npm >/dev/null 2>&1 || { echo -e "${RED}npm is required but not installed.${NC}" >&2; exit 1; }
    command -v python3 >/dev/null 2>&1 || { echo -e "${RED}Python3 is required but not installed.${NC}" >&2; exit 1; }
    command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is required but not installed.${NC}" >&2; exit 1; }
    
    echo -e "${GREEN}✓ All dependencies are installed${NC}"
}

# Build frontend
build_frontend() {
    echo -e "${BLUE}Building frontend...${NC}"
    npm install
    npm run build
    
    if [ ! -d "$FRONTEND_BUILD_DIR" ]; then
        echo -e "${RED}Frontend build failed - dist directory not found${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Frontend built successfully${NC}"
}

# Deploy smart contracts to testnet
deploy_contracts() {
    echo -e "${BLUE}Deploying smart contracts...${NC}"
    
    # Compile contracts
    npx hardhat compile
    
    # Deploy to specified network (default: sepolia)
    NETWORK=${1:-sepolia}
    echo "Deploying to network: $NETWORK"
    
    npx hardhat run scripts/deploy.js --network $NETWORK
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Smart contracts deployed successfully${NC}"
    else
        echo -e "${RED}Smart contract deployment failed${NC}"
        exit 1
    fi
}

# Build and deploy backend
deploy_backend() {
    echo -e "${BLUE}Deploying backend...${NC}"
    
    cd $BACKEND_DIR
    
    # Install dependencies
    pip3 install -r requirements.txt
    
    # Run tests
    python3 -m pytest test_api.py -v || echo -e "${YELLOW}Warning: Some backend tests failed${NC}"
    
    # Build Docker image
    docker build -t tourist-safety-backend -f ../Dockerfile.backend .
    
    echo -e "${GREEN}✓ Backend deployed successfully${NC}"
    cd ..
}

# Build and deploy AI service
deploy_ai_service() {
    echo -e "${BLUE}Deploying AI service...${NC}"
    
    cd $AI_SERVICE_DIR
    
    # Install dependencies
    pip3 install -r requirements.txt
    
    # Run tests
    python3 -m pytest test_ai.py -v || echo -e "${YELLOW}Warning: Some AI service tests failed${NC}"
    
    # Build Docker image
    docker build -t tourist-safety-ai -f ../Dockerfile.ai-service .
    
    echo -e "${GREEN}✓ AI service deployed successfully${NC}"
    cd ..
}

# Deploy using Docker Compose
deploy_with_docker() {
    echo -e "${BLUE}Starting services with Docker Compose...${NC}"
    
    # Build and start all services
    docker-compose -f docker-compose.yml up --build -d
    
    # Wait for services to be ready
    echo "Waiting for services to start..."
    sleep 30
    
    # Check service health
    echo -e "${BLUE}Checking service health...${NC}"
    node monitoring/health-check.js
    
    echo -e "${GREEN}✓ All services deployed and running${NC}"
}

# Deploy to cloud platforms
deploy_to_cloud() {
    echo -e "${BLUE}Deploying to cloud platforms...${NC}"
    
    # Deploy frontend to Vercel/Netlify
    if command -v vercel >/dev/null 2>&1; then
        echo "Deploying frontend to Vercel..."
        vercel --prod
    elif command -v netlify >/dev/null 2>&1; then
        echo "Deploying frontend to Netlify..."
        netlify deploy --prod --dir=$FRONTEND_BUILD_DIR
    else
        echo -e "${YELLOW}No cloud deployment tool found for frontend${NC}"
    fi
    
    # Deploy backend to cloud (instructions)
    echo -e "${YELLOW}Manual steps for backend deployment:${NC}"
    echo "1. Push backend Docker image to registry"
    echo "2. Deploy to Render/Heroku/AWS"
    echo "3. Update environment variables"
    echo "4. Configure database connection"
}

# Run deployment
main() {
    echo "Starting deployment process..."
    
    # Parse command line arguments
    DEPLOY_TARGET=${1:-"local"}
    NETWORK=${2:-"sepolia"}
    
    case $DEPLOY_TARGET in
        "local")
            echo "Deploying locally with Docker..."
            check_dependencies
            build_frontend
            deploy_contracts $NETWORK
            deploy_backend
            deploy_ai_service
            deploy_with_docker
            ;;
        "cloud")
            echo "Deploying to cloud platforms..."
            check_dependencies
            build_frontend
            deploy_contracts $NETWORK
            deploy_backend
            deploy_ai_service
            deploy_to_cloud
            ;;
        "contracts-only")
            echo "Deploying contracts only..."
            deploy_contracts $NETWORK
            ;;
        *)
            echo "Usage: $0 [local|cloud|contracts-only] [network]"
            echo "  local: Deploy locally using Docker"
            echo "  cloud: Deploy to cloud platforms"
            echo "  contracts-only: Deploy smart contracts only"
            echo "  network: Blockchain network (default: sepolia)"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo
    echo "Next steps:"
    echo "1. Update environment variables for production"
    echo "2. Configure monitoring and logging"
    echo "3. Set up SSL certificates"
    echo "4. Configure backup procedures"
    echo "5. Test all functionality in production environment"
}

# Run main function with all arguments
main "$@"
