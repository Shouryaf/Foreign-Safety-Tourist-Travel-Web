from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect, UploadFile, File
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
import uuid
import random
from geopy.distance import geodesic
import aiofiles
# Import payment and transport services - will be implemented inline for now

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.transport_platform

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

class PostCreate(BaseModel):
    content: str
    location: Optional[Dict[str, float]] = None
    transport_mode: Optional[str] = None
    journey_details: Optional[Dict[str, Any]] = None
    images: Optional[List[str]] = []
    model_config = ConfigDict(from_attributes=True)

class CommentCreate(BaseModel):
    content: str
    model_config = ConfigDict(from_attributes=True)

class TransportSearch(BaseModel):
    origin: str
    destination: str
    date: str
    transport_type: str  # train, bus, flight, taxi, metro
    passengers: int = 1
    class_type: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class BookingCreate(BaseModel):
    transport_id: str
    transport_type: str
    passenger_details: List[Dict[str, str]]
    seat_preferences: Optional[Dict[str, Any]] = None
    payment_method: str = "card"
    model_config = ConfigDict(from_attributes=True)

class LocationRequest(BaseModel):
    latitude: float
    longitude: float
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

# Mock transport data
TRAIN_DATA = [
    {
        "id": "T12301",
        "name": "Rajdhani Express",
        "origin": "New Delhi",
        "destination": "Mumbai Central",
        "departure": "16:55",
        "arrival": "08:35",
        "duration": "15h 40m",
        "distance": 1384,
        "classes": {
            "1AC": {"price": 4500, "available": 12},
            "2AC": {"price": 2800, "available": 24},
            "3AC": {"price": 1950, "available": 48},
            "SL": {"price": 650, "available": 72}
        }
    },
    {
        "id": "T12002",
        "name": "Shatabdi Express",
        "origin": "New Delhi",
        "destination": "Chandigarh",
        "departure": "07:20",
        "arrival": "10:45",
        "duration": "3h 25m",
        "distance": 248,
        "classes": {
            "CC": {"price": 850, "available": 36},
            "EC": {"price": 1200, "available": 18}
        }
    }
]

BUS_DATA = [
    {
        "id": "B001",
        "operator": "RedBus Travels",
        "origin": "Delhi",
        "destination": "Jaipur",
        "departure": "22:30",
        "arrival": "05:30",
        "duration": "7h 00m",
        "bus_type": "AC Sleeper",
        "price": 800,
        "available_seats": 15
    },
    {
        "id": "B002",
        "operator": "Volvo Express",
        "origin": "Mumbai",
        "destination": "Pune",
        "departure": "06:00",
        "arrival": "09:30",
        "duration": "3h 30m",
        "bus_type": "AC Semi-Sleeper",
        "price": 450,
        "available_seats": 28
    }
]

FLIGHT_DATA = [
    {
        "id": "F6E101",
        "airline": "IndiGo",
        "origin": "DEL",
        "destination": "BOM",
        "departure": "14:30",
        "arrival": "16:45",
        "duration": "2h 15m",
        "aircraft": "A320",
        "price": 4500,
        "available_seats": 45
    },
    {
        "id": "FAI202",
        "airline": "Air India",
        "origin": "BOM",
        "destination": "BLR",
        "departure": "09:15",
        "arrival": "10:45",
        "duration": "1h 30m",
        "aircraft": "A321",
        "price": 3200,
        "available_seats": 32
    }
]

# WebSocket connection manager
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
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user and "followers" in user:
            for follower_id in user["followers"]:
                follower_id_str = str(follower_id)
                if follower_id_str in self.active_connections:
                    try:
                        await self.active_connections[follower_id_str].send_text(message)
                    except:
                        self.disconnect(follower_id_str)

manager = ConnectionManager()

# Main Routes
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
        await db.command("ping")
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

# Authentication Routes
@app.post("/api/register")
async def register_user(user_data: UserCreate):
    try:
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")

        hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
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
            "followers": [],
            "following": [],
            "created_at": datetime.utcnow()
        }

        result = await db.users.insert_one(user_doc)
        user_id = str(result.inserted_id)

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
        raise HTTPException(status_code=500, detail="Registration failed")

@app.post("/api/login")
async def login_user(login_data: UserLogin):
    try:
        user = await db.users.find_one({"email": login_data.email})
        if not user:
            raise HTTPException(status_code=400, detail="Invalid credentials")

        if not bcrypt.checkpw(login_data.password.encode('utf-8'), user["password"].encode('utf-8')):
            raise HTTPException(status_code=400, detail="Invalid credentials")

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
        raise HTTPException(status_code=500, detail="Login failed")

# Social Media Routes
@app.post("/api/social/posts")
async def create_post(post_data: PostCreate, current_user: dict = Depends(get_current_user)):
    try:
        post_doc = {
            "user_id": ObjectId(current_user["_id"]),
            "content": post_data.content,
            "images": post_data.images or [],
            "location": post_data.location,
            "transport_mode": post_data.transport_mode,
            "journey_details": post_data.journey_details,
            "likes": [],
            "comments": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.posts.insert_one(post_doc)
        
        await db.users.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$inc": {"social_stats.posts": 1}}
        )
        
        return {"success": True, "post_id": str(result.inserted_id)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create post: {str(e)}")

@app.get("/api/social/feed")
async def get_feed(
    page: int = 1, 
    limit: int = 20,
    location_filter: Optional[str] = None,
    transport_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        skip = (page - 1) * limit
        
        pipeline = [
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_id",
                    "foreignField": "_id",
                    "as": "user"
                }
            },
            {"$unwind": "$user"},
            {
                "$addFields": {
                    "likes_count": {"$size": "$likes"},
                    "comments_count": {"$size": "$comments"},
                    "is_liked": {"$in": [ObjectId(current_user["_id"]), "$likes"]}
                }
            },
            {"$sort": {"created_at": -1}},
            {"$skip": skip},
            {"$limit": limit}
        ]
        
        match_conditions = {}
        if location_filter:
            match_conditions["location"] = {"$exists": True}
        if transport_filter:
            match_conditions["transport_mode"] = transport_filter
            
        if match_conditions:
            pipeline.insert(0, {"$match": match_conditions})
        
        posts = await db.posts.aggregate(pipeline).to_list(length=limit)
        
        formatted_posts = []
        for post in posts:
            formatted_posts.append({
                "id": str(post["_id"]),
                "user_id": str(post["user_id"]),
                "user_name": post["user"]["name"],
                "user_avatar": post["user"].get("profile_picture"),
                "content": post["content"],
                "images": post.get("images", []),
                "location": post.get("location"),
                "transport_mode": post.get("transport_mode"),
                "journey_details": post.get("journey_details"),
                "likes_count": post["likes_count"],
                "comments_count": post["comments_count"],
                "is_liked": post["is_liked"],
                "created_at": post["created_at"]
            })
        
        return formatted_posts
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch feed: {str(e)}")

@app.post("/api/social/posts/{post_id}/like")
async def toggle_like(post_id: str, current_user: dict = Depends(get_current_user)):
    try:
        user_id = ObjectId(current_user["_id"])
        post_obj_id = ObjectId(post_id)
        
        post = await db.posts.find_one({"_id": post_obj_id})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        if user_id in post.get("likes", []):
            await db.posts.update_one(
                {"_id": post_obj_id},
                {"$pull": {"likes": user_id}}
            )
            is_liked = False
        else:
            await db.posts.update_one(
                {"_id": post_obj_id},
                {"$addToSet": {"likes": user_id}}
            )
            is_liked = True
        
        updated_post = await db.posts.find_one({"_id": post_obj_id})
        likes_count = len(updated_post.get("likes", []))
        
        return {"success": True, "is_liked": is_liked, "likes_count": likes_count}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to toggle like: {str(e)}")

# Transport Routes
@app.post("/api/transport/search")
async def search_transport(search_data: TransportSearch, current_user: dict = Depends(get_current_user)):
    try:
        results = []
        
        if search_data.transport_type == "train":
            for train in TRAIN_DATA:
                if (search_data.origin.lower() in train["origin"].lower() or 
                    search_data.destination.lower() in train["destination"].lower()):
                    results.append({
                        **train,
                        "type": "train",
                        "search_date": search_data.date
                    })
        
        elif search_data.transport_type == "bus":
            for bus in BUS_DATA:
                if (search_data.origin.lower() in bus["origin"].lower() or 
                    search_data.destination.lower() in bus["destination"].lower()):
                    results.append({
                        **bus,
                        "type": "bus",
                        "search_date": search_data.date
                    })
        
        elif search_data.transport_type == "flight":
            for flight in FLIGHT_DATA:
                results.append({
                    **flight,
                    "type": "flight",
                    "search_date": search_data.date
                })
        
        elif search_data.transport_type == "taxi":
            distance = random.randint(5, 50)
            base_fare = distance * 12
            results = [
                {
                    "id": "TX001",
                    "type": "taxi",
                    "service": "Ola",
                    "car_type": "Mini",
                    "origin": search_data.origin,
                    "destination": search_data.destination,
                    "estimated_time": f"{distance//10 + 15} minutes",
                    "distance": f"{distance} km",
                    "price": base_fare,
                    "available": True
                },
                {
                    "id": "TX002",
                    "type": "taxi",
                    "service": "Uber",
                    "car_type": "Go",
                    "origin": search_data.origin,
                    "destination": search_data.destination,
                    "estimated_time": f"{distance//10 + 12} minutes",
                    "distance": f"{distance} km",
                    "price": base_fare + 50,
                    "available": True
                }
            ]
        
        return {"results": results, "count": len(results)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.post("/api/transport/book")
async def create_booking(booking_data: BookingCreate, current_user: dict = Depends(get_current_user)):
    try:
        pnr = f"{booking_data.transport_type.upper()}{random.randint(1000000000, 9999999999)}"
        
        booking_doc = {
            "user_id": ObjectId(current_user["_id"]),
            "pnr": pnr,
            "transport_id": booking_data.transport_id,
            "transport_type": booking_data.transport_type,
            "passenger_details": booking_data.passenger_details,
            "seat_preferences": booking_data.seat_preferences,
            "payment_method": booking_data.payment_method,
            "status": "confirmed",
            "booking_date": datetime.utcnow(),
            "payment_status": "completed",
            "amount": random.randint(500, 5000)
        }
        
        result = await db.bookings.insert_one(booking_doc)
        
        return {
            "success": True,
            "booking_id": str(result.inserted_id),
            "pnr": pnr,
            "status": "confirmed"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Booking failed: {str(e)}")

@app.get("/api/transport/bookings")
async def get_user_bookings(current_user: dict = Depends(get_current_user)):
    try:
        bookings = await db.bookings.find(
            {"user_id": ObjectId(current_user["_id"])}
        ).sort("booking_date", -1).to_list(length=50)
        
        formatted_bookings = []
        for booking in bookings:
            formatted_bookings.append({
                "id": str(booking["_id"]),
                "pnr": booking["pnr"],
                "transport_id": booking["transport_id"],
                "transport_type": booking["transport_type"],
                "passenger_details": booking["passenger_details"],
                "status": booking["status"],
                "booking_date": booking["booking_date"],
                "payment_status": booking["payment_status"],
                "amount": booking["amount"]
            })
        
        return {"bookings": formatted_bookings}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch bookings: {str(e)}")

@app.post("/api/location/update")
async def update_location(location_data: LocationRequest, current_user: dict = Depends(get_current_user)):
    try:
        await db.users.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {
                "$set": {
                    "location": {
                        "latitude": location_data.latitude,
                        "longitude": location_data.longitude,
                        "updated_at": datetime.utcnow()
                    }
                }
            }
        )
        
        return {"success": True, "message": "Location updated successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Location update failed: {str(e)}")

# WebSocket endpoint for real-time features
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "location_update":
                await manager.broadcast_to_followers(
                    json.dumps({
                        "type": "friend_location_update",
                        "user_id": user_id,
                        "location": message.get("location")
                    }),
                    user_id
                )
            
            elif message.get("type") == "new_post":
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

# Payment Gateway Routes
@app.post("/api/payments/create")
async def create_payment(payment_data: dict, current_user: dict = Depends(get_current_user)):
    """Create payment intent"""
    # Mock payment creation for now
    payment_id = f"pay_{uuid.uuid4().hex[:12]}"
    return {
        "payment_id": payment_id,
        "status": "pending",
        "amount": payment_data.get("amount", 0),
        "currency": payment_data.get("currency", "INR"),
        "client_secret": f"pi_{uuid.uuid4().hex}_secret"
    }

@app.get("/api/payments/methods")
async def get_payment_methods(current_user: dict = Depends(get_current_user)):
    """Get available payment methods"""
    return {
        "payment_methods": [
            {
                "id": "stripe",
                "name": "Credit/Debit Card",
                "type": "card",
                "enabled": True,
                "fees": "2.9% + ₹3"
            },
            {
                "id": "razorpay",
                "name": "Razorpay",
                "type": "gateway",
                "enabled": True,
                "fees": "2% + ₹2"
            },
            {
                "id": "upi",
                "name": "UPI",
                "type": "upi",
                "enabled": True,
                "fees": "Free"
            },
            {
                "id": "wallet",
                "name": "TrainXceralate Wallet",
                "type": "wallet",
                "enabled": True,
                "fees": "Free",
                "balance": 1500.0
            }
        ]
    }

@app.post("/api/payments/verify/{payment_id}")
async def verify_payment(payment_id: str, payment_method: str, current_user: dict = Depends(get_current_user)):
    """Verify payment status"""
    # Mock payment verification
    result = {
        "payment_id": payment_id,
        "status": "captured",
        "amount": 500,
        "currency": "INR"
    }
    
    # Update booking status if payment successful
    if result["status"] in ["succeeded", "captured"]:
        await db.bookings.update_one(
            {"payment_id": payment_id},
            {"$set": {"status": "confirmed", "payment_status": "completed"}}
        )
    
    return result

@app.post("/api/payments/refund")
async def process_refund(refund_data: dict, current_user: dict = Depends(get_current_user)):
    """Process payment refund"""
    # Mock refund processing
    return {
        "refund_id": f"refund_{uuid.uuid4().hex[:12]}",
        "status": "processed",
        "amount": refund_data.get("amount", 0)
    }

# Real-time Transport Data Routes
@app.get("/api/transport/schedules/{transport_type}")
async def get_transport_schedules(
    transport_type: str,
    from_location: str,
    to_location: str,
    date: str,
    current_user: dict = Depends(get_current_user)
):
    """Get real-time transport schedules"""
    # Mock transport schedules
    schedules = []
    operators = {
        "train": ["Indian Railways", "Metro Rail"],
        "bus": ["KSRTC", "MSRTC", "Private Travels"],
        "flight": ["IndiGo", "Air India", "SpiceJet"],
        "taxi": ["Uber", "Ola", "Local Taxi"],
        "metro": ["Delhi Metro", "Mumbai Metro"]
    }
    
    for i in range(3):
        departure = datetime.utcnow() + timedelta(hours=random.randint(1, 8))
        arrival = departure + timedelta(hours=random.randint(1, 4))
        
        schedules.append({
            "transport_id": f"{transport_type.upper()}{1000 + i}",
            "transport_type": transport_type,
            "route": f"{from_location} - {to_location}",
            "departure_time": departure.isoformat(),
            "arrival_time": arrival.isoformat(),
            "available_seats": random.randint(10, 100),
            "total_seats": 120,
            "price": random.randint(200, 2000),
            "operator": random.choice(operators.get(transport_type, ["Generic Operator"])),
            "status": random.choice(["on_time", "delayed", "on_time", "on_time"])
        })
    
    return schedules

@app.get("/api/transport/tracking/{transport_id}")
async def get_live_tracking(transport_id: str, current_user: dict = Depends(get_current_user)):
    """Get live tracking data"""
    return {
        "transport_id": transport_id,
        "current_location": {
            "lat": 28.6139 + random.uniform(-0.1, 0.1),
            "lng": 77.2090 + random.uniform(-0.1, 0.1)
        },
        "next_stop": random.choice(["Central Station", "Junction", "Terminal", "Airport"]),
        "estimated_arrival": (datetime.utcnow() + timedelta(minutes=random.randint(10, 120))).isoformat(),
        "delay_minutes": random.randint(-5, 30),
        "speed": random.randint(40, 120),
        "occupancy_percentage": random.randint(30, 95)
    }

@app.get("/api/transport/weather/{location}")
async def get_weather_impact(location: str, current_user: dict = Depends(get_current_user)):
    """Get weather impact on transport"""
    weather_condition = random.choice(["Clear", "Cloudy", "Rainy", "Foggy"])
    return {
        "weather": {
            "location": location,
            "temperature": random.randint(15, 35),
            "condition": weather_condition,
            "visibility": random.randint(5, 10),
            "precipitation": random.randint(0, 50),
            "wind_speed": random.randint(5, 25)
        },
        "transport_impact": {
            "train": "minimal" if weather_condition != "Foggy" else "high",
            "bus": "moderate" if weather_condition == "Rainy" else "minimal",
            "flight": "high" if weather_condition in ["Rainy", "Foggy"] else "minimal",
            "metro": "minimal",
            "taxi": "moderate" if weather_condition == "Rainy" else "minimal"
        },
        "recommendations": [
            "Check for transport delays" if weather_condition == "Foggy" else "Weather is favorable for travel",
            "Carry umbrella" if weather_condition == "Rainy" else "No special precautions needed"
        ]
    }

@app.post("/api/transport/optimize-route")
async def optimize_route(
    route_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Get optimized route suggestions"""
    from_location = route_data.get("from_location", "")
    to_location = route_data.get("to_location", "")
    preferences = route_data.get("preferences", {})
    
    routes = [
        {
            "route_id": "route_1",
            "transport_modes": ["metro", "bus"],
            "total_time": 45,
            "total_cost": 35,
            "comfort_score": 7,
            "eco_score": 9,
            "steps": [
                {"mode": "metro", "from": from_location, "to": "Central Hub", "time": 20, "cost": 25},
                {"mode": "bus", "from": "Central Hub", "to": to_location, "time": 25, "cost": 10}
            ]
        },
        {
            "route_id": "route_2",
            "transport_modes": ["taxi"],
            "total_time": 30,
            "total_cost": 250,
            "comfort_score": 9,
            "eco_score": 4,
            "steps": [
                {"mode": "taxi", "from": from_location, "to": to_location, "time": 30, "cost": 250}
            ]
        }
    ]
    
    return {
        "optimized_routes": routes,
        "recommendation": routes[0]["route_id"],
        "savings": {
            "time_saved": random.randint(5, 20),
            "cost_saved": random.randint(10, 50)
        }
    }

# Enhanced Booking Routes with Payment Integration
@app.post("/api/bookings/create-with-payment")
async def create_booking_with_payment(
    booking_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Create booking with integrated payment"""
    try:
        # Create booking first
        booking_id = str(uuid.uuid4())
        booking = {
            "booking_id": booking_id,
            "user_id": current_user["user_id"],
            "transport_type": booking_data["transport_type"],
            "transport_id": booking_data["transport_id"],
            "from_location": booking_data["from_location"],
            "to_location": booking_data["to_location"],
            "departure_time": booking_data["departure_time"],
            "passengers": booking_data["passengers"],
            "total_amount": booking_data["total_amount"],
            "status": "pending_payment",
            "payment_status": "pending",
            "created_at": datetime.utcnow(),
            "booking_reference": f"TXL{random.randint(100000, 999999)}"
        }
        
        await db.bookings.insert_one(booking)
        
        # Create payment intent
        payment_request = PaymentRequest(
            booking_id=booking_id,
            amount=booking_data["total_amount"],
            currency=booking_data.get("currency", "INR"),
            payment_method=booking_data["payment_method"],
            user_id=current_user["user_id"],
            description=f"Booking for {booking_data['transport_type']} - {booking_data['from_location']} to {booking_data['to_location']}"
        )
        
        payment_response = await payment_service.create_payment_intent(payment_request)
        
        # Update booking with payment ID
        await db.bookings.update_one(
            {"booking_id": booking_id},
            {"$set": {"payment_id": payment_response.payment_id}}
        )
        
        return {
            "booking": booking,
            "payment": payment_response.dict()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Booking creation failed: {str(e)}")

# Notification System Enhancement
@app.post("/api/notifications/send")
async def send_notification(
    user_id: str,
    notification_type: str,
    title: str,
    message: str,
    data: dict = None,
    current_user: dict = Depends(get_current_user)
):
    """Send notification to user"""
    notification = {
        "notification_id": str(uuid.uuid4()),
        "user_id": user_id,
        "type": notification_type,
        "title": title,
        "message": message,
        "data": data or {},
        "read": False,
        "created_at": datetime.utcnow()
    }
    
    await db.notifications.insert_one(notification)
    
    # Send real-time notification via WebSocket
    if user_id in manager.active_connections:
        await manager.send_personal_message(
            json.dumps({
                "type": "notification",
                "notification": notification
            }),
            user_id
        )
    
    return {"status": "sent", "notification_id": notification["notification_id"]}

@app.get("/api/notifications")
async def get_notifications(
    limit: int = 20,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get user notifications"""
    notifications = await db.notifications.find(
        {"user_id": current_user["user_id"]}
    ).sort("created_at", -1).skip(offset).limit(limit).to_list(length=limit)
    
    # Convert ObjectId to string
    for notification in notifications:
        notification["_id"] = str(notification["_id"])
    
    return {"notifications": notifications}

@app.put("/api/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark notification as read"""
    result = await db.notifications.update_one(
        {"notification_id": notification_id, "user_id": current_user["user_id"]},
        {"$set": {"read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"status": "marked_as_read"}

# Analytics and Reporting Routes
@app.get("/api/analytics/user-stats")
async def get_user_analytics(current_user: dict = Depends(get_current_user)):
    """Get user analytics and statistics"""
    user_id = current_user["user_id"]
    
    # Get booking statistics
    total_bookings = await db.bookings.count_documents({"user_id": user_id})
    completed_bookings = await db.bookings.count_documents({"user_id": user_id, "status": "completed"})
    total_spent = await db.bookings.aggregate([
        {"$match": {"user_id": user_id, "payment_status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]).to_list(length=1)
    
    # Get social media statistics
    total_posts = await db.posts.count_documents({"user_id": user_id})
    total_likes_received = await db.posts.aggregate([
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": None, "total": {"$sum": {"$size": "$likes"}}}}
    ]).to_list(length=1)
    
    return {
        "bookings": {
            "total": total_bookings,
            "completed": completed_bookings,
            "completion_rate": (completed_bookings / total_bookings * 100) if total_bookings > 0 else 0
        },
        "spending": {
            "total_amount": total_spent[0]["total"] if total_spent else 0,
            "average_booking": (total_spent[0]["total"] / total_bookings) if total_spent and total_bookings > 0 else 0
        },
        "social": {
            "posts": total_posts,
            "likes_received": total_likes_received[0]["total"] if total_likes_received else 0
        }
    }

@app.get("/api/analytics/transport-usage")
async def get_transport_usage_analytics(current_user: dict = Depends(get_current_user)):
    """Get transport usage analytics"""
    user_id = current_user["user_id"]
    
    # Get usage by transport type
    usage_by_type = await db.bookings.aggregate([
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$transport_type", "count": {"$sum": 1}, "total_spent": {"$sum": "$total_amount"}}},
        {"$sort": {"count": -1}}
    ]).to_list(length=10)
    
    # Get monthly usage trend
    monthly_usage = await db.bookings.aggregate([
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m", "date": "$created_at"}},
            "bookings": {"$sum": 1},
            "amount": {"$sum": "$total_amount"}
        }},
        {"$sort": {"_id": 1}}
    ]).to_list(length=12)
    
    return {
        "usage_by_type": usage_by_type,
        "monthly_trend": monthly_usage,
        "recommendations": [
            "Consider metro for short city trips to save money",
            "Book flights in advance for better prices",
            "Use shared transport options for eco-friendly travel"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8004)
