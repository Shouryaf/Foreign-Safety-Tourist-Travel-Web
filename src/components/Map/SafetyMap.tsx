import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import axios from 'axios';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface DangerLocation {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  reported_by: string;
  created_at: string;
  updated_at: string;
  verified: boolean;
}

interface SafetyMapProps {
  userLocation?: { lat: number; lng: number };
  height?: string;
  showUserLocation?: boolean;
  onLocationSelect?: (coords: [number, number]) => void;
}

// Custom hook to update map view
const ChangeView: React.FC<{ center: LatLngExpression; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const SafetyMap: React.FC<SafetyMapProps> = ({ 
  userLocation, 
  height = '500px', 
  showUserLocation = true,
  onLocationSelect 
}) => {
  const [dangerLocations, setDangerLocations] = useState<DangerLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]); // Default to Delhi
  const [mapZoom, setMapZoom] = useState(10);

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setMapZoom(13);
    }
    fetchDangerLocations();
  }, [userLocation]);

  const fetchDangerLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/danger-locations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDangerLocations(response.data.locations || []);
    } catch (error) {
      console.error('Error fetching danger locations:', error);
      toast.error('Failed to load danger locations');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return '#22c55e'; // Green
      case 'medium': return '#f59e0b'; // Yellow
      case 'high': return '#ef4444'; // Red
      case 'critical': return '#7c2d12'; // Dark Red
      default: return '#6b7280'; // Gray
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    const color = getRiskColor(riskLevel);
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
          <path fill="${color}" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
          <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
          <text x="12.5" y="17" text-anchor="middle" font-size="8" font-weight="bold" fill="${color}">!</text>
        </svg>
      `)}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  };

  const getUserLocationIcon = () => {
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <circle fill="#3b82f6" stroke="#fff" stroke-width="3" cx="10" cy="10" r="8"/>
          <circle fill="#fff" cx="10" cy="10" r="3"/>
        </svg>
      `)}`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height, width: '100%' }}
        className="rounded-lg z-0"
      >
        <ChangeView center={mapCenter} zoom={mapZoom} />
        
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        {showUserLocation && userLocation && (
          <>
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={getUserLocationIcon()}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-semibold text-blue-600">Your Location</h3>
                  <p className="text-sm text-gray-600">Current position</p>
                </div>
              </Popup>
            </Marker>
            
            {/* Safety radius circle around user */}
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={1000} // 1km radius
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                weight: 2,
                dashArray: '5, 5'
              }}
            />
          </>
        )}

        {/* Danger Location Markers */}
        {dangerLocations.map((location) => (
          <React.Fragment key={location.id}>
            <Marker
              position={[location.latitude, location.longitude]}
              icon={getRiskIcon(location.risk_level)}
              eventHandlers={{
                click: () => {
                  if (onLocationSelect) {
                    onLocationSelect([location.latitude, location.longitude]);
                  }
                }
              }}
            >
              <Popup maxWidth={300}>
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{location.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white`}
                          style={{ backgroundColor: getRiskColor(location.risk_level) }}>
                      {location.risk_level.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{location.description}</p>
                  
                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="font-medium">{location.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reported:</span>
                      <span>{formatDate(location.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={`font-medium ${location.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                        {location.verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Danger zone circle */}
            <Circle
              center={[location.latitude, location.longitude]}
              radius={location.risk_level === 'critical' ? 500 : 
                     location.risk_level === 'high' ? 300 : 
                     location.risk_level === 'medium' ? 200 : 100}
              pathOptions={{
                color: getRiskColor(location.risk_level),
                fillColor: getRiskColor(location.risk_level),
                fillOpacity: 0.2,
                weight: 2
              }}
            />
          </React.Fragment>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10">
        <h4 className="font-semibold text-sm mb-2">Risk Levels</h4>
        <div className="space-y-1">
          {[
            { level: 'low', label: 'Low Risk', color: '#22c55e' },
            { level: 'medium', label: 'Medium Risk', color: '#f59e0b' },
            { level: 'high', label: 'High Risk', color: '#ef4444' },
            { level: 'critical', label: 'Critical', color: '#7c2d12' }
          ].map(({ level, label, color }) => (
            <div key={level} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Location Count */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-2 z-10">
        <div className="text-xs text-gray-600">
          <span className="font-semibold">{dangerLocations.length}</span> danger locations
        </div>
      </div>
    </div>
  );
};

export default SafetyMap;
