#!/usr/bin/env python3
"""
AI Service Testing Script
Tests the AI service endpoints and integration
"""

import requests
import json
import time
from datetime import datetime

# Configuration
AI_SERVICE_URL = "http://localhost:8000"
BACKEND_URL = "http://localhost:3001"

def test_ai_service_health():
    """Test if AI service is running"""
    print("🔍 Testing AI Service Health...")
    try:
        response = requests.get(f"{AI_SERVICE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ AI Service is running")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ AI Service health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ AI Service is not accessible: {e}")
        return False

def test_ai_service_stats():
    """Test AI service stats endpoint"""
    print("\n📊 Testing AI Service Stats...")
    try:
        response = requests.get(f"{AI_SERVICE_URL}/stats", timeout=5)
        if response.status_code == 200:
            stats = response.json()
            print("✅ AI Service stats retrieved")
            print(f"   Service: {stats.get('service', 'Unknown')}")
            print(f"   Version: {stats.get('version', 'Unknown')}")
            print(f"   Capabilities: {stats.get('capabilities', [])}")
            return True
        else:
            print(f"❌ Stats endpoint failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Stats endpoint error: {e}")
        return False

def test_anomaly_detection():
    """Test anomaly detection endpoint"""
    print("\n🤖 Testing Anomaly Detection...")
    
    # Test data - simulate crowd data
    test_data = {
        "locations": [
            {
                "lat": 28.6139,  # New Delhi coordinates
                "lng": 77.2090,
                "timestamp": datetime.now().isoformat(),
                "tourist_count": 1
            },
            {
                "lat": 28.6140,
                "lng": 77.2091,
                "timestamp": datetime.now().isoformat(),
                "tourist_count": 1
            },
            {
                "lat": 28.6141,
                "lng": 77.2092,
                "timestamp": datetime.now().isoformat(),
                "tourist_count": 1
            },
            {
                "lat": 28.6142,
                "lng": 77.2093,
                "timestamp": datetime.now().isoformat(),
                "tourist_count": 1
            },
            {
                "lat": 28.6143,
                "lng": 77.2094,
                "timestamp": datetime.now().isoformat(),
                "tourist_count": 1
            }
        ],
        "crowd_density_threshold": 0.7
    }
    
    try:
        response = requests.post(
            f"{AI_SERVICE_URL}/detect-anomaly", 
            json=test_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Anomaly detection working")
            print(f"   Is Anomaly: {result.get('is_anomaly', 'Unknown')}")
            print(f"   Anomaly Type: {result.get('anomaly_type', 'None')}")
            print(f"   Confidence: {result.get('confidence', 0):.2f}")
            print(f"   Timestamp: {result.get('timestamp', 'Unknown')}")
            
            # Show details if available
            details = result.get('details', {})
            if details:
                print(f"   Details: {json.dumps(details, indent=2)}")
            
            return True
        else:
            print(f"❌ Anomaly detection failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Anomaly detection error: {e}")
        return False

def test_crowd_simulation():
    """Test crowd data simulation"""
    print("\n👥 Testing Crowd Data Simulation...")
    
    sim_data = {
        "num_tourists": 50,
        "area_bounds": {
            "north": 28.62,
            "south": 28.60,
            "east": 77.22,
            "west": 77.20
        }
    }
    
    try:
        response = requests.post(
            f"{AI_SERVICE_URL}/simulate-crowd-data",
            json=sim_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Crowd simulation working")
            print(f"   Generated {len(result.get('locations', []))} tourist locations")
            print(f"   Crowd density: {result.get('crowd_density', 0):.2f}")
            return True
        else:
            print(f"❌ Crowd simulation failed: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Crowd simulation error: {e}")
        return False

def test_backend_integration():
    """Test backend integration with AI service"""
    print("\n🔗 Testing Backend Integration...")
    
    # Test data for backend anomaly detection
    test_data = {
        "location": {
            "lat": 28.6139,
            "lng": 77.2090
        },
        "crowdDensity": 0.8,
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/anomaly-detection",
            json=test_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Backend integration working")
            print(f"   Is Anomaly: {result.get('isAnomaly', 'Unknown')}")
            print(f"   Anomaly Type: {result.get('anomalyType', 'None')}")
            print(f"   Confidence: {result.get('confidence', 'N/A')}")
            print(f"   Timestamp: {result.get('timestamp', 'Unknown')}")
            return True
        else:
            print(f"❌ Backend integration failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend integration error: {e}")
        return False

def run_all_tests():
    """Run all AI service tests"""
    print("🚀 Starting AI Service Tests")
    print("=" * 50)
    
    results = {
        "health": test_ai_service_health(),
        "stats": test_ai_service_stats(),
        "anomaly_detection": test_anomaly_detection(),
        "crowd_simulation": test_crowd_simulation(),
        "backend_integration": test_backend_integration()
    }
    
    print("\n" + "=" * 50)
    print("📋 Test Results Summary:")
    
    passed = 0
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name.replace('_', ' ').title()}: {status}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All AI service tests passed! AI is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the AI service setup.")
        
        if not results["health"]:
            print("\n💡 Troubleshooting:")
            print("   1. Make sure AI service is running: cd ai-service && python app.py")
            print("   2. Check if port 8000 is available")
            print("   3. Verify ai-service/.env configuration")
        
        if not results["backend_integration"]:
            print("   4. Make sure backend is running: cd backend && python main.py")
            print("   5. Check if port 3001 is available")

if __name__ == "__main__":
    run_all_tests()
