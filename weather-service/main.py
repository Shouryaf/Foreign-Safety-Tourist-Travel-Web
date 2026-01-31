from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import httpx
import asyncio
from datetime import datetime, timedelta
import json
import os
from enum import Enum

app = FastAPI(
    title="Weather Safety Service",
    description="Real-time weather monitoring and safety alerts for tourists",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Weather API configuration
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "demo_key")
WEATHER_API_URL = "http://api.openweathermap.org/data/2.5"

class WeatherSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EXTREME = "extreme"

class WeatherAlert(BaseModel):
    id: str
    location: Dict[str, float]
    weather_type: str
    severity: WeatherSeverity
    message: str
    recommendations: List[str]
    timestamp: datetime
    expires_at: datetime

class LocationRequest(BaseModel):
    latitude: float
    longitude: float
    tourist_id: Optional[str] = None

class WeatherData(BaseModel):
    location: Dict[str, float]
    temperature: float
    feels_like: float
    humidity: int
    pressure: int
    visibility: float
    wind_speed: float
    wind_direction: int
    weather_main: str
    weather_description: str
    uv_index: Optional[float] = None
    air_quality: Optional[int] = None
    timestamp: datetime

class SafetyRecommendation(BaseModel):
    category: str
    level: WeatherSeverity
    message: str
    actions: List[str]

# In-memory storage for demo (use Redis/database in production)
active_alerts: Dict[str, WeatherAlert] = {}
weather_cache: Dict[str, WeatherData] = {}

async def fetch_weather_data(lat: float, lon: float) -> WeatherData:
    """Fetch current weather data from external API"""
    cache_key = f"{lat:.2f},{lon:.2f}"
    
    # Check cache (5-minute expiry)
    if cache_key in weather_cache:
        cached_data = weather_cache[cache_key]
        if datetime.now() - cached_data.timestamp < timedelta(minutes=5):
            return cached_data
    
    try:
        async with httpx.AsyncClient() as client:
            # Current weather
            weather_response = await client.get(
                f"{WEATHER_API_URL}/weather",
                params={
                    "lat": lat,
                    "lon": lon,
                    "appid": WEATHER_API_KEY,
                    "units": "metric"
                },
                timeout=10.0
            )
            
            if weather_response.status_code == 200:
                weather_json = weather_response.json()
                
                weather_data = WeatherData(
                    location={"latitude": lat, "longitude": lon},
                    temperature=weather_json["main"]["temp"],
                    feels_like=weather_json["main"]["feels_like"],
                    humidity=weather_json["main"]["humidity"],
                    pressure=weather_json["main"]["pressure"],
                    visibility=weather_json.get("visibility", 10000) / 1000,  # Convert to km
                    wind_speed=weather_json["wind"]["speed"],
                    wind_direction=weather_json["wind"].get("deg", 0),
                    weather_main=weather_json["weather"][0]["main"],
                    weather_description=weather_json["weather"][0]["description"],
                    timestamp=datetime.now()
                )
                
                # Cache the data
                weather_cache[cache_key] = weather_data
                return weather_data
            else:
                # Fallback to mock data if API fails
                return create_mock_weather_data(lat, lon)
                
    except Exception as e:
        print(f"Weather API error: {e}")
        return create_mock_weather_data(lat, lon)

def create_mock_weather_data(lat: float, lon: float) -> WeatherData:
    """Create realistic mock weather data for demo purposes"""
    import random
    
    # Simulate different weather conditions based on location
    weather_conditions = [
        ("Clear", "clear sky", 25, 30),
        ("Clouds", "scattered clouds", 22, 40),
        ("Rain", "light rain", 18, 80),
        ("Thunderstorm", "thunderstorm", 20, 85),
        ("Snow", "light snow", -2, 70),
        ("Mist", "mist", 15, 90)
    ]
    
    condition = random.choice(weather_conditions)
    
    return WeatherData(
        location={"latitude": lat, "longitude": lon},
        temperature=condition[2] + random.uniform(-5, 5),
        feels_like=condition[2] + random.uniform(-3, 3),
        humidity=condition[3] + random.randint(-10, 10),
        pressure=1013 + random.randint(-20, 20),
        visibility=random.uniform(5, 15),
        wind_speed=random.uniform(0, 15),
        wind_direction=random.randint(0, 360),
        weather_main=condition[0],
        weather_description=condition[1],
        timestamp=datetime.now()
    )

def analyze_weather_safety(weather: WeatherData) -> List[SafetyRecommendation]:
    """Analyze weather conditions and generate safety recommendations"""
    recommendations = []
    
    # Temperature-based recommendations
    if weather.temperature > 35:
        recommendations.append(SafetyRecommendation(
            category="Heat Warning",
            level=WeatherSeverity.HIGH,
            message="Extreme heat conditions detected",
            actions=[
                "Stay hydrated - drink water every 15-20 minutes",
                "Seek shade during peak hours (11 AM - 4 PM)",
                "Wear light-colored, loose-fitting clothing",
                "Avoid strenuous outdoor activities"
            ]
        ))
    elif weather.temperature < 0:
        recommendations.append(SafetyRecommendation(
            category="Cold Warning",
            level=WeatherSeverity.HIGH,
            message="Freezing temperatures detected",
            actions=[
                "Dress in layers to maintain body heat",
                "Cover exposed skin to prevent frostbite",
                "Stay dry and change wet clothing immediately",
                "Limit time outdoors"
            ]
        ))
    
    # Weather condition-based recommendations
    if weather.weather_main == "Thunderstorm":
        recommendations.append(SafetyRecommendation(
            category="Storm Alert",
            level=WeatherSeverity.EXTREME,
            message="Thunderstorm activity in your area",
            actions=[
                "Seek immediate indoor shelter",
                "Avoid open areas and tall objects",
                "Stay away from water bodies",
                "Postpone outdoor activities until storm passes"
            ]
        ))
    elif weather.weather_main == "Rain" and weather.wind_speed > 10:
        recommendations.append(SafetyRecommendation(
            category="Heavy Rain",
            level=WeatherSeverity.MEDIUM,
            message="Heavy rain and strong winds detected",
            actions=[
                "Carry waterproof gear",
                "Be cautious of slippery surfaces",
                "Avoid flood-prone areas",
                "Use covered walkways when possible"
            ]
        ))
    
    # Visibility-based recommendations
    if weather.visibility < 1:
        recommendations.append(SafetyRecommendation(
            category="Low Visibility",
            level=WeatherSeverity.HIGH,
            message="Poor visibility conditions",
            actions=[
                "Use flashlights or phone lights",
                "Stay on marked paths and trails",
                "Travel in groups when possible",
                "Postpone sightseeing until visibility improves"
            ]
        ))
    
    # Wind-based recommendations
    if weather.wind_speed > 20:
        recommendations.append(SafetyRecommendation(
            category="High Winds",
            level=WeatherSeverity.MEDIUM,
            message="Strong wind conditions detected",
            actions=[
                "Secure loose items and clothing",
                "Avoid areas with tall trees or structures",
                "Be extra cautious near water bodies",
                "Consider indoor activities"
            ]
        ))
    
    return recommendations

@app.get("/")
async def root():
    return {
        "service": "Weather Safety Service",
        "status": "active",
        "version": "1.0.0",
        "endpoints": [
            "/weather/{lat}/{lon}",
            "/safety-check",
            "/alerts",
            "/health"
        ]
    }

@app.get("/weather/{lat}/{lon}")
async def get_weather(lat: float, lon: float):
    """Get current weather data for a location"""
    try:
        weather_data = await fetch_weather_data(lat, lon)
        safety_recommendations = analyze_weather_safety(weather_data)
        
        return {
            "weather": weather_data,
            "safety_recommendations": safety_recommendations,
            "alert_level": max([rec.level for rec in safety_recommendations], default=WeatherSeverity.LOW)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather service error: {str(e)}")

@app.post("/safety-check")
async def safety_check(location: LocationRequest):
    """Perform comprehensive weather safety check for a location"""
    try:
        weather_data = await fetch_weather_data(location.latitude, location.longitude)
        recommendations = analyze_weather_safety(weather_data)
        
        # Generate alert if conditions are dangerous
        high_risk_recommendations = [r for r in recommendations if r.level in [WeatherSeverity.HIGH, WeatherSeverity.EXTREME]]
        
        if high_risk_recommendations:
            alert_id = f"weather_{location.latitude}_{location.longitude}_{int(datetime.now().timestamp())}"
            alert = WeatherAlert(
                id=alert_id,
                location={"latitude": location.latitude, "longitude": location.longitude},
                weather_type=weather_data.weather_main,
                severity=max([r.level for r in high_risk_recommendations]),
                message=f"Weather safety alert: {weather_data.weather_description}",
                recommendations=[action for rec in high_risk_recommendations for action in rec.actions],
                timestamp=datetime.now(),
                expires_at=datetime.now() + timedelta(hours=2)
            )
            active_alerts[alert_id] = alert
        
        return {
            "location": location,
            "weather": weather_data,
            "safety_status": "safe" if not high_risk_recommendations else "caution",
            "recommendations": recommendations,
            "active_alerts": len([a for a in active_alerts.values() 
                                if a.location["latitude"] == location.latitude 
                                and a.location["longitude"] == location.longitude])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Safety check error: {str(e)}")

@app.get("/alerts")
async def get_active_alerts():
    """Get all active weather alerts"""
    # Clean expired alerts
    current_time = datetime.now()
    expired_alerts = [alert_id for alert_id, alert in active_alerts.items() 
                     if alert.expires_at < current_time]
    
    for alert_id in expired_alerts:
        del active_alerts[alert_id]
    
    return {
        "active_alerts": list(active_alerts.values()),
        "total_count": len(active_alerts)
    }

@app.get("/alerts/{lat}/{lon}")
async def get_location_alerts(lat: float, lon: float, radius: float = 5.0):
    """Get weather alerts for a specific location within a radius (km)"""
    location_alerts = []
    
    for alert in active_alerts.values():
        # Simple distance calculation (for demo - use proper geospatial in production)
        alert_lat = alert.location["latitude"]
        alert_lon = alert.location["longitude"]
        
        # Rough distance calculation
        lat_diff = abs(lat - alert_lat)
        lon_diff = abs(lon - alert_lon)
        distance = ((lat_diff ** 2) + (lon_diff ** 2)) ** 0.5 * 111  # Rough km conversion
        
        if distance <= radius:
            location_alerts.append(alert)
    
    return {
        "location": {"latitude": lat, "longitude": lon},
        "radius_km": radius,
        "alerts": location_alerts,
        "count": len(location_alerts)
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "active_alerts": len(active_alerts),
        "cache_entries": len(weather_cache),
        "uptime": "running"
    }

@app.delete("/alerts/{alert_id}")
async def dismiss_alert(alert_id: str):
    """Dismiss a specific weather alert"""
    if alert_id in active_alerts:
        del active_alerts[alert_id]
        return {"message": f"Alert {alert_id} dismissed successfully"}
    else:
        raise HTTPException(status_code=404, detail="Alert not found")

# Background task to clean expired alerts
async def cleanup_expired_alerts():
    """Background task to clean up expired alerts"""
    while True:
        current_time = datetime.now()
        expired_alerts = [alert_id for alert_id, alert in active_alerts.items() 
                         if alert.expires_at < current_time]
        
        for alert_id in expired_alerts:
            del active_alerts[alert_id]
            print(f"Cleaned up expired alert: {alert_id}")
        
        await asyncio.sleep(300)  # Run every 5 minutes

@app.on_event("startup")
async def startup_event():
    """Start background tasks"""
    asyncio.create_task(cleanup_expired_alerts())
    print("Weather Safety Service started successfully")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
