from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
import uuid
import random
from geopy.distance import geodesic
import requests
from .transport_backend import get_current_user, db

router = APIRouter(prefix="/api/transport", tags=["transport"])

# Pydantic Models
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

METRO_DATA = [
    {
        "id": "M001",
        "line": "Blue Line",
        "origin": "Dwarka Sector 21",
        "destination": "Noida Electronic City",
        "first_train": "05:30",
        "last_train": "23:30",
        "frequency": "2-5 minutes",
        "fare": 60,
        "stations": 50
    },
    {
        "id": "M002",
        "line": "Red Line",
        "origin": "Rithala",
        "destination": "Shaheed Sthal",
        "first_train": "05:45",
        "last_train": "23:15",
        "frequency": "3-6 minutes",
        "fare": 45,
        "stations": 29
    }
]

@router.post("/search")
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
        
        elif search_data.transport_type == "metro":
            for metro in METRO_DATA:
                if (search_data.origin.lower() in metro["origin"].lower() or 
                    search_data.destination.lower() in metro["destination"].lower()):
                    results.append({
                        **metro,
                        "type": "metro",
                        "search_date": search_data.date
                    })
        
        elif search_data.transport_type == "taxi":
            # Generate dynamic taxi options
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

@router.post("/book")
async def create_booking(booking_data: BookingCreate, current_user: dict = Depends(get_current_user)):
    try:
        # Generate PNR/Booking ID
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
            "amount": random.randint(500, 5000)  # Mock amount
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

@router.get("/bookings")
async def get_user_bookings(current_user: dict = Depends(get_current_user)):
    try:
        bookings = await db.bookings.find(
            {"user_id": ObjectId(current_user["_id"])}
        ).sort("booking_date", -1).to_list(length=50)
        
        # Format response
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

@router.get("/booking/{pnr}")
async def get_booking_status(pnr: str, current_user: dict = Depends(get_current_user)):
    try:
        booking = await db.bookings.find_one({"pnr": pnr})
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        return {
            "pnr": booking["pnr"],
            "transport_type": booking["transport_type"],
            "status": booking["status"],
            "passenger_details": booking["passenger_details"],
            "booking_date": booking["booking_date"],
            "payment_status": booking["payment_status"],
            "amount": booking["amount"]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch booking: {str(e)}")

@router.post("/location/update")
async def update_location(location_data: LocationRequest, current_user: dict = Depends(get_current_user)):
    try:
        # Update user location
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

@router.get("/nearby")
async def get_nearby_transport(
    transport_type: str,
    radius: float = 5.0,
    current_user: dict = Depends(get_current_user)
):
    try:
        user = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
        
        if not user or not user.get("location"):
            raise HTTPException(status_code=400, detail="Location not available")
        
        user_location = (user["location"]["latitude"], user["location"]["longitude"])
        
        # Mock nearby transport data
        nearby_options = []
        
        if transport_type == "metro":
            stations = [
                {"name": "Central Metro Station", "lat": user_location[0] + 0.01, "lng": user_location[1] + 0.01},
                {"name": "City Center Metro", "lat": user_location[0] - 0.02, "lng": user_location[1] + 0.015},
                {"name": "Business District Metro", "lat": user_location[0] + 0.015, "lng": user_location[1] - 0.01}
            ]
            
            for station in stations:
                station_location = (station["lat"], station["lng"])
                distance = geodesic(user_location, station_location).kilometers
                
                if distance <= radius:
                    nearby_options.append({
                        "name": station["name"],
                        "type": "metro_station",
                        "distance": round(distance, 2),
                        "location": {"lat": station["lat"], "lng": station["lng"]},
                        "lines": ["Blue Line", "Red Line"],
                        "next_train": "3 minutes"
                    })
        
        elif transport_type == "bus":
            stops = [
                {"name": "Main Bus Stop", "lat": user_location[0] + 0.005, "lng": user_location[1] + 0.008},
                {"name": "Shopping Mall Stop", "lat": user_location[0] - 0.01, "lng": user_location[1] + 0.012},
                {"name": "Hospital Bus Stop", "lat": user_location[0] + 0.008, "lng": user_location[1] - 0.006}
            ]
            
            for stop in stops:
                stop_location = (stop["lat"], stop["lng"])
                distance = geodesic(user_location, stop_location).kilometers
                
                if distance <= radius:
                    nearby_options.append({
                        "name": stop["name"],
                        "type": "bus_stop",
                        "distance": round(distance, 2),
                        "location": {"lat": stop["lat"], "lng": stop["lng"]},
                        "routes": ["101", "205", "A1"],
                        "next_bus": "7 minutes"
                    })
        
        elif transport_type == "taxi":
            # Generate nearby taxi options
            for i in range(5):
                lat_offset = random.uniform(-0.01, 0.01)
                lng_offset = random.uniform(-0.01, 0.01)
                taxi_location = (user_location[0] + lat_offset, user_location[1] + lng_offset)
                distance = geodesic(user_location, taxi_location).kilometers
                
                if distance <= radius:
                    nearby_options.append({
                        "id": f"TX{random.randint(100, 999)}",
                        "type": "taxi",
                        "service": random.choice(["Ola", "Uber", "Local Taxi"]),
                        "distance": round(distance, 2),
                        "location": {"lat": taxi_location[0], "lng": taxi_location[1]},
                        "eta": f"{int(distance * 3 + 2)} minutes",
                        "car_type": random.choice(["Mini", "Prime", "Go", "Auto"])
                    })
        
        return {"nearby_options": nearby_options, "count": len(nearby_options)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch nearby transport: {str(e)}")

@router.get("/live-tracking/{booking_id}")
async def get_live_tracking(booking_id: str, current_user: dict = Depends(get_current_user)):
    try:
        booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
        
        if not booking or booking["user_id"] != ObjectId(current_user["_id"]):
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Mock live tracking data
        tracking_data = {
            "booking_id": booking_id,
            "status": "in_transit",
            "current_location": {
                "latitude": 28.6139 + random.uniform(-0.1, 0.1),
                "longitude": 77.2090 + random.uniform(-0.1, 0.1)
            },
            "estimated_arrival": "15 minutes",
            "next_stop": "Central Station",
            "delay": random.choice([0, 2, 5, 10]),
            "last_updated": datetime.utcnow()
        }
        
        return tracking_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tracking data: {str(e)}")
