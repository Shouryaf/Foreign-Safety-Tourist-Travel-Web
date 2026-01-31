const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ethers } = require('ethers');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tourist-safety', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  touristID: String,
  walletAddress: String,
  role: { type: String, enum: ['tourist', 'authority'], default: 'tourist' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const SafeZoneSchema = new mongoose.Schema({
  name: String,
  coordinates: [[Number]], // Polygon coordinates
  type: { type: String, enum: ['safe', 'restricted'], default: 'safe' },
  createdBy: String,
  createdAt: { type: Date, default: Date.now }
});

const AlertSchema = new mongoose.Schema({
  touristID: String,
  type: { type: String, enum: ['sos', 'geofence_breach', 'anomaly'], required: true },
  location: {
    lat: Number,
    lng: Number
  },
  message: String,
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'acknowledged', 'resolved'], default: 'pending' }
});

const User = mongoose.model('User', UserSchema);
const SafeZone = mongoose.model('SafeZone', SafeZoneSchema);
const Alert = mongoose.model('Alert', AlertSchema);

// Blockchain setup
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);
const contractAddress = process.env.CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Contract ABI (simplified for demo)
const contractABI = [
  "function registerTourist(string memory _touristID, string memory _name, string memory _email, string memory _passportNumber) external",
  "function updateLocation(string memory _touristID, string memory _locationHash) external",
  "function triggerSOS(string memory _touristID, string memory _locationHash) external",
  "function verifyTourist(string memory _touristID) external view returns (bool)",
  "function getTourist(string memory _touristID) external view returns (string memory, string memory, string memory, uint256, bool, string memory)"
];

const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role = 'tourist' } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate tourist ID
    const touristID = `T${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      touristID,
      role
    });
    
    await user.save();

    // Register on blockchain
    try {
      const tx = await contract.registerTourist(touristID, name, email, 'PASSPORT123');
      await tx.wait();
      console.log('Tourist registered on blockchain:', touristID);
    } catch (error) {
      console.error('Blockchain registration failed:', error);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, touristID, role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user._id, name, email, touristID, role } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, touristID: user.touristID, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, touristID: user.touristID, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Tourist routes
app.post('/api/update-location', authenticateToken, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const locationHash = `${lat},${lng}`;
    
    // Update blockchain
    const tx = await contract.updateLocation(req.user.touristID, locationHash);
    await tx.wait();
    
    res.json({ success: true, locationHash });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ error: 'Location update failed' });
  }
});

app.post('/api/sos', authenticateToken, async (req, res) => {
  try {
    const { lat, lng, message } = req.body;
    const locationHash = `${lat},${lng}`;
    
    // Trigger SOS on blockchain
    const tx = await contract.triggerSOS(req.user.touristID, locationHash);
    await tx.wait();
    
    // Create alert in database
    const alert = new Alert({
      touristID: req.user.touristID,
      type: 'sos',
      location: { lat, lng },
      message: message || 'SOS Alert triggered'
    });
    
    await alert.save();
    
    // Emit real-time alert
    io.emit('alert', {
      touristID: req.user.touristID,
      type: 'sos',
      location: { lat, lng },
      message: message || 'SOS Alert triggered',
      timestamp: new Date()
    });
    
    res.json({ success: true, alertId: alert._id });
  } catch (error) {
    console.error('SOS error:', error);
    res.status(500).json({ error: 'SOS failed' });
  }
});

// Authority routes
app.get('/api/alerts', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'authority') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const alerts = await Alert.find().sort({ timestamp: -1 }).limit(50);
    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

app.get('/api/safe-zones', async (req, res) => {
  try {
    const zones = await SafeZone.find();
    res.json(zones);
  } catch (error) {
    console.error('Get safe zones error:', error);
    res.status(500).json({ error: 'Failed to fetch safe zones' });
  }
});

app.post('/api/safe-zones', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'authority') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { name, coordinates, type } = req.body;
    
    const zone = new SafeZone({
      name,
      coordinates,
      type,
      createdBy: req.user.userId
    });
    
    await zone.save();
    res.json(zone);
  } catch (error) {
    console.error('Create safe zone error:', error);
    res.status(500).json({ error: 'Failed to create safe zone' });
  }
});

// AI Service integration
app.post('/api/anomaly-detection', async (req, res) => {
  try {
    const { location, crowdDensity, timestamp } = req.body;
    
    // Simulate AI anomaly detection
    const isAnomaly = Math.random() < 0.1; // 10% chance of anomaly for demo
    
    if (isAnomaly) {
      const alert = new Alert({
        touristID: 'AI_SYSTEM',
        type: 'anomaly',
        location,
        message: `Anomaly detected: High crowd density (${crowdDensity})`,
        timestamp: new Date()
      });
      
      await alert.save();
      
      // Emit real-time alert
      io.emit('alert', {
        touristID: 'AI_SYSTEM',
        type: 'anomaly',
        location,
        message: `Anomaly detected: High crowd density (${crowdDensity})`,
        timestamp: new Date()
      });
    }
    
    res.json({ isAnomaly, timestamp: new Date() });
  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({ error: 'Anomaly detection failed' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-authority', () => {
    socket.join('authority');
    console.log('Authority user joined');
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
