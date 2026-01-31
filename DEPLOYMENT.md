# Deployment Guide 🚀

This guide covers deploying the Tourist Safety Prototype to various platforms.

## 📋 Prerequisites

- Node.js (v18+)
- Python (v3.8+)
- MongoDB Atlas account (or local MongoDB)
- Ethereum testnet account (Sepolia/Polygon Mumbai)
- Cloud platform accounts (Vercel, Render, AWS, etc.)

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend        │    │   AI Service     │
│   (Vercel)      │◄──►│   (Render)       │◄──►│   (AWS/Docker)   │
│   Port: 5173    │    │   Port: 3001     │    │   Port: 8000     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Blockchain    │    │   Database      │    │   File Storage  │
│   (Testnet)     │    │   (MongoDB)     │    │   (Optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Environment Configuration

### 1. Database Setup (MongoDB Atlas)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get connection string
4. Create database: `tourist-safety`
5. Create collections: `users`, `safezones`, `alerts`

### 2. Blockchain Setup

1. Create Ethereum wallet (MetaMask)
2. Get testnet ETH from faucets:
   - Sepolia: https://sepoliafaucet.com/
   - Polygon Mumbai: https://faucet.polygon.technology/
3. Deploy contracts to testnet

### 3. Environment Variables

Create environment files for each service:

#### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tourist-safety
JWT_SECRET=your-super-secret-jwt-key-here
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your-private-key-here
CONTRACT_ADDRESS=0x...deployed-contract-address
PORT=3001
NODE_ENV=production
```

#### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.com
VITE_WEBSOCKET_URL=wss://your-backend-url.com
VITE_CONTRACT_ADDRESS=0x...deployed-contract-address
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

## 🚀 Deployment Steps

### 1. Frontend Deployment (Vercel)

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd project
vercel --prod
```

#### Option B: GitHub Integration
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

#### Option C: Manual Build
```bash
cd project
npm run build
# Upload dist/ folder to your hosting platform
```

### 2. Backend Deployment (Render)

#### Option A: Render Dashboard
1. Connect GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables
5. Deploy

#### Option B: Docker
```dockerfile
# Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

#### Option C: Manual Deployment
```bash
cd backend
npm install --production
# Upload to your server
# Set up PM2 or similar process manager
```

### 3. AI Service Deployment (AWS/Docker)

#### Option A: AWS EC2
```bash
# Create EC2 instance
# Install Python and dependencies
cd ai-service
pip install -r requirements.txt
# Run with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### Option B: Docker
```dockerfile
# Dockerfile for AI service
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]
```

#### Option C: Serverless (AWS Lambda)
```bash
# Use Mangum for ASGI support
pip install mangum
# Deploy as Lambda function
```

### 4. Blockchain Deployment

#### Deploy to Sepolia Testnet
```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Configure hardhat.config.js
module.exports = {
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      accounts: ["YOUR_PRIVATE_KEY"]
    }
  }
};

# Deploy
npx hardhat run scripts/deploy.js --network sepolia
```

#### Deploy to Polygon Mumbai
```bash
# Similar process with Mumbai network configuration
npx hardhat run scripts/deploy.js --network polygon
```

## 🔗 Service Integration

### 1. Update Frontend URLs
After deploying backend, update frontend environment variables:
```env
VITE_API_URL=https://your-backend-url.com
VITE_WEBSOCKET_URL=wss://your-backend-url.com
```

### 2. Update Backend AI Service URL
Update backend to point to deployed AI service:
```env
AI_SERVICE_URL=https://your-ai-service-url.com
```

### 3. Configure CORS
Update backend CORS settings:
```javascript
app.use(cors({
  origin: ['https://your-frontend-url.com'],
  credentials: true
}));
```

## 📊 Monitoring & Logging

### 1. Application Monitoring
- **Frontend**: Vercel Analytics
- **Backend**: Render Metrics
- **AI Service**: AWS CloudWatch
- **Database**: MongoDB Atlas Monitoring

### 2. Error Tracking
- **Sentry**: For error tracking
- **LogRocket**: For session replay
- **Custom Logging**: File-based or cloud logging

### 3. Performance Monitoring
- **Web Vitals**: Core Web Vitals tracking
- **API Response Times**: Backend performance
- **Database Queries**: MongoDB performance

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use secure secret management
- Rotate keys regularly

### 2. API Security
- Enable HTTPS everywhere
- Implement rate limiting
- Use proper CORS configuration
- Validate all inputs

### 3. Database Security
- Use MongoDB Atlas security features
- Enable IP whitelisting
- Use strong passwords
- Enable audit logging

### 4. Blockchain Security
- Use hardware wallets for production
- Implement multi-signature for critical operations
- Regular security audits

## 🧪 Testing in Production

### 1. Health Checks
```bash
# Test all endpoints
curl https://your-backend-url.com/api/health
curl https://your-ai-service-url.com/health
```

### 2. End-to-End Testing
1. Register a test tourist
2. Verify blockchain registration
3. Test location updates
4. Test SOS functionality
5. Verify authority dashboard

### 3. Load Testing
```bash
# Use tools like Artillery or k6
npm install -g artillery
artillery quick --count 100 --num 10 https://your-backend-url.com/api/health
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy Tourist Safety
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        # Add Render deployment steps
```

## 📈 Scaling Considerations

### 1. Database Scaling
- MongoDB Atlas auto-scaling
- Read replicas for read-heavy operations
- Sharding for large datasets

### 2. Backend Scaling
- Horizontal scaling with load balancers
- Microservices architecture
- Caching with Redis

### 3. AI Service Scaling
- Container orchestration (Kubernetes)
- Auto-scaling based on demand
- Model serving optimization

## 🆘 Troubleshooting

### Common Issues

#### 1. CORS Errors
```javascript
// Fix CORS in backend
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

#### 2. Database Connection Issues
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Check network connectivity

#### 3. Blockchain Connection Issues
- Verify RPC URL
- Check private key format
- Ensure sufficient testnet ETH

#### 4. WebSocket Connection Issues
- Check WebSocket URL format
- Verify CORS settings
- Check firewall settings

### Debug Commands
```bash
# Check service status
curl -I https://your-backend-url.com/api/health
curl -I https://your-ai-service-url.com/health

# Check logs
# Vercel: Dashboard logs
# Render: Dashboard logs
# AWS: CloudWatch logs
```

## 📞 Support

For deployment issues:
1. Check service logs
2. Verify environment variables
3. Test endpoints individually
4. Check service status pages
5. Contact platform support

---

**Happy Deploying! 🚀**
