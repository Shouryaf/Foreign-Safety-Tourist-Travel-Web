# Tourist Safety System - Complete Setup Guide

## 🎯 Quick Start

Your tourist safety system is now complete! Here's how to get everything running:

### Option 1: Quick Setup (Recommended)
```bash
# Windows
scripts\setup-dev.bat

# Linux/Mac
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh
```

### Option 2: Docker Setup (Easiest)
```bash
# Build and start all services
npm run docker:up

# Check system health
npm run health-check
```

### Option 3: Manual Setup
```bash
# 1. Install dependencies
npm install
cd backend && pip install -r requirements.txt
cd ../ai-service && pip install -r requirements.txt
cd ..

# 2. Compile smart contracts
npm run compile

# 3. Start services (4 separate terminals)
npm run dev                    # Frontend (localhost:5173)
npm run backend               # Backend API (localhost:3001)
npm run ai-service           # AI Service (localhost:8000)
npx hardhat node             # Blockchain (localhost:8545)

# 4. Deploy contracts (new terminal)
npm run deploy
```

## 🧪 Testing

```bash
# Test everything
npm run test                 # Smart contracts
npm run test:backend        # Backend API
npm run test:ai            # AI Service

# Or test individually
npm test                    # Blockchain tests only
```

## 📊 Monitoring

```bash
# Check system health
npm run health-check

# Monitor system metrics
npm run metrics

# Continuous monitoring
npm run metrics -- --continuous --interval 60
```

## 🚀 Production Deployment

```bash
# Deploy locally with Docker
npm run deploy:prod local

# Deploy to cloud platforms
npm run deploy:prod cloud

# Deploy contracts only to testnet
npm run deploy:prod contracts-only sepolia
```

## 🔧 System Architecture

### ✅ What's Included:

1. **Frontend (React + TypeScript)**
   - Tourist Dashboard with map and SOS
   - Authority Dashboard with monitoring
   - Real-time WebSocket communication
   - Blockchain integration

2. **Backend (Python FastAPI)**
   - RESTful APIs with JWT authentication
   - MongoDB integration
   - WebSocket for real-time updates
   - Blockchain interaction

3. **AI Service (Python FastAPI)**
   - Crowd density detection
   - Movement pattern analysis
   - Video anomaly simulation
   - Real-time alerting

4. **Blockchain (Solidity)**
   - Tourist ID smart contract
   - Hardhat development environment
   - Local and testnet deployment

5. **Infrastructure**
   - Docker containerization
   - Health monitoring
   - System metrics
   - Comprehensive testing

## 🌐 Access Points

After starting all services:

- **Tourist App**: http://localhost:5173
- **Authority Dashboard**: http://localhost:5173/auth
- **Backend API**: http://localhost:3001
- **AI Service**: http://localhost:8000
- **Blockchain**: http://localhost:8545

## 🔑 Default Credentials

**Authority Login:**
- Email: `admin@tourist-safety.com`
- Password: `admin123`

**Tourist Login:**
- Email: `tourist@example.com`
- Password: `tourist123`

## 📁 Project Structure

```
project/
├── src/                     # Frontend React app
├── backend/                 # Python FastAPI backend
├── ai-service/             # AI microservice
├── contracts/              # Solidity smart contracts
├── test/                   # Blockchain tests
├── scripts/                # Setup and deployment scripts
├── monitoring/             # Health check and metrics
├── docker-compose.yml      # Docker orchestration
└── README.md              # Main documentation
```

## 🚨 Troubleshooting

### Common Issues:

1. **Port conflicts**: Change ports in environment files
2. **MongoDB connection**: Ensure MongoDB is running
3. **Blockchain connection**: Start Hardhat node first
4. **Python dependencies**: Use virtual environment

### Health Check:
```bash
npm run health-check
```

### Reset Everything:
```bash
npm run docker:down
npm run docker:up
```

## 🎉 Demo Workflow

1. **Register Tourist** → Get blockchain ID
2. **View Map** → See safe/restricted zones
3. **Update Location** → Click on map
4. **Trigger SOS** → Emergency alert
5. **Authority Response** → Monitor alerts
6. **AI Detection** → Automatic anomaly alerts

## 📝 Next Steps

1. **Environment Setup**: Copy `.env.example` to `.env` files
2. **Database**: Configure MongoDB connection
3. **Blockchain**: Deploy to testnet for production
4. **Monitoring**: Set up continuous health monitoring
5. **Security**: Update JWT secrets and API keys

---

**Your Tourist Safety System is ready to go! 🚀**
