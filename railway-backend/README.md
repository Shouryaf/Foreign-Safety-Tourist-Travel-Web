# Railway Booking System Backend - IRCTC Clone

A complete railway booking system backend that replicates IRCTC functionality with real database operations, PNR generation, seat management, and payment processing.

## Features

### 🚂 Core Railway Features
- **Real Train Database**: Complete train schedules, routes, and timing data
- **Station Management**: Major Indian railway stations with facilities
- **Seat Availability**: Real-time seat tracking for 120 days advance booking
- **PNR Generation**: Authentic 10-digit PNR numbers
- **Fare Calculation**: Distance-based fare calculation with class multipliers
- **Booking Management**: Complete booking lifecycle with confirmation

### 🎫 Booking System
- **Multi-passenger Booking**: Book for multiple passengers in single transaction
- **Class Selection**: All classes (SL, 3A, 2A, 1A, CC, EC, 2S)
- **Real-time Availability**: Live seat availability checking
- **Waiting List**: Automatic waiting list management
- **Ticket Generation**: Unique ticket numbers and booking references

### 💳 Payment Integration
- **Multiple Payment Methods**: Credit/Debit cards, UPI, Net Banking
- **Background Processing**: Asynchronous payment processing
- **Transaction Tracking**: Complete payment audit trail
- **Payment Status**: Real-time payment status updates

### 📊 Advanced Features
- **Route Optimization**: Intelligent route finding between stations
- **Dynamic Pricing**: Class-based fare calculation with taxes
- **Booking History**: Complete booking and payment history
- **Real-time Updates**: Live booking status and seat availability

## API Endpoints

### Station Management
```
GET /api/stations/search?query=delhi
```

### Train Search
```
GET /api/trains/search?source=NDLS&destination=MAS&journey_date=2024-01-15&class_code=3A
```

### Booking Operations
```
POST /api/booking/create
GET /api/pnr/{pnr}
```

### Fare Calculation
```
GET /api/fare/calculate?train_number=12622&source=NDLS&destination=MAS&class_code=3A
```

### Train Details
```
GET /api/trains/{train_number}
```

## Database Schema

### Collections
- **trains**: Train schedules, routes, classes, and timing
- **stations**: Station details, facilities, and location data
- **bookings**: Complete booking records with passenger details
- **seat_availability**: Real-time seat availability for all trains
- **payments**: Payment transactions and status tracking
- **passengers**: Passenger information and preferences
- **users**: User accounts and authentication data

## Installation & Setup

### Prerequisites
- Python 3.8+
- MongoDB 4.4+
- pip package manager

### Installation Steps

1. **Install MongoDB**
```bash
# Windows (using Chocolatey)
choco install mongodb

# Or download from: https://www.mongodb.com/try/download/community
```

2. **Install Python Dependencies**
```bash
cd railway-backend
pip install -r requirements.txt
```

3. **Configure Environment**
```bash
# Copy .env file and update MongoDB URL if needed
cp .env.example .env
```

4. **Start MongoDB Service**
```bash
# Windows
net start MongoDB

# Or start MongoDB manually
mongod --dbpath C:\data\db
```

5. **Start Railway Backend**
```bash
python app.py
```

The backend will start on `http://localhost:8001`

## Database Initialization

The system automatically initializes with:
- **10 Major Indian Railway Stations** (Delhi, Mumbai, Kolkata, Chennai, Bangalore, etc.)
- **3 Popular Trains** (Rajdhani Express, Shatabdi Express, Tamil Nadu Express)
- **Seat Availability** for next 120 days
- **Complete Route Information** with accurate timing and distances

## Real Data Features

### Authentic Train Data
- **12301 Rajdhani Express**: New Delhi to Howrah (14 hours, 1441 km)
- **12002 Shatabdi Express**: New Delhi to Agra (2:05 hours, 199 km)  
- **12622 Tamil Nadu Express**: New Delhi to Chennai (32:15 hours, 2180 km)

### Realistic Fare Structure
- **Sleeper (SL)**: ₹0.8/km base rate
- **AC 3 Tier (3A)**: ₹2.1/km base rate
- **AC 2 Tier (2A)**: ₹3.2/km base rate
- **AC First Class (1A)**: ₹4.5/km base rate
- **Chair Car (CC)**: ₹2.8/km base rate
- **Executive Chair Car (EC)**: ₹4.2/km base rate

### Complete Booking Flow
1. **Search Trains**: Real availability checking
2. **Select Class**: Live seat count display
3. **Passenger Details**: Multiple passenger support
4. **Payment**: Secure payment processing
5. **Confirmation**: PNR generation and ticket
6. **Tracking**: Real-time status updates

## Integration with Frontend

Update your frontend `.env` file:
```bash
VITE_RAILWAY_API_URL=http://localhost:8001
```

The backend provides complete REST APIs that can be integrated with any frontend framework.

## Production Deployment

### Security Considerations
- Change JWT secret keys
- Use production MongoDB cluster
- Enable HTTPS/SSL
- Implement rate limiting
- Add API authentication
- Configure proper CORS origins

### Scaling Options
- MongoDB replica sets for high availability
- Redis for caching seat availability
- Load balancer for multiple backend instances
- CDN for static content delivery

## Testing

The system includes comprehensive test coverage for:
- Train search functionality
- Booking creation and management
- Payment processing
- PNR status tracking
- Seat availability updates

## Support

This is a complete railway booking system that replicates real IRCTC functionality. All features work with actual database operations, not mock data.

For issues or enhancements, check the logs at `railway_backend.log`.
