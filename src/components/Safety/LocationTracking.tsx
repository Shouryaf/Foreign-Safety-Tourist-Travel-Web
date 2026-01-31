import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Shield, Users, Clock, AlertTriangle, Eye, EyeOff, Smartphone, Wifi } from 'lucide-react';
import toast from 'react-hot-toast';

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
  address?: string;
}

interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  canViewLocation: boolean;
}

interface LocationHistory {
  id: string;
  location: LocationData;
  timestamp: string;
}

export default function LocationTracking() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [locationHistory, setLocationHistory] = useState<LocationHistory[]>([]);
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([
    {
      id: '1',
      name: 'Emergency Contact',
      phone: '+91 XXXXXXXXXX',
      canViewLocation: true
    },
    {
      id: '2',
      name: 'Family Member',
      phone: '+91 XXXXXXXXXX',
      canViewLocation: true
    }
  ]);
  const [isLocationVisible, setIsLocationVisible] = useState(true);
  const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timeout | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [batteryOptimized, setBatteryOptimized] = useState(false);

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    // Load saved location history from localStorage
    const savedHistory = localStorage.getItem('locationHistory');
    if (savedHistory) {
      setLocationHistory(JSON.parse(savedHistory));
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    };
  }, []);

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    const options = {
      enableHighAccuracy: !batteryOptimized,
      timeout: 10000,
      maximumAge: batteryOptimized ? 60000 : 5000
    };

    const successCallback = (position: GeolocationPosition) => {
      const newLocation: LocationData = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
      };

      setLocation(newLocation);

      // Add to history
      const historyEntry: LocationHistory = {
        id: Date.now().toString(),
        location: newLocation,
        timestamp: new Date().toISOString()
      };

      const updatedHistory = [historyEntry, ...locationHistory.slice(0, 49)]; // Keep last 50 locations
      setLocationHistory(updatedHistory);
      localStorage.setItem('locationHistory', JSON.stringify(updatedHistory));

      // Reverse geocoding (simulated)
      reverseGeocode(newLocation.lat, newLocation.lng);
    };

    const errorCallback = (error: GeolocationPositionError) => {
      let errorMessage = 'Location access denied';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out';
          break;
      }
      toast.error(errorMessage);
    };

    const id = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
    setWatchId(id);
    setIsTracking(true);
    toast.success('Location tracking started');
  };

  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    if (trackingInterval) {
      clearInterval(trackingInterval);
      setTrackingInterval(null);
    }
    setIsTracking(false);
    toast.success('Location tracking stopped');
  };

  const shareLocation = () => {
    if (!location) {
      toast.error('No location available to share');
      return;
    }

    const locationUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Current Location',
        text: 'Here is my current location for safety',
        url: locationUrl
      });
    } else {
      navigator.clipboard.writeText(locationUrl);
      toast.success('Location link copied to clipboard');
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    // Simulated reverse geocoding - in real app, use Google Maps API or similar
    const mockAddresses = [
      'New Delhi Railway Station, New Delhi',
      'Connaught Place, New Delhi',
      'India Gate, New Delhi',
      'Red Fort, Delhi',
      'Karol Bagh Market, Delhi'
    ];
    
    setTimeout(() => {
      const randomAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
      setLocation(prev => prev ? { ...prev, address: randomAddress } : null);
    }, 1000);
  };

  const toggleContactLocationAccess = (contactId: string) => {
    setTrustedContacts(contacts =>
      contacts.map(contact =>
        contact.id === contactId
          ? { ...contact, canViewLocation: !contact.canViewLocation }
          : contact
      )
    );
    toast.success('Contact permissions updated');
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy <= 10) return 'text-green-600 bg-green-100';
    if (accuracy <= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Location Tracking</h1>
                <p className="text-gray-600">Real-time location monitoring and sharing</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setBatteryOptimized(!batteryOptimized)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  batteryOptimized
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {batteryOptimized ? 'Battery Optimized' : 'High Accuracy'}
              </button>
              <button
                onClick={isTracking ? stopTracking : startTracking}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isTracking
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Navigation className="w-4 h-4" />
                {isTracking ? 'Stop Tracking' : 'Start Tracking'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Current Location */}
          {location && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Current Location</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsLocationVisible(!isLocationVisible)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {isLocationVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={shareLocation}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Share Location
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Coordinates</span>
                    </div>
                    {isLocationVisible ? (
                      <div className="text-blue-800">
                        <div>Latitude: {location.lat.toFixed(6)}</div>
                        <div>Longitude: {location.lng.toFixed(6)}</div>
                      </div>
                    ) : (
                      <div className="text-blue-800">Location hidden for privacy</div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Accuracy</span>
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getAccuracyColor(location.accuracy)}`}>
                      <Wifi className="w-3 h-3" />
                      ±{location.accuracy.toFixed(0)}m
                    </div>
                  </div>
                </div>

                {location.address && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Navigation className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Address</span>
                    </div>
                    <div className="text-blue-800">{location.address}</div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Clock className="w-4 h-4" />
                    Last updated: {formatTimeAgo(location.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trusted Contacts */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trusted Contacts</h2>
            <div className="space-y-3">
              {trustedContacts.map((contact) => (
                <div key={contact.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{contact.name}</div>
                        <div className="text-sm text-gray-600">{contact.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        contact.canViewLocation
                          ? 'text-green-600 bg-green-100'
                          : 'text-gray-600 bg-gray-100'
                      }`}>
                        {contact.canViewLocation ? 'Can View Location' : 'No Access'}
                      </span>
                      <button
                        onClick={() => toggleContactLocationAccess(contact.id)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          contact.canViewLocation
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {contact.canViewLocation ? 'Revoke' : 'Grant'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location History */}
          {locationHistory.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Locations</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {locationHistory.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <div>
                          {isLocationVisible ? (
                            <div className="text-sm font-medium text-gray-900">
                              {entry.location.lat.toFixed(4)}, {entry.location.lng.toFixed(4)}
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-gray-900">Location hidden</div>
                          )}
                          {entry.location.address && (
                            <div className="text-xs text-gray-600">{entry.location.address}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTimeAgo(entry.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Indicator */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-700">
              <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="font-medium">
                {isTracking ? 'Location tracking is active' : 'Location tracking is inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {isTracking
                ? 'Your location is being monitored and shared with trusted contacts.'
                : 'Start tracking to enable real-time location monitoring.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}