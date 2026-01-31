import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.transport_platform

# Sample danger locations data
sample_locations = [
    {
        "name": "Construction Zone - MG Road",
        "description": "Major road construction work in progress. Heavy machinery and debris present.",
        "latitude": 28.6304,
        "longitude": 77.2177,
        "risk_level": "medium",
        "category": "construction",
        "reported_by": "system",
        "verified": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    },
    {
        "name": "High Crime Area - Karol Bagh",
        "description": "Increased incidents of theft and robbery reported in this area, especially during evening hours.",
        "latitude": 28.6519,
        "longitude": 77.1909,
        "risk_level": "high",
        "category": "crime",
        "reported_by": "system",
        "verified": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    },
    {
        "name": "Flood Prone Area - Yamuna Bank",
        "description": "Area prone to flooding during monsoon season. Water logging common.",
        "latitude": 28.6562,
        "longitude": 77.2410,
        "risk_level": "critical",
        "category": "natural_disaster",
        "reported_by": "system",
        "verified": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    },
    {
        "name": "Traffic Accident Hotspot - Ring Road",
        "description": "Multiple vehicle accidents reported at this intersection. Poor visibility and heavy traffic.",
        "latitude": 28.6289,
        "longitude": 77.2065,
        "risk_level": "high",
        "category": "accident",
        "reported_by": "system",
        "verified": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    },
    {
        "name": "Protest Area - India Gate",
        "description": "Frequent political gatherings and protests. Road closures and crowd control measures in effect.",
        "latitude": 28.6129,
        "longitude": 77.2295,
        "risk_level": "medium",
        "category": "protest",
        "reported_by": "system",
        "verified": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    },
    {
        "name": "Unsafe Building - Old Delhi",
        "description": "Structurally unsafe building with risk of collapse. Avoid the area.",
        "latitude": 28.6507,
        "longitude": 77.2334,
        "risk_level": "critical",
        "category": "general",
        "reported_by": "system",
        "verified": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    },
    {
        "name": "Minor Road Work - CP",
        "description": "Small scale road maintenance work. Minor traffic disruption expected.",
        "latitude": 28.6315,
        "longitude": 77.2167,
        "risk_level": "low",
        "category": "construction",
        "reported_by": "system",
        "verified": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    },
    {
        "name": "Pickpocket Alert - Chandni Chowk",
        "description": "High tourist area with frequent pickpocketing incidents. Stay alert and secure belongings.",
        "latitude": 28.6506,
        "longitude": 77.2303,
        "risk_level": "medium",
        "category": "crime",
        "reported_by": "system",
        "verified": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    },
    {
        "name": "Gas Leak Area - Lajpat Nagar",
        "description": "Gas pipeline leak reported. Emergency services on site. Avoid open flames.",
        "latitude": 28.5677,
        "longitude": 77.2436,
        "risk_level": "critical",
        "category": "other",
        "reported_by": "system",
        "verified": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    },
    {
        "name": "Pothole Zone - Outer Ring Road",
        "description": "Multiple large potholes on the road. Drive carefully to avoid vehicle damage.",
        "latitude": 28.6692,
        "longitude": 77.2265,
        "risk_level": "low",
        "category": "general",
        "reported_by": "system",
        "verified": False,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
]

async def seed_danger_locations():
    """Seed the database with sample danger locations"""
    try:
        # Clear existing danger locations
        await db.danger_locations.delete_many({})
        print("Cleared existing danger locations")
        
        # Insert sample data
        result = await db.danger_locations.insert_many(sample_locations)
        print(f"Inserted {len(result.inserted_ids)} danger locations")
        
        # Print summary
        print("\nSample danger locations added:")
        for location in sample_locations:
            print(f"- {location['name']} ({location['risk_level']} risk)")
        
        print(f"\nTotal locations: {len(sample_locations)}")
        print(f"Risk level distribution:")
        risk_counts = {}
        for location in sample_locations:
            risk_level = location['risk_level']
            risk_counts[risk_level] = risk_counts.get(risk_level, 0) + 1
        
        for risk, count in risk_counts.items():
            print(f"  {risk}: {count}")
            
    except Exception as e:
        print(f"Error seeding danger locations: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_danger_locations())
