import pytest
import asyncio
from httpx import AsyncClient
from fastapi.testclient import TestClient
from main import app
import json

# Test client
client = TestClient(app)

class TestTouristSafetyAPI:
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
    
    def test_register_user(self):
        """Test user registration"""
        user_data = {
            "email": "test@example.com",
            "password": "testpass123",
            "name": "Test User",
            "role": "tourist",
            "passport_number": "TEST123456"
        }
        response = client.post("/api/register", json=user_data)
        assert response.status_code == 200
        data = response.json()
        assert "tourist_id" in data
        assert "token" in data
        assert data["message"] == "User registered successfully"
    
    def test_register_duplicate_user(self):
        """Test duplicate user registration"""
        user_data = {
            "email": "duplicate@example.com",
            "password": "testpass123",
            "name": "Duplicate User",
            "role": "tourist",
            "passport_number": "DUP123456"
        }
        # Register first time
        client.post("/api/register", json=user_data)
        # Try to register again
        response = client.post("/api/register", json=user_data)
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]
    
    def test_login_user(self):
        """Test user login"""
        # First register a user
        user_data = {
            "email": "login@example.com",
            "password": "testpass123",
            "name": "Login User",
            "role": "tourist",
            "passport_number": "LOGIN123"
        }
        client.post("/api/register", json=user_data)
        
        # Then login
        login_data = {
            "email": "login@example.com",
            "password": "testpass123"
        }
        response = client.post("/api/login", json=login_data)
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["email"] == "login@example.com"
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "wrongpass"
        }
        response = client.post("/api/login", json=login_data)
        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["detail"]
    
    def test_create_safe_zone(self):
        """Test creating a safe zone"""
        # First register an authority user
        user_data = {
            "email": "authority@example.com",
            "password": "authpass123",
            "name": "Authority User",
            "role": "authority"
        }
        register_response = client.post("/api/register", json=user_data)
        token = register_response.json()["token"]
        
        # Create safe zone
        zone_data = {
            "name": "Test Safe Zone",
            "zone_type": "safe",
            "coordinates": [
                [40.7589, -73.9851],
                [40.7614, -73.9776],
                [40.7505, -73.9733],
                [40.7481, -73.9808]
            ],
            "description": "Test zone for API testing"
        }
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/safe-zones", json=zone_data, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "zone_id" in data
        assert data["message"] == "Safe zone created successfully"
    
    def test_get_safe_zones(self):
        """Test retrieving safe zones"""
        response = client.get("/api/safe-zones")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_update_location(self):
        """Test updating tourist location"""
        # Register a tourist
        user_data = {
            "email": "location@example.com",
            "password": "testpass123",
            "name": "Location User",
            "role": "tourist",
            "passport_number": "LOC123456"
        }
        register_response = client.post("/api/register", json=user_data)
        token = register_response.json()["token"]
        tourist_id = register_response.json()["tourist_id"]
        
        # Update location
        location_data = {
            "tourist_id": tourist_id,
            "lat": 40.7128,
            "lng": -74.0060
        }
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/update-location", json=location_data, headers=headers)
        assert response.status_code == 200
        assert response.json()["message"] == "Location updated successfully"
    
    def test_sos_alert(self):
        """Test SOS alert functionality"""
        # Register a tourist
        user_data = {
            "email": "sos@example.com",
            "password": "testpass123",
            "name": "SOS User",
            "role": "tourist",
            "passport_number": "SOS123456"
        }
        register_response = client.post("/api/register", json=user_data)
        token = register_response.json()["token"]
        tourist_id = register_response.json()["tourist_id"]
        
        # Trigger SOS
        sos_data = {
            "tourist_id": tourist_id,
            "lat": 40.7128,
            "lng": -74.0060,
            "message": "Emergency help needed!"
        }
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/api/sos", json=sos_data, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "alert_id" in data
        assert data["message"] == "SOS alert sent successfully"
    
    def test_get_alerts(self):
        """Test retrieving alerts"""
        # Register an authority user
        user_data = {
            "email": "alerts@example.com",
            "password": "authpass123",
            "name": "Alerts Authority",
            "role": "authority"
        }
        register_response = client.post("/api/register", json=user_data)
        token = register_response.json()["token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/alerts", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        # Try to access protected endpoint without token
        response = client.get("/api/alerts")
        assert response.status_code == 401
        
        # Try with invalid token
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/alerts", headers=headers)
        assert response.status_code == 401

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
