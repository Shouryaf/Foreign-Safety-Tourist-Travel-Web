# Tourist Safety AI Service

This is the AI microservice for the Tourist Safety prototype that provides anomaly detection capabilities.

## Features

- **Crowd Density Detection**: Analyzes GPS data to detect unusual crowd concentrations
- **Movement Pattern Analysis**: Identifies unusual movement patterns and speeds
- **Video Anomaly Detection**: Simulates computer vision-based anomaly detection
- **Real-time Alerting**: Automatically sends alerts to the main backend when anomalies are detected

## API Endpoints

### POST /detect-anomaly
Main anomaly detection endpoint that analyzes location data and video feeds.

**Request Body:**
```json
{
  "locations": [
    {
      "lat": 13.0827,
      "lng": 80.2707,
      "timestamp": "2024-01-01T12:00:00Z",
      "tourist_count": 1
    }
  ],
  "video_url": "optional_video_url",
  "crowd_density_threshold": 0.7
}
```

**Response:**
```json
{
  "is_anomaly": true,
  "anomaly_type": "crowd_density",
  "confidence": 0.85,
  "details": {
    "crowd_analysis": {...},
    "movement_analysis": {...},
    "video_analysis": {...}
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### POST /simulate-crowd-data
Generates simulated crowd data for testing purposes.

### GET /health
Health check endpoint.

### GET /stats
Returns service statistics and capabilities.

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the service:
```bash
python main.py
```

The service will be available at `http://localhost:8000`

## Integration

The AI service integrates with the main backend by:
1. Receiving location data and video feeds
2. Analyzing patterns using various algorithms
3. Automatically sending alerts to the backend when anomalies are detected
4. Providing detailed analysis results

## Demo Features

For the prototype, the service includes:
- Simulated crowd density analysis
- Basic movement pattern detection
- Mock video anomaly detection
- Real-time alert integration with the main backend

In a production environment, this would be enhanced with:
- Real computer vision models (YOLO, etc.)
- Advanced crowd behavior analysis
- Machine learning models for pattern recognition
- Integration with CCTV systems
