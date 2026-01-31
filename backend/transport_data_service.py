from fastapi import HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import aiohttp
import asyncio
from datetime import datetime, timedelta
import json
import random
import os

# Transport Data Models
class TransportSchedule(BaseModel):
    transport_id: str
    transport_type: str  # train, bus, flight, metro, taxi
    route: str
    departure_time: datetime
    arrival_time: datetime
    available_seats: int
    total_seats: int
    price: float
    operator: str
    status: str  # on_time, delayed, cancelled

class LiveTrackingData(BaseModel):
    transport_id: str
    current_location: Dict[str, float]  # lat, lng
    next_stop: str
    estimated_arrival: datetime
    delay_minutes: int
    speed: float
    occupancy_percentage: float

class WeatherData(BaseModel):
    location: str
    temperature: float
    condition: str
    visibility: float
    precipitation: float
    wind_speed: float

# Transport Data Service Class
class TransportDataService:
    def __init__(self):
        self.api_keys = {
            "irctc": os.getenv("IRCTC_API_KEY", "dummy_key"),
            "redbus": os.getenv("REDBUS_API_KEY", "dummy_key"),
            "makemytrip": os.getenv("MAKEMYTRIP_API_KEY", "dummy_key"),
            "uber": os.getenv("UBER_API_KEY", "dummy_key"),
            "weather": os.getenv("WEATHER_API_KEY", "dummy_key")
        }
        
        # Mock data for demonstration
        self.mock_schedules = self._generate_mock_schedules()
        self.mock_tracking = self._generate_mock_tracking()

    async def get_real_time_schedules(self, transport_type: str, from_location: str, to_location: str, date: str) -> List[TransportSchedule]:
        """Get real-time transport schedules"""
        try:
            if transport_type == "train":
                return await self._get_train_schedules(from_location, to_location, date)
            elif transport_type == "bus":
                return await self._get_bus_schedules(from_location, to_location, date)
            elif transport_type == "flight":
                return await self._get_flight_schedules(from_location, to_location, date)
            elif transport_type == "metro":
                return await self._get_metro_schedules(from_location, to_location, date)
            elif transport_type == "taxi":
                return await self._get_taxi_availability(from_location, to_location)
            else:
                raise HTTPException(status_code=400, detail="Invalid transport type")
        except Exception as e:
            # Fallback to mock data if API fails
            return self._get_mock_schedules(transport_type, from_location, to_location)

    async def _get_train_schedules(self, from_location: str, to_location: str, date: str) -> List[TransportSchedule]:
        """Get real-time train schedules from IRCTC API"""
        # Mock implementation - in production, integrate with IRCTC API
        schedules = []
        trains = [
            {"id": "12301", "name": "Rajdhani Express", "operator": "Indian Railways"},
            {"id": "12002", "name": "Shatabdi Express", "operator": "Indian Railways"},
            {"id": "12622", "name": "Tamil Nadu Express", "operator": "Indian Railways"}
        ]
        
        for train in trains:
            departure = datetime.now() + timedelta(hours=random.randint(2, 12))
            arrival = departure + timedelta(hours=random.randint(4, 8))
            
            schedules.append(TransportSchedule(
                transport_id=train["id"],
                transport_type="train",
                route=f"{from_location} - {to_location}",
                departure_time=departure,
                arrival_time=arrival,
                available_seats=random.randint(10, 100),
                total_seats=120,
                price=random.randint(500, 2000),
                operator=train["operator"],
                status=random.choice(["on_time", "delayed", "on_time", "on_time"])
            ))
        
        return schedules

    async def _get_bus_schedules(self, from_location: str, to_location: str, date: str) -> List[TransportSchedule]:
        """Get real-time bus schedules from RedBus API"""
        schedules = []
        operators = ["RedBus", "KSRTC", "MSRTC", "Private Travels"]
        
        for i in range(5):
            departure = datetime.now() + timedelta(hours=random.randint(1, 10))
            arrival = departure + timedelta(hours=random.randint(3, 6))
            
            schedules.append(TransportSchedule(
                transport_id=f"BUS{1000 + i}",
                transport_type="bus",
                route=f"{from_location} - {to_location}",
                departure_time=departure,
                arrival_time=arrival,
                available_seats=random.randint(5, 40),
                total_seats=45,
                price=random.randint(300, 800),
                operator=random.choice(operators),
                status=random.choice(["on_time", "delayed", "on_time"])
            ))
        
        return schedules

    async def _get_flight_schedules(self, from_location: str, to_location: str, date: str) -> List[TransportSchedule]:
        """Get real-time flight schedules"""
        schedules = []
        airlines = ["IndiGo", "Air India", "SpiceJet", "Vistara", "GoAir"]
        
        for i in range(3):
            departure = datetime.now() + timedelta(hours=random.randint(2, 24))
            arrival = departure + timedelta(hours=random.randint(1, 3))
            
            schedules.append(TransportSchedule(
                transport_id=f"FL{2000 + i}",
                transport_type="flight",
                route=f"{from_location} - {to_location}",
                departure_time=departure,
                arrival_time=arrival,
                available_seats=random.randint(10, 150),
                total_seats=180,
                price=random.randint(3000, 15000),
                operator=random.choice(airlines),
                status=random.choice(["on_time", "delayed", "on_time", "on_time"])
            ))
        
        return schedules

    async def _get_metro_schedules(self, from_location: str, to_location: str, date: str) -> List[TransportSchedule]:
        """Get metro schedules"""
        schedules = []
        
        # Metro runs frequently, so generate next 5 trains
        for i in range(5):
            departure = datetime.now() + timedelta(minutes=i * 8 + random.randint(2, 6))
            arrival = departure + timedelta(minutes=random.randint(15, 45))
            
            schedules.append(TransportSchedule(
                transport_id=f"METRO{i+1}",
                transport_type="metro",
                route=f"{from_location} - {to_location}",
                departure_time=departure,
                arrival_time=arrival,
                available_seats=random.randint(50, 200),
                total_seats=300,
                price=random.randint(20, 60),
                operator="Delhi Metro" if "Delhi" in from_location else "Local Metro",
                status="on_time"
            ))
        
        return schedules

    async def _get_taxi_availability(self, from_location: str, to_location: str) -> List[TransportSchedule]:
        """Get taxi availability"""
        schedules = []
        services = ["Uber", "Ola", "Local Taxi"]
        
        for service in services:
            schedules.append(TransportSchedule(
                transport_id=f"TAXI_{service}_{random.randint(1000, 9999)}",
                transport_type="taxi",
                route=f"{from_location} - {to_location}",
                departure_time=datetime.now() + timedelta(minutes=random.randint(2, 10)),
                arrival_time=datetime.now() + timedelta(minutes=random.randint(20, 60)),
                available_seats=random.randint(1, 4),
                total_seats=4,
                price=random.randint(150, 500),
                operator=service,
                status="available"
            ))
        
        return schedules

    async def get_live_tracking(self, transport_id: str) -> LiveTrackingData:
        """Get live tracking data for transport"""
        try:
            # Mock implementation - in production, integrate with transport APIs
            return LiveTrackingData(
                transport_id=transport_id,
                current_location={
                    "lat": 28.6139 + random.uniform(-0.1, 0.1),
                    "lng": 77.2090 + random.uniform(-0.1, 0.1)
                },
                next_stop=random.choice(["Central Station", "Junction", "Terminal", "Airport"]),
                estimated_arrival=datetime.now() + timedelta(minutes=random.randint(10, 120)),
                delay_minutes=random.randint(-5, 30),
                speed=random.randint(40, 120),
                occupancy_percentage=random.randint(30, 95)
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Tracking data unavailable: {str(e)}")

    async def get_weather_impact(self, location: str) -> Dict[str, Any]:
        """Get weather data and its impact on transport"""
        try:
            weather = WeatherData(
                location=location,
                temperature=random.randint(15, 35),
                condition=random.choice(["Clear", "Cloudy", "Rainy", "Foggy"]),
                visibility=random.randint(5, 10),
                precipitation=random.randint(0, 50),
                wind_speed=random.randint(5, 25)
            )
            
            # Determine impact on transport
            impact = self._calculate_weather_impact(weather)
            
            return {
                "weather": weather.dict(),
                "transport_impact": impact,
                "recommendations": self._get_weather_recommendations(weather, impact)
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Weather data unavailable: {str(e)}")

    def _calculate_weather_impact(self, weather: WeatherData) -> Dict[str, str]:
        """Calculate weather impact on different transport modes"""
        impact = {}
        
        if weather.condition == "Rainy" or weather.precipitation > 20:
            impact["train"] = "minimal"
            impact["bus"] = "moderate"
            impact["flight"] = "high" if weather.precipitation > 40 else "moderate"
            impact["metro"] = "minimal"
            impact["taxi"] = "moderate"
        elif weather.condition == "Foggy" or weather.visibility < 3:
            impact["train"] = "high"
            impact["bus"] = "high"
            impact["flight"] = "severe"
            impact["metro"] = "minimal"
            impact["taxi"] = "high"
        else:
            impact = {mode: "minimal" for mode in ["train", "bus", "flight", "metro", "taxi"]}
        
        return impact

    def _get_weather_recommendations(self, weather: WeatherData, impact: Dict[str, str]) -> List[str]:
        """Get weather-based travel recommendations"""
        recommendations = []
        
        if weather.condition == "Rainy":
            recommendations.append("Carry umbrella and waterproof clothing")
            recommendations.append("Allow extra travel time")
            recommendations.append("Consider metro for city travel")
        elif weather.condition == "Foggy":
            recommendations.append("Check for transport delays")
            recommendations.append("Prefer metro over road transport")
            recommendations.append("Keep emergency contacts handy")
        elif weather.temperature > 35:
            recommendations.append("Stay hydrated during travel")
            recommendations.append("Prefer air-conditioned transport")
        
        return recommendations

    async def get_route_optimization(self, from_location: str, to_location: str, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Get optimized route suggestions"""
        try:
            # Mock route optimization
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
            
            # Sort based on preferences
            if preferences.get("priority") == "time":
                routes.sort(key=lambda x: x["total_time"])
            elif preferences.get("priority") == "cost":
                routes.sort(key=lambda x: x["total_cost"])
            elif preferences.get("priority") == "comfort":
                routes.sort(key=lambda x: x["comfort_score"], reverse=True)
            
            return {
                "optimized_routes": routes,
                "recommendation": routes[0]["route_id"],
                "savings": {
                    "time_saved": random.randint(5, 20),
                    "cost_saved": random.randint(10, 50)
                }
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Route optimization failed: {str(e)}")

    def _generate_mock_schedules(self) -> Dict[str, List[TransportSchedule]]:
        """Generate mock schedules for fallback"""
        return {}

    def _generate_mock_tracking(self) -> Dict[str, LiveTrackingData]:
        """Generate mock tracking data for fallback"""
        return {}

    def _get_mock_schedules(self, transport_type: str, from_location: str, to_location: str) -> List[TransportSchedule]:
        """Get mock schedules as fallback"""
        return []

# Initialize transport data service
transport_data_service = TransportDataService()
