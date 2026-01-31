// MongoDB initialization script for Tourist Safety System
db = db.getSiblingDB('tourist-safety');

// Create collections
db.createCollection('users');
db.createCollection('safe_zones');
db.createCollection('alerts');
db.createCollection('tourist_locations');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "tourist_id": 1 }, { unique: true });
db.alerts.createIndex({ "timestamp": -1 });
db.tourist_locations.createIndex({ "tourist_id": 1, "timestamp": -1 });
db.safe_zones.createIndex({ "zone_type": 1 });

// Insert sample data for development
db.users.insertMany([
  {
    email: "admin@tourist-safety.com",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm", // password: admin123
    role: "authority",
    name: "System Administrator",
    tourist_id: "ADMIN_001",
    created_at: new Date(),
    is_active: true
  },
  {
    email: "tourist@example.com",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm", // password: tourist123
    role: "tourist",
    name: "John Doe",
    tourist_id: "TOURIST_001",
    passport_number: "AB123456",
    created_at: new Date(),
    is_active: true
  }
]);

// Insert sample safe zones
db.safe_zones.insertMany([
  {
    zone_id: "SAFE_001",
    name: "Tourist District Center",
    zone_type: "safe",
    coordinates: [
      [40.7589, -73.9851],
      [40.7614, -73.9776],
      [40.7505, -73.9733],
      [40.7481, -73.9808]
    ],
    description: "Main tourist area with high security presence",
    created_by: "ADMIN_001",
    created_at: new Date(),
    is_active: true
  },
  {
    zone_id: "RESTRICTED_001",
    name: "Construction Zone",
    zone_type: "restricted",
    coordinates: [
      [40.7400, -73.9900],
      [40.7420, -73.9880],
      [40.7410, -73.9860],
      [40.7390, -73.9880]
    ],
    description: "Active construction area - tourists should avoid",
    created_by: "ADMIN_001",
    created_at: new Date(),
    is_active: true
  }
]);

print("Tourist Safety Database initialized successfully!");
print("Sample users created:");
print("- Authority: admin@tourist-safety.com / admin123");
print("- Tourist: tourist@example.com / tourist123");
print("Sample safe zones and restricted zones created.");
