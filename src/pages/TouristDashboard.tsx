import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import toast from 'react-hot-toast';
import { SafeZone, Location } from '../types';
import { Bell, AlertTriangle, CheckCircle, Clock, MapPin, Shield } from 'lucide-react';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface TouristDashboardProps {
  user: any;
}

const LocationMarker: React.FC<{ location: Location; onLocationUpdate: (location: Location) => void }> = ({ 
  location, 
  onLocationUpdate 
}) => {
  const map = useMapEvents({
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

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  title: string;
  message: string;
  timestamp: Date;
  location?: { lat: number; lng: number };
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const TouristDashboard: React.FC<TouristDashboardProps> = ({ user }) => {
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'alerts' | 'profile'>('map');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
          updateLocationOnServer(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Chennai, India
          const defaultLocation = { lat: 13.0827, lng: 80.2707 };
          setUserLocation(defaultLocation);
          updateLocationOnServer(defaultLocation);
        }
      );
    }

    // Fetch safe zones
    fetchSafeZones();
    
    // Initialize sample alerts
    initializeAlerts();
  }, []);

  const initializeAlerts = () => {
    const sampleAlerts: Alert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Weather Alert',
        message: 'Heavy rain expected in your area. Consider indoor activities.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false,
        priority: 'medium'
      },
      {
        id: '2',
        type: 'info',
        title: 'Zone Update',
        message: 'New safe zone added near Marina Beach. Check the map for details.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        priority: 'low'
      },
      {
        id: '3',
        type: 'success',
        title: 'Location Verified',
        message: 'Your location has been successfully updated and verified.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: true,
        priority: 'low'
      },
      {
        id: '4',
        type: 'danger',
        title: 'Security Alert',
        message: 'Increased security measures in downtown area. Avoid crowds and stay alert.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        read: false,
        priority: 'high'
      }
    ];
    
    setAlerts(sampleAlerts);
    setUnreadCount(sampleAlerts.filter(alert => !alert.read).length);
  };

  const fetchSafeZones = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/safe-zones');
      setSafeZones(response.data);
    } catch (error) {
      console.error('Error fetching safe zones:', error);
    }
  };

  const updateLocationOnServer = async (location: Location) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/api/update-location', {
        lat: location.lat,
        lng: location.lng
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleMapClick = async (location: Location) => {
    setUserLocation(location);
    setIsUpdatingLocation(true);
    
    try {
      await updateLocationOnServer(location);
      toast.success('Location updated successfully');
    } catch (error) {
      toast.error('Failed to update location');
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleSOSClick = async () => {
    if (!userLocation) {
      toast.error('Location not available');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3001/api/sos', {
        lat: userLocation.lat,
        lng: userLocation.lng,
        message: 'Emergency SOS alert triggered'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('SOS alert sent to authorities!');
    } catch (error) {
      console.error('SOS error:', error);
      toast.error('Failed to send SOS alert');
    }
  };

  const getZoneColor = (type: 'safe' | 'restricted') => {
    return type === 'safe' ? '#22c55e' : '#ef4444';
  };

  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(prev => {
      const alertToDelete = prev.find(alert => alert.id === alertId);
      const newAlerts = prev.filter(alert => alert.id !== alertId);
      if (alertToDelete && !alertToDelete.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return newAlerts;
    });
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'danger': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'info': return <Bell className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAlertBorderColor = (type: Alert['type']) => {
    switch (type) {
      case 'warning': return 'border-l-yellow-500';
      case 'danger': return 'border-l-red-500';
      case 'success': return 'border-l-green-500';
      case 'info': return 'border-l-blue-500';
      default: return 'border-l-gray-500';
    }
  };

  const getPriorityBadge = (priority: Alert['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority];
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white shadow-soft border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">{user?.name?.charAt(0) || 'T'}</span>
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-neutral-900">Welcome back, {user?.name || 'Tourist'}</h1>
                <p className="text-sm text-neutral-600">Your safety is our priority</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-700">Tourist ID</p>
                <p className="text-xs font-mono text-primary-600">{user?.touristID || 'N/A'}</p>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-accent-50 rounded-full">
                <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-accent-700">Protected</span>
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="border-t border-neutral-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('map')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'map'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Live Map</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                  activeTab === 'alerts'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span>Alerts</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Profile</span>
                </div>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        {/* Global SOS Button - Always Visible */}
        <button
          onClick={handleSOSClick}
          className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3 group z-50 border-2 border-red-500"
        >
          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="font-bold">EMERGENCY SOS</span>
        </button>

        {activeTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 h-96 lg:h-[600px] overflow-hidden">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-neutral-900">Live Safety Map</h2>
                    <p className="text-sm text-neutral-600">Click anywhere to update your location</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-neutral-600">
                    <div className="w-3 h-3 bg-accent-500 rounded-full"></div>
                    <span>Safe Zone</span>
                    <div className="w-3 h-3 bg-red-500 rounded-full ml-4"></div>
                    <span>Restricted</span>
                  </div>
                </div>
              </div>
              <div className="relative h-full">
                <MapContainer
                  center={userLocation ? [userLocation.lat, userLocation.lng] : [13.0827, 80.2707]}
                  zoom={13}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* Safe Zones */}
                  {safeZones.map((zone) => (
                    <Polygon
                      key={zone._id}
                      positions={zone.coordinates.map(coord => [coord[1], coord[0]])}
                      pathOptions={{
                        color: getZoneColor(zone.type),
                        fillColor: getZoneColor(zone.type),
                        fillOpacity: 0.2,
                        weight: 2
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold text-neutral-900">{zone.name}</h3>
                          <p className={`text-sm ${zone.type === 'safe' ? 'text-accent-600' : 'text-red-600'}`}>
                            {zone.type === 'safe' ? '✓ Safe Zone' : '⚠ Restricted Area'}
                          </p>
                        </div>
                      </Popup>
                    </Polygon>
                  ))}

                  {/* User Location Marker */}
                  <LocationMarker location={userLocation || { lat: 0, lng: 0 }} onLocationUpdate={handleMapClick} />
                </MapContainer>

                {/* Location Info */}
                {userLocation && (
                  <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-medium border border-neutral-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
                      <h3 className="font-semibold text-sm text-neutral-900">Your Location</h3>
                    </div>
                    <p className="text-xs text-neutral-600 font-mono">
                      {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                    </p>
                    {isUpdatingLocation && (
                      <p className="text-xs text-primary-600 mt-1 flex items-center">
                        <div className="w-3 h-3 border border-primary-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                        Updating...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Safety Score</p>
                    <p className="text-lg font-bold text-accent-600">98%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Zones Visited</p>
                    <p className="text-lg font-bold text-primary-600">12</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-6">
              <h3 className="font-display text-lg font-semibold text-neutral-900 mb-4">Profile</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">Name</span>
                  <span className="text-sm text-neutral-900">{user.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">Email</span>
                  <span className="text-sm text-neutral-900">{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">Tourist ID</span>
                  <span className="text-xs font-mono text-primary-600 bg-primary-50 px-2 py-1 rounded">{user.touristID}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">Status</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-accent-600 font-medium">Protected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Guidelines */}
            <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-6">
              <h3 className="font-display text-lg font-semibold text-neutral-900 mb-4">Safety Guidelines</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-accent-100 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-neutral-700">Stay within designated safe zones</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-neutral-700">Avoid restricted areas at all times</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-neutral-700">Keep your location updated regularly</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-neutral-700">Use SOS button for emergencies only</p>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 p-6">
              <h3 className="font-display text-lg font-semibold text-red-900 mb-4">Emergency Contacts</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-800">Local Police</span>
                  <span className="text-sm font-mono text-red-900">911</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-800">Tourist Helpline</span>
                  <span className="text-sm font-mono text-red-900">1-800-SAFE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-800">Medical Emergency</span>
                  <span className="text-sm font-mono text-red-900">911</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
        
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* Alerts Header */}
            <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-neutral-900">Safety Alerts</h2>
                  <p className="text-sm text-neutral-600">Stay informed about important safety updates</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-primary-50 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium text-primary-700">{alerts.length} Total</span>
                  </div>
                  {unreadCount > 0 && (
                    <div className="bg-red-50 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium text-red-700">{unreadCount} Unread</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-12 text-center">
                  <Bell className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="font-display text-lg font-semibold text-neutral-900 mb-2">No Alerts</h3>
                  <p className="text-neutral-600">You're all caught up! No new safety alerts at this time.</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`bg-white rounded-2xl shadow-soft border border-neutral-200 p-6 border-l-4 ${
                      getAlertBorderColor(alert.type)
                    } ${!alert.read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className={`font-semibold text-neutral-900 ${
                              !alert.read ? 'font-bold' : ''
                            }`}>
                              {alert.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              getPriorityBadge(alert.priority)
                            }`}>
                              {alert.priority.toUpperCase()}
                            </span>
                            {!alert.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-neutral-700 mb-3">{alert.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-neutral-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{alert.timestamp.toLocaleString()}</span>
                            </div>
                            {alert.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>
                                  {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!alert.read && (
                          <button
                            onClick={() => markAlertAsRead(alert.id)}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm font-medium"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Information */}
            <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-6">
              <h2 className="font-display text-xl font-semibold text-neutral-900 mb-6">Profile Information</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <span className="text-sm font-medium text-neutral-700">Full Name</span>
                  <span className="text-sm text-neutral-900 font-medium">{user?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <span className="text-sm font-medium text-neutral-700">Email Address</span>
                  <span className="text-sm text-neutral-900">{user?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <span className="text-sm font-medium text-neutral-700">Tourist ID</span>
                  <span className="text-xs font-mono text-primary-600 bg-primary-50 px-2 py-1 rounded">
                    {user?.touristID || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <span className="text-sm font-medium text-neutral-700">Account Status</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-accent-600 font-medium">Active & Protected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-neutral-700">Safety Score</span>
                  <span className="text-sm font-bold text-accent-600">98%</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-6">
                <h3 className="font-display text-lg font-semibold text-neutral-900 mb-4">Activity Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-accent-50 rounded-xl">
                    <div className="text-2xl font-bold text-accent-600">12</div>
                    <div className="text-sm text-neutral-600">Zones Visited</div>
                  </div>
                  <div className="text-center p-4 bg-primary-50 rounded-xl">
                    <div className="text-2xl font-bold text-primary-600">24h</div>
                    <div className="text-sm text-neutral-600">Time Protected</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-xl">
                    <div className="text-2xl font-bold text-yellow-600">{alerts.length}</div>
                    <div className="text-sm text-neutral-600">Total Alerts</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-neutral-600">SOS Calls</div>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200 p-6">
                <h3 className="font-display text-lg font-semibold text-red-900 mb-4">Emergency Contacts</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-800">Local Police</span>
                    <span className="text-sm font-mono text-red-900">911</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-800">Tourist Helpline</span>
                    <span className="text-sm font-mono text-red-900">1-800-SAFE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-800">Medical Emergency</span>
                    <span className="text-sm font-mono text-red-900">911</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TouristDashboard;
