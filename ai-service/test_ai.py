import pytest
import asyncio
from httpx import AsyncClient
from fastapi.testclient import TestClient
from app import app, AnomalyDetector, LocationData
import json
from datetime import datetime

# Test client
client = TestClient(app)

class TestAIService:
    
    def test_health_check(self):
        """Test AI service health check"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
    
    def test_anomaly_detection_insufficient_data(self):
        """Test anomaly detection with insufficient data"""
        request_data = {
            "locations": [
                {
                    "lat": 40.7128,
                    "lng": -74.0060,
                    "timestamp": datetime.now().isoformat(),
                    "tourist_count": 1
                }
            ],
            "crowd_density_threshold": 0.7
        }
        response = client.post("/api/detect-anomaly", json=request_data)
        assert response.status_code == 200
        data = response.json()
        assert data["is_anomaly"] == False
        assert "Insufficient data" in data["details"]
    
    def test_anomaly_detection_normal_crowd(self):
        """Test anomaly detection with normal crowd density"""
        locations = []
        for i in range(10):
            locations.append({
                "lat": 40.7128 + (i * 0.001),
                "lng": -74.0060 + (i * 0.001),
                "timestamp": datetime.now().isoformat(),
                "tourist_count": 2
            })
        
        request_data = {
            "locations": locations,
            "crowd_density_threshold": 0.7
        }
        response = client.post("/api/detect-anomaly", json=request_data)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data["is_anomaly"], bool)
        assert "confidence" in data
        assert "details" in data
    
    def test_anomaly_detection_high_crowd(self):
        """Test anomaly detection with high crowd density"""
        locations = []
        # Create a cluster of tourists in small area (high density)
        for i in range(50):
            locations.append({
                "lat": 40.7128 + (i * 0.0001),  # Very close together
                "lng": -74.0060 + (i * 0.0001),
                "timestamp": datetime.now().isoformat(),
                "tourist_count": 5
            })
        
        request_data = {
            "locations": locations,
            "crowd_density_threshold": 0.5  # Lower threshold to trigger anomaly
        }
        response = client.post("/api/detect-anomaly", json=request_data)
        assert response.status_code == 200
        data = response.json()
        # High density should trigger anomaly
        assert data["confidence"] > 0.3
    
    def test_video_anomaly_simulation(self):
        """Test video anomaly detection simulation"""
        request_data = {
            "locations": [
                {
                    "lat": 40.7128,
                    "lng": -74.0060,
                    "timestamp": datetime.now().isoformat(),
                    "tourist_count": 1
                }
            ],
            "video_url": "http://example.com/cctv_feed.mp4",
            "crowd_density_threshold": 0.7
        }
        response = client.post("/api/detect-anomaly", json=request_data)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data["is_anomaly"], bool)
        assert "video_analysis" in data["details"]
    
    def test_movement_pattern_analysis(self):
        """Test movement pattern analysis"""
        # Create locations showing rapid movement (potential anomaly)
        locations = []
        base_lat, base_lng = 40.7128, -74.0060
        
        for i in range(10):
            # Simulate rapid movement across large distances
            locations.append({
                "lat": base_lat + (i * 0.01),  # Large jumps
                "lng": base_lng + (i * 0.01),
                "timestamp": datetime.now().isoformat(),
                "tourist_count": 1
            })
        
        request_data = {
            "locations": locations,
            "crowd_density_threshold": 0.7
        }
        response = client.post("/api/detect-anomaly", json=request_data)
        assert response.status_code == 200
        data = response.json()
        assert "movement_analysis" in data["details"]

class TestAnomalyDetector:
    
    def setup_method(self):
        """Setup for each test method"""
        self.detector = AnomalyDetector()
    
    def test_crowd_anomaly_detection(self):
        """Test crowd anomaly detection logic"""
        locations = [
            LocationData(lat=40.7128, lng=-74.0060, timestamp=datetime.now().isoformat(), tourist_count=5),
            LocationData(lat=40.7129, lng=-74.0061, timestamp=datetime.now().isoformat(), tourist_count=5),
            LocationData(lat=40.7130, lng=-74.0062, timestamp=datetime.now().isoformat(), tourist_count=5),
            LocationData(lat=40.7131, lng=-74.0063, timestamp=datetime.now().isoformat(), tourist_count=5),
            LocationData(lat=40.7132, lng=-74.0064, timestamp=datetime.now().isoformat(), tourist_count=5),
        ]
        
        result = self.detector.detect_crowd_anomaly(locations)
        assert isinstance(result["is_anomaly"], bool)
        assert "confidence" in result
        assert "details" in result
    
    def test_movement_anomaly_detection(self):
        """Test movement anomaly detection logic"""
        locations = [
            LocationData(lat=40.7128, lng=-74.0060, timestamp=datetime.now().isoformat()),
            LocationData(lat=40.7228, lng=-74.0160, timestamp=datetime.now().isoformat()),  # Large jump
            LocationData(lat=40.7328, lng=-74.0260, timestamp=datetime.now().isoformat()),  # Another large jump
        ]
        
        result = self.detector.detect_movement_anomaly(locations)
        assert isinstance(result["is_anomaly"], bool)
        assert "confidence" in result
        assert "average_speed" in result["details"]
    
    def test_video_anomaly_simulation(self):
        """Test video anomaly simulation"""
        result = self.detector.simulate_video_anomaly("http://example.com/video.mp4")
        assert isinstance(result["is_anomaly"], bool)
        assert "confidence" in result
        assert "frame_analysis" in result["details"]
    
    def test_pattern_analysis(self):
        """Test pattern analysis"""
        locations = [
            LocationData(lat=40.7128, lng=-74.0060, timestamp=datetime.now().isoformat()),
            LocationData(lat=40.7129, lng=-74.0061, timestamp=datetime.now().isoformat()),
            LocationData(lat=40.7130, lng=-74.0062, timestamp=datetime.now().isoformat()),
        ]
        
        result = self.detector.analyze_patterns(locations)
        assert isinstance(result["is_anomaly"], bool)
        assert "confidence" in result
        assert "pattern_type" in result["details"]

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
