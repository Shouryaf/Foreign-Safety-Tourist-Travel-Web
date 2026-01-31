from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
import uvicorn
import bcrypt
import os
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any
import json
import bcrypt
import jwt
import aiohttp
from web3 import Web3
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In-memory storage
users_db = {
    "test_user": {
        "_id": "test_user",
        "name": "Test User",
        "email": "test@example.com",
        "password": bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "phone": "+1234567890",
        "role": "tourist",
        "touristID": "T001",
        "createdAt": datetime.now()
    }
}
safe_zones_db = {
    "1": {
        "_id": "1",
        "name": "Tourist District",
        "coordinates": [[28.6139, 77.2090], [28.6150, 77.2100], [28.6140, 77.2110], [28.6130, 77.2100]],
        "type": "safe",
        "createdBy": "system",
        "createdAt": datetime.now()
    },
    "2": {
        "_id": "2",
        "name": "Construction Zone",
        "coordinates": [[28.6100, 77.2050], [28.6110, 77.2060], [28.6105, 77.2070], [28.6095, 77.2060]],
        "type": "restricted",
        "createdBy": "system",
        "createdAt": datetime.now()
    }
}
alerts_db = {}
alert_counter = 0

app = FastAPI(
    title="Tourist Safety Backend",
    description="Backend API for Tourist Safety System with Blockchain Integration",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# In-memory database for demo (replace with MongoDB in production)
users_db = {}
safe_zones_db = {}
alerts_db = {}
alert_counter = 0

# Blockchain setup
w3 = Web3(Web3.HTTPProvider(os.getenv("RPC_URL", "http://localhost:8545")))
private_key = os.getenv("PRIVATE_KEY", "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80")
contract_address = os.getenv("CONTRACT_ADDRESS", "0x5FbDB2315678afecb367f032d93F642f64180aa3")

# Contract ABI
contract_abi = [
    {
        "inputs": [
            {"internalType": "string", "name": "_touristID", "type": "string"},
            {"internalType": "string", "name": "_name", "type": "string"},
            {"internalType": "string", "name": "_email", "type": "string"},
            {"internalType": "string", "name": "_passportNumber", "type": "string"}
        ],
        "name": "registerTourist",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_touristID", "type": "string"},
            {"internalType": "string", "name": "_locationHash", "type": "string"}
        ],
        "name": "updateLocation",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_touristID", "type": "string"},
            {"internalType": "string", "name": "_locationHash", "type": "string"}
        ],
        "name": "triggerSOS",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string", "name": "_touristID", "type": "string"}],
        "name": "verifyTourist",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string", "name": "_touristID", "type": "string"}],
        "name": "getTourist",
        "outputs": [
            {"internalType": "string", "name": "", "type": "string"},
            {"internalType": "string", "name": "", "type": "string"},
            {"internalType": "string", "name": "", "type": "string"},
            {"internalType": "uint256", "name": "", "type": "uint256"},
            {"internalType": "bool", "name": "", "type": "bool"},
            {"internalType": "string", "name": "", "type": "string"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

contract = w3.eth.contract(address=contract_address, abi=contract_abi)

# Pydantic models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "tourist"
    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    model_config = ConfigDict(from_attributes=True)

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    touristID: Optional[str] = None
    role: str
    isActive: bool = True
    model_config = ConfigDict(from_attributes=True)

class LocationUpdate(BaseModel):
    lat: float
    lng: float
    model_config = ConfigDict(from_attributes=True)

class SOSRequest(BaseModel):
    lat: float
    lng: float
    message: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class SafeZoneCreate(BaseModel):
    name: str
    coordinates: List[List[float]]
    type: str  # "safe" or "restricted"
    model_config = ConfigDict(from_attributes=True)

class SafeZoneResponse(BaseModel):
    _id: str
    name: str
    coordinates: List[List[float]]
    type: str
    createdBy: str
    createdAt: datetime
    model_config = ConfigDict(from_attributes=True)

class AlertResponse(BaseModel):
    _id: str
    touristID: str
    type: str
    location: Dict[str, float]
    message: str
    timestamp: datetime
    status: str
    model_config = ConfigDict(from_attributes=True)

class AnomalyDetectionRequest(BaseModel):
    location: Dict[str, float]
    crowdDensity: float
    timestamp: str
    model_config = ConfigDict(from_attributes=True)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.authority_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, is_authority: bool = False):
        await websocket.accept()
        self.active_connections.append(websocket)
        if is_authority:
            self.authority_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.authority_connections:
            self.authority_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_authorities(self, message: str):
        for connection in self.authority_connections:
            try:
                await connection.send_text(message)
            except:
                self.disconnect(connection)

manager = ConnectionManager()

# Utility functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, os.getenv("JWT_SECRET", "secret"), algorithm="HS256")
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, os.getenv("JWT_SECRET", "secret"), algorithms=["HS256"])
        user_id = payload.get("userId")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = users_db.get(user_id)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

def generate_tourist_id() -> str:
    timestamp = int(datetime.now().timestamp() * 1000)
    import random
    random_str = ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=5))
    return f"T{timestamp}{random_str}"

# Routes
@app.get("/")
async def root():
    return {"message": "Tourist Safety Backend API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/register", response_model=Dict[str, Any])
async def register_user(user_data: UserCreate):
    try:
        # Check if user already exists
        for user in users_db.values():
            if user["email"] == user_data.email:
                raise HTTPException(status_code=400, detail="User already exists")

        # Hash password
        hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Generate tourist ID for tourists
        tourist_id = None
        if user_data.role == "tourist":
            tourist_id = generate_tourist_id()

        # Create user document
        user_doc = {
            "name": user_data.name,
            "email": user_data.email,
            "password": hashed_password,
            "touristID": tourist_id,
            "role": user_data.role,
            "isActive": True,
            "createdAt": datetime.now()
        }

        # Insert user
        user_id = str(len(users_db) + 1)
        user_doc["_id"] = user_id
        users_db[user_id] = user_doc

        # Register on blockchain if tourist
        if user_data.role == "tourist" and tourist_id:
            try:
                # Get account from private key
                account = w3.eth.account.from_key(private_key)
                
                # Build transaction
                tx = contract.functions.registerTourist(tourist_id, user_data.name, user_data.email, "PASSPORT123").build_transaction({
                    'from': account.address,
                    'gas': 200000,
                    'gasPrice': w3.eth.gas_price,
                    'nonce': w3.eth.get_transaction_count(account.address),
                })
                
                # Sign and send transaction
                signed_tx = w3.eth.account.sign_transaction(tx, private_key)
                tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
                tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
                
                logger.info(f"Tourist registered on blockchain: {tourist_id}")
            except Exception as e:
                logger.error(f"Blockchain registration failed: {e}")

        # Generate JWT token
        token = create_access_token({
            "userId": user_id,
            "touristID": tourist_id,
            "role": user_data.role
        })

        return {
            "token": token,
            "user": {
                "id": user_id,
                "name": user_data.name,
                "email": user_data.email,
                "touristID": tourist_id,
                "role": user_data.role
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        logger.error(f"Login error type: {type(e)}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@app.post("/api/login", response_model=Dict[str, Any])
async def login_user(login_data: UserLogin):
    try:
        logger.info(f"Login attempt for email: {login_data.email}")
        logger.info(f"Current users in database: {list(users_db.keys())}")
        
        user = None
        for u in users_db.values():
            if u["email"] == login_data.email:
                user = u
                break
        
        if not user:
            logger.warning(f"User not found: {login_data.email}")
            raise HTTPException(status_code=400, detail="Invalid credentials")

        # Verify password
        logger.info(f"Verifying password for user: {user['email']}")
        if not bcrypt.checkpw(login_data.password.encode('utf-8'), user["password"].encode('utf-8')):
            logger.warning(f"Password verification failed for user: {user['email']}")
            raise HTTPException(status_code=400, detail="Invalid credentials")

        # Generate JWT token
        token = create_access_token({
            "userId": str(user["_id"]),
            "touristID": user.get("touristID"),
            "role": user["role"]
        })

        return {
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "touristID": user.get("touristID"),
                "role": user["role"]
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.post("/api/update-location")
async def update_location(
    location_data: LocationUpdate,
    current_user: dict = Depends(get_current_user)
):
    try:
        location_hash = f"{location_data.lat},{location_data.lng}"
        
        # Update blockchain
        if current_user.get("touristID"):
            try:
                account = w3.eth.account.from_key(private_key)
                tx = contract.functions.updateLocation(current_user["touristID"], location_hash).build_transaction({
                    'from': account.address,
                    'gas': 100000,
                    'gasPrice': w3.eth.gas_price,
                    'nonce': w3.eth.get_transaction_count(account.address),
                })
                signed_tx = w3.eth.account.sign_transaction(tx, private_key)
                tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
                w3.eth.wait_for_transaction_receipt(tx_hash)
            except Exception as e:
                logger.error(f"Blockchain location update failed: {e}")
        
        return {"success": True, "locationHash": location_hash}

    except Exception as e:
        logger.error(f"Location update error: {e}")
        raise HTTPException(status_code=500, detail="Location update failed")

@app.post("/api/sos")
async def trigger_sos(
    sos_data: SOSRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        location_hash = f"{sos_data.lat},{sos_data.lng}"
        
        # Trigger SOS on blockchain
        if current_user.get("touristID"):
            try:
                account = w3.eth.account.from_key(private_key)
                tx = contract.functions.triggerSOS(current_user["touristID"], location_hash).build_transaction({
                    'from': account.address,
                    'gas': 150000,
                    'gasPrice': w3.eth.gas_price,
                    'nonce': w3.eth.get_transaction_count(account.address),
                })
                signed_tx = w3.eth.account.sign_transaction(tx, private_key)
                tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
                w3.eth.wait_for_transaction_receipt(tx_hash)
            except Exception as e:
                logger.error(f"Blockchain SOS trigger failed: {e}")
        
        # Create alert in database
        alert_doc = {
            "touristID": current_user.get("touristID", "unknown"),
            "type": "sos",
            "location": {"lat": sos_data.lat, "lng": sos_data.lng},
            "message": sos_data.message or "SOS Alert triggered",
            "timestamp": datetime.now(),
            "status": "pending"
        }
        
        global alert_counter
        alert_counter += 1
        alert_id = str(alert_counter)
        alert_doc["_id"] = alert_id
        alerts_db[alert_id] = alert_doc
        
        # Broadcast to authorities
        await manager.broadcast_to_authorities(json.dumps({
            "type": "alert",
            "data": alert_doc
        }))
        
        return {"success": True, "alertId": alert_id}

    except Exception as e:
        logger.error(f"SOS error: {e}")
        raise HTTPException(status_code=500, detail="SOS failed")

@app.get("/api/alerts", response_model=List[AlertResponse])
async def get_alerts(current_user: dict = Depends(get_current_user)):
    try:
        if current_user["role"] != "authority":
            raise HTTPException(status_code=403, detail="Access denied")
        
        alerts = list(alerts_db.values())
        alerts.sort(key=lambda x: x["timestamp"], reverse=True)
        return alerts[:50]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get alerts error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch alerts")

@app.get("/api/safe-zones", response_model=List[SafeZoneResponse])
async def get_safe_zones():
    try:
        zones = list(safe_zones_db.values())
        return zones

    except Exception as e:
        logger.error(f"Get safe zones error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch safe zones")

@app.post("/api/safe-zones", response_model=SafeZoneResponse)
async def create_safe_zone(
    zone_data: SafeZoneCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        if current_user["role"] != "authority":
            raise HTTPException(status_code=403, detail="Access denied")
        
        zone_doc = {
            "name": zone_data.name,
            "coordinates": zone_data.coordinates,
            "type": zone_data.type,
            "createdBy": str(current_user["_id"]),
            "createdAt": datetime.now()
        }
        
        zone_id = str(len(safe_zones_db) + 1)
        zone_doc["_id"] = zone_id
        safe_zones_db[zone_id] = zone_doc
        
        return zone_doc

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create safe zone error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create safe zone")

@app.post("/api/anomaly-detection")
async def anomaly_detection(request: AnomalyDetectionRequest):
    try:
        # Call AI Service for real anomaly detection
        ai_service_url = "http://localhost:8000/detect-anomaly"
        
        ai_request_data = {
            "locations": [{
                "lat": request.location.get("lat", 0),
                "lng": request.location.get("lng", 0),
                "timestamp": request.timestamp,
                "tourist_count": 1
            }],
            "crowd_density_threshold": 0.7
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(ai_service_url, json=ai_request_data) as response:
                    if response.status == 200:
                        ai_result = await response.json()
                        is_anomaly = ai_result.get("is_anomaly", False)
                        anomaly_type = ai_result.get("anomaly_type", "unknown")
                        confidence = ai_result.get("confidence", 0.0)
                    else:
                        logger.warning(f"AI Service unavailable, using fallback detection")
                        # Fallback to simple detection
                        import random
                        is_anomaly = random.random() < 0.1
                        anomaly_type = "crowd_density"
                        confidence = 0.5
            except Exception as ai_error:
                logger.warning(f"AI Service error: {ai_error}, using fallback")
                # Fallback to simple detection
                import random
                is_anomaly = random.random() < 0.1
                anomaly_type = "crowd_density"
                confidence = 0.5
        
        if is_anomaly:
            alert_doc = {
                "touristID": "AI_SYSTEM",
                "type": "anomaly",
                "location": request.location,
                "message": f"AI Anomaly detected: {anomaly_type} (confidence: {confidence:.2f}, crowd density: {request.crowdDensity})",
                "timestamp": datetime.now(),
                "status": "pending",
                "anomaly_details": {
                    "type": anomaly_type,
                    "confidence": confidence,
                    "crowd_density": request.crowdDensity
                }
            }
            
            global alert_counter
            alert_counter += 1
            alert_id = str(alert_counter)
            alert_doc["_id"] = alert_id
            alerts_db[alert_id] = alert_doc
            
            # Broadcast to authorities
            await manager.broadcast_to_authorities(json.dumps({
                "type": "alert",
                "data": alert_doc
            }))
        
        return {
            "isAnomaly": is_anomaly, 
            "anomalyType": anomaly_type if is_anomaly else None,
            "confidence": confidence if is_anomaly else None,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Anomaly detection error: {e}")
        raise HTTPException(status_code=500, detail="Anomaly detection failed")

# WebSocket endpoints
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming WebSocket messages
            message = json.loads(data)
            if message.get("type") == "join-authority":
                manager.authority_connections.append(websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3001)
