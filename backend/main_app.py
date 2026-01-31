from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv
import uvicorn
import bcrypt
import jwt
from datetime import datetime, timedelta
import json

# Load environment variables
load_dotenv()

# Create main FastAPI app
app = FastAPI(
    title="TrainXceralate - Multi-Modal Transport Platform",
    description="Comprehensive transportation platform with social features, booking system, and real-time tracking",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for image uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(social_router)
app.include_router(transport_router)

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.transport_platform

# WebSocket connection manager for real-time features
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}
        self.user_connections: dict = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.user_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if user_id in self.user_connections:
            del self.user_connections[user_id]

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)

    async def broadcast_to_followers(self, message: str, user_id: str):
        # Get user's followers
        user = await db.users.find_one({"_id": user_id})
        if user and "followers" in user:
            for follower_id in user["followers"]:
                follower_id_str = str(follower_id)
                if follower_id_str in self.active_connections:
                    try:
                        await self.active_connections[follower_id_str].send_text(message)
                    except:
                        self.disconnect(follower_id_str)

manager = ConnectionManager()

@app.get("/")
async def root():
    return {
        "message": "TrainXceralate - Multi-Modal Transport Platform",
        "version": "2.0.0",
        "features": [
            "Multi-modal transport booking (Train, Bus, Flight, Taxi, Metro)",
            "Social media platform with location-based posts",
            "Real-time tracking and notifications",
            "User profiles and social interactions",
            "Location-based services"
        ],
        "status": "running"
    }

@app.get("/health")
async def health_check():
    try:
        # Test database connection
        await db.command("ping")
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }

# WebSocket endpoint for real-time features
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle real-time messages (chat, notifications, etc.)
            import json
            message = json.loads(data)
            
            if message.get("type") == "location_update":
                # Broadcast location update to followers
                await manager.broadcast_to_followers(
                    json.dumps({
                        "type": "friend_location_update",
                        "user_id": user_id,
                        "location": message.get("location")
                    }),
                    user_id
                )
            
            elif message.get("type") == "new_post":
                # Notify followers about new post
                await manager.broadcast_to_followers(
                    json.dumps({
                        "type": "new_post_notification",
                        "user_id": user_id,
                        "post_id": message.get("post_id")
                    }),
                    user_id
                )
                
    except WebSocketDisconnect:
        manager.disconnect(user_id)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
