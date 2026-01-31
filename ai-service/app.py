from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import numpy as np
import cv2
import requests
import json
from datetime import datetime
import asyncio
import aiohttp
from typing import List, Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Tourist Safety AI Service", version="1.0.0")

class LocationData(BaseModel):
    lat: float
    lng: float
    timestamp: str
    tourist_count: int = 1

class AnomalyDetectionRequest(BaseModel):
    locations: List[LocationData]
    video_url: str = None
    crowd_density_threshold: float = 0.7

class AnomalyDetectionResponse(BaseModel):
    is_anomaly: bool
    anomaly_type: str = None
    confidence: float
    details: Dict[str, Any]
    timestamp: str

class AnomalyDetector:
    def __init__(self):
        self.crowd_density_threshold = 0.7
        self.movement_threshold = 0.5
        self.unusual_pattern_threshold = 0.6
        
    def detect_crowd_anomaly(self, locations: List[LocationData]) -> Dict[str, Any]:
        """Detect crowd density anomalies from GPS data"""
        if len(locations) < 5:
            return {"is_anomaly": False, "confidence": 0.0, "details": "Insufficient data"}
        
        # Calculate density in different areas
        lats = [loc.lat for loc in locations]
        lngs = [loc.lng for loc in locations]
        
        # Create a grid and count tourists in each cell
        lat_range = max(lats) - min(lats)
        lng_range = max(lngs) - min(lngs)
        
        if lat_range == 0 or lng_range == 0:
            return {"is_anomaly": False, "confidence": 0.0, "details": "No spatial variation"}
        
        # Simple grid-based density calculation
        grid_size = 0.001  # Approximately 100m
        grid_counts = {}
        
        for loc in locations:
            grid_lat = round(loc.lat / grid_size) * grid_size
            grid_lng = round(loc.lng / grid_size) * grid_size
            grid_key = f"{grid_lat},{grid_lng}"
            grid_counts[grid_key] = grid_counts.get(grid_key, 0) + loc.tourist_count
        
        # Find maximum density
        max_density = max(grid_counts.values()) if grid_counts else 0
        total_tourists = sum(loc.tourist_count for loc in locations)
        
        # Calculate density ratio
        density_ratio = max_density / total_tourists if total_tourists > 0 else 0
        
        is_anomaly = density_ratio > self.crowd_density_threshold
        confidence = min(density_ratio, 1.0)
        
        return {
            "is_anomaly": is_anomaly,
            "confidence": confidence,
            "details": {
                "max_density": max_density,
                "total_tourists": total_tourists,
                "density_ratio": density_ratio,
                "grid_counts": grid_counts
            }
        }
    
    def detect_movement_anomaly(self, locations: List[LocationData]) -> Dict[str, Any]:
        """Detect unusual movement patterns"""
        if len(locations) < 3:
            return {"is_anomaly": False, "confidence": 0.0, "details": "Insufficient data"}
        
        # Calculate movement vectors
        movements = []
        for i in range(1, len(locations)):
            prev = locations[i-1]
            curr = locations[i]
            
            # Calculate distance (simplified)
            lat_diff = curr.lat - prev.lat
            lng_diff = curr.lng - prev.lng
            distance = np.sqrt(lat_diff**2 + lng_diff**2)
            
            # Calculate time difference
            prev_time = datetime.fromisoformat(prev.timestamp.replace('Z', '+00:00'))
            curr_time = datetime.fromisoformat(curr.timestamp.replace('Z', '+00:00'))
            time_diff = (curr_time - prev_time).total_seconds()
            
            if time_diff > 0:
                speed = distance / time_diff
                movements.append(speed)
        
        if not movements:
            return {"is_anomaly": False, "confidence": 0.0, "details": "No movement data"}
        
        # Detect unusual speeds
        avg_speed = np.mean(movements)
        max_speed = np.max(movements)
        
        # Unusual if max speed is significantly higher than average
        speed_ratio = max_speed / avg_speed if avg_speed > 0 else 0
        is_anomaly = speed_ratio > 3.0  # 3x faster than average
        
        confidence = min(speed_ratio / 3.0, 1.0)
        
        return {
            "is_anomaly": is_anomaly,
            "confidence": confidence,
            "details": {
                "avg_speed": avg_speed,
                "max_speed": max_speed,
                "speed_ratio": speed_ratio,
                "movements": movements
            }
        }
    
    def detect_video_anomaly(self, video_url: str) -> Dict[str, Any]:
        """Detect anomalies from video feed (simplified simulation)"""
        # In a real implementation, this would:
        # 1. Download/stream the video
        # 2. Use computer vision models (YOLO, etc.)
        # 3. Detect unusual crowd behavior, violence, etc.
        
        # For demo purposes, simulate random anomaly detection
        import random
        is_anomaly = random.random() < 0.1  # 10% chance
        confidence = random.uniform(0.3, 0.9) if is_anomaly else random.uniform(0.1, 0.3)
        
        anomaly_types = ["crowd_gathering", "unusual_movement", "suspicious_activity"]
        anomaly_type = random.choice(anomaly_types) if is_anomaly else None
        
        return {
            "is_anomaly": is_anomaly,
            "confidence": confidence,
            "details": {
                "video_url": video_url,
                "anomaly_type": anomaly_type,
                "detection_method": "simulated_cv_analysis"
            }
        }

detector = AnomalyDetector()

@app.get("/")
async def root():
    return {"message": "Tourist Safety AI Service", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/detect-anomaly", response_model=AnomalyDetectionResponse)
async def detect_anomaly(request: AnomalyDetectionRequest):
    """Main anomaly detection endpoint"""
    try:
        logger.info(f"Processing anomaly detection request with {len(request.locations)} locations")
        
        # Detect different types of anomalies
        crowd_result = detector.detect_crowd_anomaly(request.locations)
        movement_result = detector.detect_movement_anomaly(request.locations)
        
        video_result = None
        if request.video_url:
            video_result = detector.detect_video_anomaly(request.video_url)
        
        # Combine results
        anomalies = []
        if crowd_result["is_anomaly"]:
            anomalies.append(("crowd_density", crowd_result["confidence"]))
        if movement_result["is_anomaly"]:
            anomalies.append(("unusual_movement", movement_result["confidence"]))
        if video_result and video_result["is_anomaly"]:
            anomalies.append(("video_anomaly", video_result["confidence"]))
        
        # Determine overall anomaly status
        is_anomaly = len(anomalies) > 0
        max_confidence = max([conf for _, conf in anomalies]) if anomalies else 0.0
        anomaly_type = anomalies[0][0] if anomalies else None
        
        # Prepare response details
        details = {
            "crowd_analysis": crowd_result,
            "movement_analysis": movement_result,
            "video_analysis": video_result,
            "total_locations": len(request.locations),
            "detection_timestamp": datetime.now().isoformat()
        }
        
        response = AnomalyDetectionResponse(
            is_anomaly=is_anomaly,
            anomaly_type=anomaly_type,
            confidence=max_confidence,
            details=details,
            timestamp=datetime.now().isoformat()
        )
        
        # If anomaly detected, send alert to backend
        if is_anomaly:
            await send_alert_to_backend(request.locations[0], anomaly_type, max_confidence)
        
        logger.info(f"Anomaly detection completed: {is_anomaly} (confidence: {max_confidence})")
        return response
        
    except Exception as e:
        logger.error(f"Error in anomaly detection: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def send_alert_to_backend(location: LocationData, anomaly_type: str, confidence: float):
    """Send anomaly alert to the main backend"""
    try:
        alert_data = {
            "touristID": "AI_SYSTEM",
            "type": "anomaly",
            "location": {
                "lat": location.lat,
                "lng": location.lng
            },
            "message": f"AI detected {anomaly_type} with {confidence:.2f} confidence",
            "timestamp": datetime.now().isoformat()
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://localhost:3001/api/anomaly-detection",
                json={
                    "location": alert_data["location"],
                    "crowdDensity": confidence,
                    "timestamp": alert_data["timestamp"]
                }
            ) as response:
                if response.status == 200:
                    logger.info("Alert sent to backend successfully")
                else:
                    logger.error(f"Failed to send alert to backend: {response.status}")
                    
    except Exception as e:
        logger.error(f"Error sending alert to backend: {str(e)}")

class CrowdSimulationRequest(BaseModel):
    num_tourists: int = 50
    area_bounds: Dict[str, float] = {
        "north": 13.09,
        "south": 13.07,
        "east": 80.28,
        "west": 80.26
    }

@app.post("/simulate-crowd-data")
async def simulate_crowd_data(request: CrowdSimulationRequest = None):
    """Simulate crowd data for testing"""
    try:
        import random
        
        # Use request data or defaults
        if request is None:
            num_tourists = 50
            bounds = {
                "north": 13.09,
                "south": 13.07,
                "east": 80.28,
                "west": 80.26
            }
        else:
            num_tourists = request.num_tourists
            bounds = request.area_bounds
        
        # Generate random locations
        locations = []
        
        for i in range(num_tourists):
            # Random location within bounds
            lat = random.uniform(bounds["south"], bounds["north"])
            lng = random.uniform(bounds["west"], bounds["east"])
            
            location = {
                "lat": lat,
                "lng": lng,
                "timestamp": datetime.now().isoformat(),
                "tourist_count": random.randint(1, 3)
            }
            locations.append(location)
        
        # Calculate crowd density
        area_size = (bounds["north"] - bounds["south"]) * (bounds["east"] - bounds["west"])
        crowd_density = num_tourists / area_size if area_size > 0 else 0
        
        return {
            "locations": locations,
            "crowd_density": crowd_density,
            "total_tourists": num_tourists,
            "area_bounds": bounds,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in crowd simulation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_stats():
    """Get service statistics"""
    return {
        "service": "Tourist Safety AI Service",
        "version": "1.0.0",
        "status": "running",
        "capabilities": [
            "crowd_density_detection",
            "movement_pattern_analysis",
            "video_anomaly_detection",
            "real_time_alerting"
        ],
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
