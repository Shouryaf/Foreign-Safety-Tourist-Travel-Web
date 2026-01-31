from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
import uvicorn
import bcrypt
import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import logging
import json

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Tourist Safety Backend",
    description="Backend API for Tourist Safety System with Blockchain Integration",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# In-memory storage for demo (replace with MongoDB in production)
users_db = {}
safe_zones_db = {}
alerts_db = {}
alert_counter = 0

# Pydantic models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "tourist"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    touristID: Optional[str] = None
    role: str
    isActive: bool = True

class LocationUpdate(BaseModel):
    lat: float
    lng: float

class SOSRequest(BaseModel):
    lat: float
    lng: float
    message: Optional[str] = None

class SafeZoneCreate(BaseModel):
    name: str
    coordinates: List[List[float]]
    type: str  # "safe" or "restricted"

class SafeZoneResponse(BaseModel):
    _id: str
    name: str
    coordinates: List[List[float]]
    type: str
    createdBy: str
    createdAt: datetime

class AlertResponse(BaseModel):
    _id: str
    touristID: str
    type: str
    location: Dict[str, float]
    message: str
    timestamp: datetime
    status: str

class AnomalyDetectionRequest(BaseModel):
    location: Dict[str, float]
    crowdDensity: float
    timestamp: str

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
        user_id = str(len(users_db) + 1)
        user_doc = {
            "_id": user_id,
            "name": user_data.name,
            "email": user_data.email,
            "password": hashed_password,
            "touristID": tourist_id,
            "role": user_data.role,
            "isActive": True,
            "createdAt": datetime.now()
        }

        # Store user
        users_db[user_id] = user_doc

        # Simulate blockchain registration
        if user_data.role == "tourist" and tourist_id:
            logger.info(f"Tourist registered on blockchain: {tourist_id}")

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
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/api/login", response_model=Dict[str, Any])
async def login_user(login_data: UserLogin):
    try:
        user = None
        for u in users_db.values():
            if u["email"] == login_data.email:
                user = u
                break
        
        if not user:
            raise HTTPException(status_code=400, detail="Invalid credentials")

        # Verify password
        if not bcrypt.checkpw(login_data.password.encode('utf-8'), user["password"].encode('utf-8')):
            raise HTTPException(status_code=400, detail="Invalid credentials")

        # Generate JWT token
        token = create_access_token({
            "userId": user["_id"],
            "touristID": user.get("touristID"),
            "role": user["role"]
        })

        return {
            "token": token,
            "user": {
                "id": user["_id"],
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
        
        # Simulate blockchain update
        if current_user.get("touristID"):
            logger.info(f"Location updated on blockchain for {current_user['touristID']}: {location_hash}")
        
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
        
        # Simulate blockchain SOS trigger
        if current_user.get("touristID"):
            logger.info(f"SOS triggered on blockchain for {current_user['touristID']}: {location_hash}")
        
        # Create alert in database
        global alert_counter
        alert_counter += 1
        alert_id = str(alert_counter)
        
        alert_doc = {
            "_id": alert_id,
            "touristID": current_user.get("touristID", "unknown"),
            "type": "sos",
            "location": {"lat": sos_data.lat, "lng": sos_data.lng},
            "message": sos_data.message or "SOS Alert triggered",
            "timestamp": datetime.now(),
            "status": "pending"
        }
        
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
        return alerts[:50]  # Return last 50 alerts

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
        
        zone_id = str(len(safe_zones_db) + 1)
        zone_doc = {
            "_id": zone_id,
            "name": zone_data.name,
            "coordinates": zone_data.coordinates,
            "type": zone_data.type,
            "createdBy": current_user["_id"],
            "createdAt": datetime.now()
        }
        
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
        # Simulate AI anomaly detection
        import random
        is_anomaly = random.random() < 0.1  # 10% chance of anomaly for demo
        
        if is_anomaly:
            global alert_counter
            alert_counter += 1
            alert_id = str(alert_counter)
            
            alert_doc = {
                "_id": alert_id,
                "touristID": "AI_SYSTEM",
                "type": "anomaly",
                "location": request.location,
                "message": f"Anomaly detected: High crowd density ({request.crowdDensity})",
                "timestamp": datetime.now(),
                "status": "pending"
            }
            
            alerts_db[alert_id] = alert_doc
            
            # Broadcast to authorities
            await manager.broadcast_to_authorities(json.dumps({
                "type": "alert",
                "data": alert_doc
            }))
        
        return {"isAnomaly": is_anomaly, "timestamp": datetime.now().isoformat()}

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
