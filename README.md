# Tourist Safety Prototype 🌐

A comprehensive web-based tourist safety system with blockchain integration, real-time monitoring, and AI-powered anomaly detection.

## 🚀 Features

### Tourist Side
- **Blockchain-based Digital Tourist ID**: Secure, immutable identity verification
- **Interactive Safety Map**: Real-time visualization of safe and restricted zones
- **SOS Emergency Button**: Instant alert system with location tracking
- **Location Tracking**: Automatic and manual location updates
- **Real-time Notifications**: Instant alerts for safety updates

### Authority/Admin Side
- **Real-time Monitoring Dashboard**: Live tracking of tourist activities
- **Alert Management System**: Handle SOS requests, geo-fence breaches, and AI-detected anomalies
- **Zone Management**: Create and edit safe/restricted areas on the map
- **Statistics Dashboard**: Comprehensive analytics and reporting
- **Multi-alert Support**: Handle various types of safety alerts

### Backend Services
- **RESTful APIs**: Complete backend with authentication and data management
- **Blockchain Integration**: Smart contract interaction for tourist ID management
- **Real-time WebSocket**: Live communication between tourists and authorities
- **MongoDB Database**: Scalable data storage and management

### AI Microservice
- **Crowd Density Detection**: Analyze GPS data for unusual crowd concentrations
- **Movement Pattern Analysis**: Detect unusual movement patterns and speeds
- **Video Anomaly Detection**: Simulated computer vision-based anomaly detection
- **Real-time Alerting**: Automatic alert generation and backend integration

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **React Leaflet** for interactive maps
- **Socket.io Client** for real-time communication
- **Ethers.js** for blockchain interaction
- **Axios** for API communication
- **React Hot Toast** for notifications

### Backend
- **Python** with FastAPI
- **MongoDB** with Motor (async driver)
- **WebSockets** for real-time communication
- **JWT** for authentication
- **bcrypt** for password hashing
- **Ethers.py** for blockchain integration
- **Pydantic** for data validation and type safety

### Blockchain
- **Solidity** smart contracts
- **Hardhat** for development and deployment
- **Ethereum** testnet integration
- **Web3.js/Ethers.js** for frontend integration

### AI Service
- **FastAPI** (Python) for the AI microservice
- **NumPy** for data processing
- **OpenCV** for computer vision (simulated)
- **AsyncIO** for real-time processing

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- MongoDB (local or cloud)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd tourist-safety-prototype
```

### 2. Install Frontend Dependencies
```bash
cd project
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 4. Install AI Service Dependencies
```bash
cd ai-service
pip install -r requirements.txt
```

### 5. Environment Setup

#### Backend Environment
Create `backend/.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/tourist-safety
JWT_SECRET=your-super-secret-jwt-key
RPC_URL=http://localhost:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
PORT=3001
```

#### Blockchain Setup
```bash
# Install Hardhat dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Compile contracts
npx hardhat compile

# Deploy to local network
npx hardhat node
# In another terminal:
npx hardhat run scripts/deploy.js --network localhost
```

## 🐍 Why Python Backend?

We chose Python with FastAPI for the backend because:

- **🔄 Consistency**: Same language as AI service for seamless integration
- **⚡ Performance**: FastAPI is one of the fastest Python frameworks
- **🛡️ Type Safety**: Pydantic provides excellent data validation and type hints
- **📚 Auto Documentation**: Automatic OpenAPI/Swagger documentation
- **🔧 Async Support**: Native async/await for better concurrency
- **🤖 AI Integration**: Easy integration with ML libraries and AI services
- **📊 Data Processing**: Better access to pandas, numpy for data analysis

## 🚀 Running the Application

### 1. Start MongoDB
```bash
# If using local MongoDB
mongod
```

### 2. Start Blockchain Network
```bash
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Start Backend Server
```bash
cd backend
python main.py
# Server runs on http://localhost:3001
```

### 4. Start AI Service
```bash
cd ai-service
python main.py
# AI service runs on http://localhost:8000
```

### 5. Start Frontend
```bash
cd project
npm run dev
# Frontend runs on http://localhost:5173
```

## 🎯 Usage Guide

### For Tourists
1. **Registration**: Visit `/register` to create a blockchain-based tourist ID
2. **Dashboard**: Access your personal safety dashboard at `/dashboard`
3. **Map Interaction**: Click on the map to update your location
4. **SOS Button**: Use the red SOS button in emergencies
5. **Zone Awareness**: Stay within green safe zones, avoid red restricted areas

### For Authorities
1. **Login**: Use `/auth` to access the authority control center
2. **Monitoring**: View real-time tourist locations and alerts
3. **Zone Management**: Create and edit safety zones using the map interface
4. **Alert Response**: Handle incoming SOS requests and anomaly alerts
5. **Analytics**: Monitor statistics and trends

### API Endpoints

#### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

#### Tourist Operations
- `POST /api/update-location` - Update tourist location
- `POST /api/sos` - Trigger SOS alert

#### Authority Operations
- `GET /api/alerts` - Get all alerts
- `GET /api/safe-zones` - Get safe zones
- `POST /api/safe-zones` - Create new safe zone

#### AI Integration
- `POST /api/anomaly-detection` - Trigger AI anomaly detection

## 🔧 Development

### Project Structure
```
project/
├── src/
│   ├── components/
│   │   ├── TouristDashboard/
│   │   ├── Layout/
│   │   └── UI/
│   ├── pages/
│   ├── lib/
│   ├── types/
│   └── hooks/
├── backend/
│   ├── server.js
│   └── models/
├── contracts/
│   └── TouristID.sol
├── ai-service/
│   ├── main.py
│   └── requirements.txt
└── scripts/
    └── deploy.js
```

### Adding New Features
1. **Frontend**: Add components in `src/components/`
2. **Backend**: Extend API routes in `backend/server.js`
3. **Blockchain**: Modify contracts in `contracts/`
4. **AI**: Enhance detection algorithms in `ai-service/`

## 🧪 Testing

### Frontend Testing
```bash
npm run test
```

### Backend Testing
```bash
cd backend
python -m pytest
```

### AI Service Testing
```bash
cd ai-service
python -m pytest
```

### Blockchain Testing
```bash
npx hardhat test
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder to your hosting platform
```

### Backend (Render/Heroku)
```bash
# Set environment variables
# Deploy backend/ folder
```

### AI Service (AWS/Docker)
```bash
# Build Docker image
docker build -t tourist-safety-ai .
# Deploy to cloud platform
```

### Blockchain (Testnet)
```bash
# Deploy to Sepolia/Polygon Mumbai
npx hardhat run scripts/deploy.js --network sepolia
```

## 📊 Demo Workflow

1. **Tourist Registration**: Create account → Get blockchain ID → Access dashboard
2. **Location Tracking**: Update location → See on map → Blockchain verification
3. **SOS Alert**: Click SOS → Real-time alert → Authority notification
4. **Zone Management**: Authority creates zones → Tourists see boundaries
5. **AI Detection**: Simulated crowd data → Anomaly detection → Alert generation

## 🔒 Security Features

- **Blockchain Security**: Immutable tourist IDs and location records
- **JWT Authentication**: Secure API access
- **Password Hashing**: bcrypt for user passwords
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Pydantic models for data validation

## 🌟 Future Enhancements

- **Real Computer Vision**: Integration with actual CCTV systems
- **Mobile App**: React Native mobile application
- **Advanced AI**: Machine learning models for behavior prediction
- **Multi-language Support**: Internationalization
- **Offline Capability**: PWA features for offline functionality
- **Integration APIs**: Connect with existing tourism platforms

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for tourist safety and blockchain innovation**
