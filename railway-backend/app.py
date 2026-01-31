#!/usr/bin/env python3
"""
Railway Booking System Backend - IRCTC Clone
Real backend with database operations, PNR generation, seat management
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
import uvicorn
import asyncio
import logging
from datetime import datetime, timedelta, date
import random
import string
import hashlib
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Railway Booking System API",
    description="Complete Railway Booking Backend - IRCTC Clone",
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

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.railway_system

# Collections
trains_collection = db.trains
stations_collection = db.stations
bookings_collection = db.bookings
passengers_collection = db.passengers
users_collection = db.users
payments_collection = db.payments
seat_availability_collection = db.seat_availability

# Pydantic Models
class Station(BaseModel):
    code: str
    name: str
    city: str
    state: str
    zone: str
    latitude: float
    longitude: float
    facilities: List[str] = []

class TrainSchedule(BaseModel):
    station_code: str
    station_name: str
    arrival_time: Optional[str] = None
    departure_time: str
    halt_time: int = 0  # in minutes
    distance: float = 0.0  # from source
    day: int = 1  # journey day

class Train(BaseModel):
    number: str
    name: str
    type: str  # Express, Superfast, Passenger, etc.
    source_station: str
    destination_station: str
    schedule: List[TrainSchedule]
    classes: Dict[str, Dict[str, Any]]  # class_code: {seats, fare_per_km, etc}
    runs_on: List[str]  # Days of week
    distance: float
    duration: str  # HH:MM format

class Passenger(BaseModel):
    name: str
    age: int
    gender: str
    berth_preference: Optional[str] = None
    id_type: str
    id_number: str

class BookingRequest(BaseModel):
    train_number: str
    source_station: str
    destination_station: str
    journey_date: date
    class_code: str
    passengers: List[Passenger]
    payment_method: str

class PNRStatus(BaseModel):
    pnr: str
    train_number: str
    train_name: str
    source_station: str
    destination_station: str
    journey_date: date
    booking_date: datetime
    status: str
    passengers: List[Dict[str, Any]]
    total_fare: float
    payment_status: str

# Utility Functions
def generate_pnr() -> str:
    """Generate 10-digit PNR number"""
    return ''.join(random.choices(string.digits, k=10))

def generate_ticket_number() -> str:
    """Generate ticket number"""
    return f"T{random.randint(100000, 999999)}"

def calculate_fare(distance: float, class_code: str, base_fare_per_km: float) -> float:
    """Calculate fare based on distance and class"""
    class_multipliers = {
        "SL": 1.0,      # Sleeper
        "3A": 2.5,      # AC 3 Tier
        "2A": 3.5,      # AC 2 Tier
        "1A": 5.0,      # AC First Class
        "CC": 1.8,      # Chair Car
        "EC": 2.2,      # Executive Chair Car
        "2S": 0.6,      # Second Sitting
    }
    
    multiplier = class_multipliers.get(class_code, 1.0)
    base_fare = distance * base_fare_per_km * multiplier
    
    # Add taxes and service charges
    service_charge = base_fare * 0.05  # 5% service charge
    gst = base_fare * 0.05  # 5% GST
    
    return round(base_fare + service_charge + gst, 2)

async def initialize_railway_data():
    """Initialize database with real railway data"""
    
    # Check if data already exists
    station_count = await stations_collection.count_documents({})
    if station_count > 0:
        logger.info("Railway data already initialized")
        return
    
    logger.info("Initializing railway database...")
    
    # Major Indian Railway Stations
    stations_data = [
        {"code": "NDLS", "name": "New Delhi", "city": "Delhi", "state": "Delhi", "zone": "NR", "latitude": 28.6434, "longitude": 77.2197, "facilities": ["WiFi", "Waiting Room", "Food Court", "ATM"]},
        {"code": "CST", "name": "Mumbai CST", "city": "Mumbai", "state": "Maharashtra", "zone": "CR", "latitude": 18.9398, "longitude": 72.8355, "facilities": ["WiFi", "Waiting Room", "Food Court", "ATM", "Medical"]},
        {"code": "HWH", "name": "Howrah Junction", "city": "Kolkata", "state": "West Bengal", "zone": "ER", "latitude": 22.5833, "longitude": 88.3467, "facilities": ["WiFi", "Waiting Room", "Food Court", "ATM"]},
        {"code": "MAS", "name": "Chennai Central", "city": "Chennai", "state": "Tamil Nadu", "zone": "SR", "latitude": 13.0827, "longitude": 80.2707, "facilities": ["WiFi", "Waiting Room", "Food Court", "ATM"]},
        {"code": "SBC", "name": "Bangalore City", "city": "Bangalore", "state": "Karnataka", "zone": "SWR", "latitude": 12.9716, "longitude": 77.5946, "facilities": ["WiFi", "Waiting Room", "Food Court", "ATM"]},
        {"code": "PUNE", "name": "Pune Junction", "city": "Pune", "state": "Maharashtra", "zone": "CR", "latitude": 18.5204, "longitude": 73.8567, "facilities": ["WiFi", "Waiting Room", "Food Court", "ATM"]},
        {"code": "JP", "name": "Jaipur Junction", "city": "Jaipur", "state": "Rajasthan", "zone": "NWR", "latitude": 26.9124, "longitude": 75.7873, "facilities": ["WiFi", "Waiting Room", "Food Court", "ATM"]},
        {"code": "LKO", "name": "Lucknow NR", "city": "Lucknow", "state": "Uttar Pradesh", "zone": "NER", "latitude": 26.8467, "longitude": 80.9462, "facilities": ["WiFi", "Waiting Room", "Food Court", "ATM"]},
        {"code": "AGC", "name": "Agra Cantt", "city": "Agra", "state": "Uttar Pradesh", "zone": "NCR", "latitude": 27.1767, "longitude": 78.0081, "facilities": ["WiFi", "Waiting Room", "Food Court", "ATM"]},
        {"code": "VSKP", "name": "Visakhapatnam", "city": "Visakhapatnam", "state": "Andhra Pradesh", "zone": "ECoR", "latitude": 17.6868, "longitude": 83.2185, "facilities": ["WiFi", "Waiting Room", "Food Court", "ATM"]},
    ]
    
    await stations_collection.insert_many(stations_data)
    logger.info(f"Inserted {len(stations_data)} stations")
    
    # Popular Trains with Real Data
    trains_data = [
        {
            "number": "12301",
            "name": "Rajdhani Express",
            "type": "Rajdhani",
            "source_station": "NDLS",
            "destination_station": "HWH",
            "schedule": [
                {"station_code": "NDLS", "station_name": "New Delhi", "departure_time": "16:55", "halt_time": 0, "distance": 0, "day": 1},
                {"station_code": "CNB", "station_name": "Kanpur Central", "arrival_time": "21:40", "departure_time": "21:45", "halt_time": 5, "distance": 441, "day": 1},
                {"station_code": "ALD", "station_name": "Allahabad Jn", "arrival_time": "23:28", "departure_time": "23:33", "halt_time": 5, "distance": 635, "day": 1},
                {"station_code": "HWH", "station_name": "Howrah Junction", "arrival_time": "06:55", "departure_time": None, "halt_time": 0, "distance": 1441, "day": 2}
            ],
            "classes": {
                "1A": {"seats": 18, "fare_per_km": 4.5, "name": "AC First Class"},
                "2A": {"seats": 46, "fare_per_km": 3.2, "name": "AC 2 Tier"},
                "3A": {"seats": 64, "fare_per_km": 2.1, "name": "AC 3 Tier"}
            },
            "runs_on": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            "distance": 1441,
            "duration": "14:00"
        },
        {
            "number": "12002",
            "name": "Shatabdi Express",
            "type": "Shatabdi",
            "source_station": "NDLS",
            "destination_station": "AGC",
            "schedule": [
                {"station_code": "NDLS", "station_name": "New Delhi", "departure_time": "06:00", "halt_time": 0, "distance": 0, "day": 1},
                {"station_code": "AGC", "station_name": "Agra Cantt", "arrival_time": "08:05", "departure_time": None, "halt_time": 0, "distance": 199, "day": 1}
            ],
            "classes": {
                "CC": {"seats": 78, "fare_per_km": 2.8, "name": "Chair Car"},
                "EC": {"seats": 20, "fare_per_km": 4.2, "name": "Executive Chair Car"}
            },
            "runs_on": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "distance": 199,
            "duration": "02:05"
        },
        {
            "number": "12622",
            "name": "Tamil Nadu Express",
            "type": "Mail/Express",
            "source_station": "NDLS",
            "destination_station": "MAS",
            "schedule": [
                {"station_code": "NDLS", "station_name": "New Delhi", "departure_time": "22:30", "halt_time": 0, "distance": 0, "day": 1},
                {"station_code": "AGC", "station_name": "Agra Cantt", "arrival_time": "01:40", "departure_time": "01:45", "halt_time": 5, "distance": 199, "day": 2},
                {"station_code": "JHS", "station_name": "Jhansi Jn", "arrival_time": "03:58", "departure_time": "04:08", "halt_time": 10, "distance": 415, "day": 2},
                {"station_code": "BPL", "station_name": "Bhopal Jn", "arrival_time": "07:00", "departure_time": "07:10", "halt_time": 10, "distance": 707, "day": 2},
                {"station_code": "ET", "station_name": "Itarsi Jn", "arrival_time": "08:25", "departure_time": "08:35", "halt_time": 10, "distance": 786, "day": 2},
                {"station_code": "NGP", "station_name": "Nagpur", "arrival_time": "12:15", "departure_time": "12:25", "halt_time": 10, "distance": 1081, "day": 2},
                {"station_code": "BZA", "station_name": "Vijayawada Jn", "arrival_time": "21:40", "departure_time": "21:50", "halt_time": 10, "distance": 1568, "day": 2},
                {"station_code": "MAS", "station_name": "Chennai Central", "arrival_time": "06:45", "departure_time": None, "halt_time": 0, "distance": 2180, "day": 3}
            ],
            "classes": {
                "SL": {"seats": 72, "fare_per_km": 0.8, "name": "Sleeper"},
                "3A": {"seats": 64, "fare_per_km": 2.1, "name": "AC 3 Tier"},
                "2A": {"seats": 46, "fare_per_km": 3.2, "name": "AC 2 Tier"},
                "1A": {"seats": 18, "fare_per_km": 4.5, "name": "AC First Class"}
            },
            "runs_on": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            "distance": 2180,
            "duration": "32:15"
        }
    ]
    
    await trains_collection.insert_many(trains_data)
    logger.info(f"Inserted {len(trains_data)} trains")
    
    # Initialize seat availability for next 120 days
    await initialize_seat_availability()
    
    logger.info("Railway database initialization completed")

async def initialize_seat_availability():
    """Initialize seat availability for all trains for next 120 days"""
    trains = await trains_collection.find({}).to_list(length=None)
    
    for train in trains:
        for i in range(120):  # Next 120 days
            journey_date = date.today() + timedelta(days=i)
            
            # Skip if train doesn't run on this day
            day_name = journey_date.strftime("%A")
            if day_name not in train["runs_on"]:
                continue
            
            for class_code, class_info in train["classes"].items():
                availability_doc = {
                    "train_number": train["number"],
                    "journey_date": journey_date,
                    "class_code": class_code,
                    "total_seats": class_info["seats"],
                    "available_seats": class_info["seats"],
                    "booked_seats": 0,
                    "waiting_list": 0,
                    "created_at": datetime.now()
                }
                
                # Check if already exists
                existing = await seat_availability_collection.find_one({
                    "train_number": train["number"],
                    "journey_date": journey_date,
                    "class_code": class_code
                })
                
                if not existing:
                    await seat_availability_collection.insert_one(availability_doc)

# API Endpoints

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    await initialize_railway_data()

@app.get("/api/stations/search")
async def search_stations(query: str):
    """Search stations by name or code"""
    try:
        # Search by station name or code (case insensitive)
        stations = await stations_collection.find({
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"code": {"$regex": query, "$options": "i"}},
                {"city": {"$regex": query, "$options": "i"}}
            ]
        }).limit(10).to_list(length=10)
        
        # Convert ObjectId to string
        for station in stations:
            station["_id"] = str(station["_id"])
        
        return {"stations": stations}
        
    except Exception as e:
        logger.error(f"Station search error: {e}")
        raise HTTPException(status_code=500, detail="Station search failed")

@app.get("/api/trains/search")
async def search_trains(
    source: str,
    destination: str,
    journey_date: date,
    class_code: Optional[str] = None
):
    """Search trains between stations"""
    try:
        # Find trains that have both source and destination in their route
        trains_cursor = trains_collection.find({
            "schedule.station_code": {"$all": [source, destination]}
        })
        
        available_trains = []
        
        async for train in trains_cursor:
            # Check if train runs on the requested date
            day_name = journey_date.strftime("%A")
            if day_name not in train["runs_on"]:
                continue
            
            # Find source and destination in schedule
            source_stop = None
            dest_stop = None
            
            for stop in train["schedule"]:
                if stop["station_code"] == source:
                    source_stop = stop
                elif stop["station_code"] == destination and source_stop:
                    dest_stop = stop
                    break
            
            if not source_stop or not dest_stop:
                continue
            
            # Calculate distance and duration for this segment
            segment_distance = dest_stop["distance"] - source_stop["distance"]
            
            # Get seat availability
            classes_availability = {}
            for cls_code, cls_info in train["classes"].items():
                if class_code and cls_code != class_code:
                    continue
                
                availability = await seat_availability_collection.find_one({
                    "train_number": train["number"],
                    "journey_date": journey_date,
                    "class_code": cls_code
                })
                
                if availability:
                    fare = calculate_fare(segment_distance, cls_code, cls_info["fare_per_km"])
                    classes_availability[cls_code] = {
                        "name": cls_info["name"],
                        "available_seats": availability["available_seats"],
                        "total_seats": availability["total_seats"],
                        "fare": fare,
                        "status": "AVAILABLE" if availability["available_seats"] > 0 else "WAITING LIST"
                    }
            
            if classes_availability:
                train_info = {
                    "train_number": train["number"],
                    "train_name": train["name"],
                    "train_type": train["type"],
                    "source_station": source,
                    "destination_station": destination,
                    "departure_time": source_stop["departure_time"],
                    "arrival_time": dest_stop.get("arrival_time", dest_stop["departure_time"]),
                    "duration": f"{int(segment_distance/60):02d}:{int(segment_distance%60):02d}",
                    "distance": segment_distance,
                    "classes": classes_availability,
                    "journey_date": journey_date
                }
                available_trains.append(train_info)
        
        return {"trains": available_trains, "count": len(available_trains)}
        
    except Exception as e:
        logger.error(f"Train search error: {e}")
        raise HTTPException(status_code=500, detail="Train search failed")

@app.post("/api/booking/create")
async def create_booking(booking_request: BookingRequest, background_tasks: BackgroundTasks):
    """Create a new booking"""
    try:
        # Validate train and availability
        train = await trains_collection.find_one({"number": booking_request.train_number})
        if not train:
            raise HTTPException(status_code=404, detail="Train not found")
        
        # Check seat availability
        availability = await seat_availability_collection.find_one({
            "train_number": booking_request.train_number,
            "journey_date": booking_request.journey_date,
            "class_code": booking_request.class_code
        })
        
        if not availability:
            raise HTTPException(status_code=404, detail="No availability data found")
        
        required_seats = len(booking_request.passengers)
        if availability["available_seats"] < required_seats:
            raise HTTPException(status_code=400, detail="Insufficient seats available")
        
        # Calculate fare
        source_stop = None
        dest_stop = None
        for stop in train["schedule"]:
            if stop["station_code"] == booking_request.source_station:
                source_stop = stop
            elif stop["station_code"] == booking_request.destination_station and source_stop:
                dest_stop = stop
                break
        
        if not source_stop or not dest_stop:
            raise HTTPException(status_code=400, detail="Invalid route")
        
        segment_distance = dest_stop["distance"] - source_stop["distance"]
        class_info = train["classes"][booking_request.class_code]
        fare_per_passenger = calculate_fare(segment_distance, booking_request.class_code, class_info["fare_per_km"])
        total_fare = fare_per_passenger * len(booking_request.passengers)
        
        # Generate PNR and ticket number
        pnr = generate_pnr()
        ticket_number = generate_ticket_number()
        
        # Create booking document
        booking_doc = {
            "pnr": pnr,
            "ticket_number": ticket_number,
            "train_number": booking_request.train_number,
            "train_name": train["name"],
            "source_station": booking_request.source_station,
            "destination_station": booking_request.destination_station,
            "journey_date": booking_request.journey_date,
            "class_code": booking_request.class_code,
            "class_name": class_info["name"],
            "passengers": [passenger.dict() for passenger in booking_request.passengers],
            "total_fare": total_fare,
            "fare_per_passenger": fare_per_passenger,
            "booking_date": datetime.now(),
            "status": "CONFIRMED",
            "payment_status": "PENDING",
            "payment_method": booking_request.payment_method,
            "departure_time": source_stop["departure_time"],
            "arrival_time": dest_stop.get("arrival_time", dest_stop["departure_time"]),
            "distance": segment_distance
        }
        
        # Insert booking
        result = await bookings_collection.insert_one(booking_doc)
        booking_doc["_id"] = str(result.inserted_id)
        
        # Update seat availability
        await seat_availability_collection.update_one(
            {
                "train_number": booking_request.train_number,
                "journey_date": booking_request.journey_date,
                "class_code": booking_request.class_code
            },
            {
                "$inc": {
                    "available_seats": -required_seats,
                    "booked_seats": required_seats
                }
            }
        )
        
        # Process payment in background
        background_tasks.add_task(process_payment, pnr, total_fare, booking_request.payment_method)
        
        return {
            "success": True,
            "pnr": pnr,
            "ticket_number": ticket_number,
            "booking_details": booking_doc,
            "message": "Booking created successfully. Payment processing..."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Booking creation error: {e}")
        raise HTTPException(status_code=500, detail="Booking creation failed")

async def process_payment(pnr: str, amount: float, payment_method: str):
    """Process payment in background"""
    try:
        # Simulate payment processing delay
        await asyncio.sleep(2)
        
        # Simulate payment success (90% success rate)
        payment_success = random.random() < 0.9
        
        payment_doc = {
            "pnr": pnr,
            "amount": amount,
            "payment_method": payment_method,
            "transaction_id": f"TXN{random.randint(100000000, 999999999)}",
            "status": "SUCCESS" if payment_success else "FAILED",
            "processed_at": datetime.now()
        }
        
        await payments_collection.insert_one(payment_doc)
        
        # Update booking payment status
        await bookings_collection.update_one(
            {"pnr": pnr},
            {"$set": {"payment_status": "SUCCESS" if payment_success else "FAILED"}}
        )
        
        logger.info(f"Payment processed for PNR {pnr}: {payment_doc['status']}")
        
    except Exception as e:
        logger.error(f"Payment processing error for PNR {pnr}: {e}")

@app.get("/api/pnr/{pnr}")
async def get_pnr_status(pnr: str):
    """Get PNR status and booking details"""
    try:
        booking = await bookings_collection.find_one({"pnr": pnr})
        if not booking:
            raise HTTPException(status_code=404, detail="PNR not found")
        
        # Get payment details
        payment = await payments_collection.find_one({"pnr": pnr})
        
        # Convert ObjectId to string
        booking["_id"] = str(booking["_id"])
        
        # Add payment info
        if payment:
            booking["transaction_id"] = payment.get("transaction_id")
            booking["payment_processed_at"] = payment.get("processed_at")
        
        return {"booking": booking}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PNR status error: {e}")
        raise HTTPException(status_code=500, detail="PNR status retrieval failed")

@app.get("/api/trains/{train_number}")
async def get_train_details(train_number: str):
    """Get detailed train information"""
    try:
        train = await trains_collection.find_one({"number": train_number})
        if not train:
            raise HTTPException(status_code=404, detail="Train not found")
        
        train["_id"] = str(train["_id"])
        return {"train": train}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Train details error: {e}")
        raise HTTPException(status_code=500, detail="Train details retrieval failed")

@app.get("/api/fare/calculate")
async def calculate_fare_api(
    train_number: str,
    source: str,
    destination: str,
    class_code: str
):
    """Calculate fare for a journey"""
    try:
        train = await trains_collection.find_one({"number": train_number})
        if not train:
            raise HTTPException(status_code=404, detail="Train not found")
        
        # Find source and destination in schedule
        source_stop = None
        dest_stop = None
        
        for stop in train["schedule"]:
            if stop["station_code"] == source:
                source_stop = stop
            elif stop["station_code"] == destination and source_stop:
                dest_stop = stop
                break
        
        if not source_stop or not dest_stop:
            raise HTTPException(status_code=400, detail="Invalid route")
        
        if class_code not in train["classes"]:
            raise HTTPException(status_code=400, detail="Invalid class")
        
        segment_distance = dest_stop["distance"] - source_stop["distance"]
        class_info = train["classes"][class_code]
        fare = calculate_fare(segment_distance, class_code, class_info["fare_per_km"])
        
        return {
            "train_number": train_number,
            "train_name": train["name"],
            "source": source,
            "destination": destination,
            "class_code": class_code,
            "class_name": class_info["name"],
            "distance": segment_distance,
            "fare": fare,
            "base_fare_per_km": class_info["fare_per_km"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fare calculation error: {e}")
        raise HTTPException(status_code=500, detail="Fare calculation failed")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Railway Booking System",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
