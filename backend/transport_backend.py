from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
import uvicorn
import bcrypt
import os
import logging
from datetime import datetime, timedelta
import json
import jwt
import aiohttp
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import asyncio
from dotenv import load_dotenv
import uuid
import random
from geopy.distance import geodesic
import requests

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.transport_platform

app = FastAPI(
    title="Multi-Modal Transport Platform",
    description="Comprehensive transportation platform with social features",
    version="2.0.0"
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

# Pydantic Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    model_config = ConfigDict(from_attributes=True)

class SocialPost(BaseModel):
    content: str
    location: Optional[Dict[str, float]] = None
    transport_mode: Optional[str] = None
    journey_details: Optional[Dict[str, Any]] = None
    model_config = ConfigDict(from_attributes=True)

class TransportSearch(BaseModel):
    origin: str
    destination: str
    date: str
    transport_type: str  # train, bus, flight, taxi, metro
    passengers: int = 1
    model_config = ConfigDict(from_attributes=True)

class BookingCreate(BaseModel):
    transport_id: str
    transport_type: str
    passenger_details: List[Dict[str, str]]
    seat_preferences: Optional[Dict[str, Any]] = None
    model_config = ConfigDict(from_attributes=True)

class DangerLocationCreate(BaseModel):
    name: str
    description: str
    latitude: float
    longitude: float
    risk_level: str  # low, medium, high, critical
    category: str
    model_config = ConfigDict(from_attributes=True)

class DangerLocationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    risk_level: Optional[str] = None
    category: Optional[str] = None
    verified: Optional[bool] = None
    model_config = ConfigDict(from_attributes=True)

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
        
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# Routes
@app.get("/")
async def root():
    return {"message": "Multi-Modal Transport Platform API", "status": "running"}

@app.post("/api/register")
async def register_user(user_data: UserCreate):
    try:
        # Check if user exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")

        # Hash password
        hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create user document
        user_doc = {
            "name": user_data.name,
            "email": user_data.email,
            "password": hashed_password,
            "phone": user_data.phone,
            "profile_picture": None,
            "location": None,
            "preferences": {
                "transport_modes": [],
                "notifications": True,
                "location_sharing": False
            },
            "social_stats": {
                "posts": 0,
                "followers": 0,
                "following": 0
            },
            "created_at": datetime.utcnow()
        }

        result = await db.users.insert_one(user_doc)
        user_id = str(result.inserted_id)

        # Generate JWT token
        token = create_access_token({"userId": user_id})

        return {
            "token": token,
            "user": {
                "id": user_id,
                "name": user_data.name,
                "email": user_data.email,
                "phone": user_data.phone
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/api/login")
async def login_user(login_data: UserLogin):
    try:
        user = await db.users.find_one({"email": login_data.email})
        if not user:
            raise HTTPException(status_code=400, detail="Invalid credentials")

        # Verify password
        if not bcrypt.checkpw(login_data.password.encode('utf-8'), user["password"].encode('utf-8')):
            raise HTTPException(status_code=400, detail="Invalid credentials")

        # Generate JWT token
        token = create_access_token({"userId": str(user["_id"])})

        return {
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "phone": user.get("phone"),
                "profile_picture": user.get("profile_picture")
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

# Danger Locations API Endpoints
@app.get("/api/danger-locations")
async def get_danger_locations(current_user: dict = Depends(get_current_user)):
    """Get all danger locations with risk levels"""
    try:
        locations = await db.danger_locations.find().to_list(length=None)
        
        # Convert ObjectId to string for JSON serialization
        for location in locations:
            location["id"] = str(location["_id"])
            del location["_id"]
        
        return {"locations": locations}
    
    except Exception as e:
        logger.error(f"Error fetching danger locations: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch danger locations")

@app.post("/api/danger-locations")
async def create_danger_location(location_data: DangerLocationCreate, current_user: dict = Depends(get_current_user)):
    """Create a new danger location report"""
    try:
        # Validate risk level
        valid_risk_levels = ["low", "medium", "high", "critical"]
        if location_data.risk_level not in valid_risk_levels:
            raise HTTPException(status_code=400, detail="Invalid risk level")
        
        location_doc = {
            "name": location_data.name,
            "description": location_data.description,
            "latitude": location_data.latitude,
            "longitude": location_data.longitude,
            "risk_level": location_data.risk_level,
            "category": location_data.category,
            "reported_by": current_user["userId"],
            "verified": False,  # New reports need verification
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        result = await db.danger_locations.insert_one(location_doc)
        location_doc["id"] = str(result.inserted_id)
        if "_id" in location_doc:
            del location_doc["_id"]
        
        return {"message": "Danger location reported successfully", "location": location_doc}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating danger location: {e}")
        raise HTTPException(status_code=500, detail="Failed to create danger location")

@app.put("/api/danger-locations/{location_id}")
async def update_danger_location(location_id: str, update_data: DangerLocationUpdate, current_user: dict = Depends(get_current_user)):
    """Update a danger location (admin only for verification)"""
    try:
        # Convert string ID to ObjectId
        try:
            obj_id = ObjectId(location_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid location ID")
        
        # Check if location exists
        existing_location = await db.danger_locations.find_one({"_id": obj_id})
        if not existing_location:
            raise HTTPException(status_code=404, detail="Danger location not found")
        
        # Prepare update data
        update_fields = {}
        if update_data.name is not None:
            update_fields["name"] = update_data.name
        if update_data.description is not None:
            update_fields["description"] = update_data.description
        if update_data.risk_level is not None:
            valid_risk_levels = ["low", "medium", "high", "critical"]
            if update_data.risk_level not in valid_risk_levels:
                raise HTTPException(status_code=400, detail="Invalid risk level")
            update_fields["risk_level"] = update_data.risk_level
        if update_data.category is not None:
            update_fields["category"] = update_data.category
        if update_data.verified is not None:
            update_fields["verified"] = update_data.verified
        
        update_fields["updated_at"] = datetime.utcnow().isoformat()
        
        # Update the location
        await db.danger_locations.update_one(
            {"_id": obj_id},
            {"$set": update_fields}
        )
        
        # Return updated location
        updated_location = await db.danger_locations.find_one({"_id": obj_id})
        updated_location["id"] = str(updated_location["_id"])
        del updated_location["_id"]
        
        return {"message": "Danger location updated successfully", "location": updated_location}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating danger location: {e}")
        raise HTTPException(status_code=500, detail="Failed to update danger location")

@app.delete("/api/danger-locations/{location_id}")
async def delete_danger_location(location_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a danger location"""
    try:
        # Convert string ID to ObjectId
        try:
            obj_id = ObjectId(location_id)
        except:
            raise HTTPException(status_code=400, detail="Invalid location ID")
        
        # Check if location exists
        existing_location = await db.danger_locations.find_one({"_id": obj_id})
        if not existing_location:
            raise HTTPException(status_code=404, detail="Danger location not found")
        
        # Delete the location
        await db.danger_locations.delete_one({"_id": obj_id})
        
        return {"message": "Danger location deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting danger location: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete danger location")

@app.get("/api/danger-locations/nearby")
async def get_nearby_danger_locations(lat: float, lng: float, radius: float = 5.0, current_user: dict = Depends(get_current_user)):
    """Get danger locations within a specified radius (in kilometers)"""
    try:
        all_locations = await db.danger_locations.find().to_list(length=None)
        nearby_locations = []
        
        user_location = (lat, lng)
        
        for location in all_locations:
            location_coords = (location["latitude"], location["longitude"])
            distance = geodesic(user_location, location_coords).kilometers
            
            if distance <= radius:
                location["id"] = str(location["_id"])
                location["distance"] = round(distance, 2)
                del location["_id"]
                nearby_locations.append(location)
        
        # Sort by distance
        nearby_locations.sort(key=lambda x: x["distance"])
        
        return {"locations": nearby_locations, "count": len(nearby_locations)}
    
    except Exception as e:
        logger.error(f"Error fetching nearby danger locations: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch nearby danger locations")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
