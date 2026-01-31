import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/leaflet.css';
import { SafeZone, Location } from '../../types';
import axios from 'axios';

// Fix for default markers in react-leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface TouristMapProps {
  onLocationUpdate: (location: Location) => void;
  onSOSClick: (location: Location) => void;
  currentLocation?: Location;
}

const LocationMarker: React.FC<{ location: Location; onLocationUpdate: (location: Location) => void }> = ({ 
  location, 
  onLocationUpdate 
}) => {
  useMapEvents({
    click(e) {
      const newLocation = { lat: e.latlng.lat, lng: e.latlng.lng };
      onLocationUpdate(newLocation);
    },
  });

  return location ? (
    <Marker position={[location.lat, location.lng]}>
      <Popup>
        <div>
          <h3>Your Location</h3>
          <p>Lat: {location.lat.toFixed(6)}</p>
          <p>Lng: {location.lng.toFixed(6)}</p>
        </div>
      </Popup>
    </Marker>
  ) : null;
};

const TouristMap: React.FC<TouristMapProps> = ({ onLocationUpdate, onSOSClick }) => {
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          onLocationUpdate(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Chennai, India
          const defaultLocation = { lat: 13.0827, lng: 80.2707 };
          setUserLocation(defaultLocation);
          onLocationUpdate(defaultLocation);
        }
      );
    }

    // Fetch safe zones
    fetchSafeZones();
  }, []);

  const fetchSafeZones = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/safe-zones');
      setSafeZones(response.data);
    } catch (error) {
      console.error('Error fetching safe zones:', error);
    }
  };

  const handleMapClick = (location: Location) => {
    setUserLocation(location);
    onLocationUpdate(location);
  };

  const handleSOSClick = () => {
    if (userLocation) {
      onSOSClick(userLocation);
    }
  };

  const getZoneColor = (type: 'safe' | 'restricted') => {
    return type === 'safe' ? '#22c55e' : '#ef4444';
  };

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-lg bg-white">
      <MapContainer
        center={userLocation || [51.505, -0.09]}
        zoom={userLocation ? 15 : 13}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        zoomControl={true}
        scrollWheelZoom={true}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        {/* Safe Zones */}
        {safeZones.map((zone) => (
          <Polygon
            key={zone._id}
            positions={zone.coordinates.map(coord => [coord[1], coord[0]])}
            pathOptions={{
              color: getZoneColor(zone.type),
              fillColor: getZoneColor(zone.type),
              fillOpacity: 0.3,
              weight: 2
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{zone.name}</h3>
                <p className={`text-sm ${zone.type === 'safe' ? 'text-green-600' : 'text-red-600'}`}>
                  {zone.type === 'safe' ? 'Safe Zone' : 'Restricted Zone'}
                </p>
              </div>
            </Popup>
          </Polygon>
        ))}

        {/* User Location Marker */}
        <LocationMarker location={userLocation || { lat: 0, lng: 0 }} onLocationUpdate={handleMapClick} />
      </MapContainer>

      {/* SOS Button */}
      <button
        onClick={handleSOSClick}
        className="absolute bottom-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition-colors duration-200 flex items-center gap-2"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        SOS
      </button>

      {/* Location Info */}
      {userLocation && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg">
          <h3 className="font-bold text-sm">Current Location</h3>
          <p className="text-xs text-gray-600">
            Lat: {userLocation.lat.toFixed(6)}
          </p>
          <p className="text-xs text-gray-600">
            Lng: {userLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default TouristMap;
