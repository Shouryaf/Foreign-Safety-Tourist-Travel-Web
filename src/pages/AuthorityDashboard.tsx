import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import toast from 'react-hot-toast';
import { SafeZone, Alert } from '../types';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AuthorityDashboardProps {
  user: any;
}

const ZoneCreator: React.FC<{ onZoneCreated: () => void }> = ({ onZoneCreated }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [zoneType, setZoneType] = useState<'safe' | 'restricted'>('safe');
  const [zoneName, setZoneName] = useState('');
  const [coordinates, setCoordinates] = useState<number[][]>([]);

  useMapEvents({
    click(e) {
      if (isCreating) {
        const newCoord = [e.latlng.lng, e.latlng.lat];
        setCoordinates([...coordinates, newCoord]);
      }
    },
  });

  const handleCreateZone = async () => {
    if (coordinates.length < 3) {
      toast.error('At least 3 points are required to create a zone');
      return;
    }

    if (!zoneName.trim()) {
      toast.error('Please enter a zone name');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/api/safe-zones', {
        name: zoneName,
        coordinates: [...coordinates, coordinates[0]], // Close the polygon
        type: zoneType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Zone created successfully');
      setCoordinates([]);
      setZoneName('');
      setIsCreating(false);
      onZoneCreated();
    } catch (error) {
      console.error('Error creating zone:', error);
      toast.error('Failed to create zone');
    }
  };

  const handleCancel = () => {
    setCoordinates([]);
    setZoneName('');
    setIsCreating(false);
  };

  return (
    <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-large border border-neutral-200 z-10 min-w-[280px]">
      <h3 className="font-display font-semibold text-neutral-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        Zone Management
      </h3>
      
      {!isCreating ? (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create New Zone</span>
        </button>
      ) : (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter zone name"
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          
          <select
            value={zoneType}
            onChange={(e) => setZoneType(e.target.value as 'safe' | 'restricted')}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          >
            <option value="safe">Safe Zone</option>
            <option value="restricted">Restricted Zone</option>
          </select>
          
          <div className="bg-neutral-50 p-3 rounded-lg">
            <p className="text-xs text-neutral-600 flex items-center">
              <svg className="w-4 h-4 mr-1 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18l8.5-5L5 8v10z" />
              </svg>
              Click on map to add points ({coordinates.length} points added)
            </p>
            {coordinates.length > 0 && coordinates.length < 3 && (
              <p className="text-xs text-amber-600 mt-1">Need {3 - coordinates.length} more points</p>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleCreateZone}
              disabled={coordinates.length < 3 || !zoneName.trim()}
              className="flex-1 bg-accent-600 hover:bg-accent-700 disabled:bg-neutral-400 text-white px-4 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Create</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-neutral-600 hover:bg-neutral-700 text-white px-4 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({ user }) => {
  const [safeZones, setSafeZones] = useState<SafeZone[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  useEffect(() => {
    fetchSafeZones();
    fetchAlerts();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchAlerts();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchSafeZones = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/safe-zones');
      setSafeZones(response.data);
    } catch (error) {
      console.error('Error fetching safe zones:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const getZoneColor = (type: 'safe' | 'restricted') => {
    return type === 'safe' ? '#22c55e' : '#ef4444';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'sos':
        return '🚨';
      case 'geofence_breach':
        return '⚠️';
      case 'anomaly':
        return '🤖';
      default:
        return '📢';
    }
  };


  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white shadow-soft border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-neutral-900">Authority Control Center</h1>
                <p className="text-sm text-neutral-600">Welcome back, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-700">Active Alerts</p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-2xl font-bold text-red-600">{alerts.filter(a => a.status === 'pending').length}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-700">Total Zones</p>
                <p className="text-2xl font-bold text-primary-600">{safeZones.length}</p>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-accent-50 rounded-full">
                <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-accent-700">Monitoring Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 h-96 lg:h-[600px] overflow-hidden">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-neutral-900">Live Monitoring Map</h2>
                    <p className="text-sm text-neutral-600">Real-time tourist tracking and zone management</p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-neutral-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-accent-500 rounded-full"></div>
                      <span>Safe Zone</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Restricted</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Alert</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-full">
                <MapContainer
                  center={[13.0827, 80.2707]}
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

                  {/* Alert Markers */}
                  {alerts.map((alert) => (
                    <Marker
                      key={alert._id}
                      position={[alert.location.lat, alert.location.lng]}
                      eventHandlers={{
                        click: () => setSelectedAlert(alert)
                      }}
                    >
                      <Popup>
                        <div>
                          <h3 className="font-bold">{getAlertIcon(alert.type)} {alert.type.toUpperCase()}</h3>
                          <p className="text-sm">Tourist ID: {alert.touristID}</p>
                          <p className="text-sm">{alert.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Zone Creator */}
                  <ZoneCreator onZoneCreated={fetchSafeZones} />
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Active Alerts</p>
                    <p className="text-lg font-bold text-red-600">{alerts.filter(a => a.status === 'pending').length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Safe Zones</p>
                    <p className="text-lg font-bold text-accent-600">{safeZones.filter(z => z.type === 'safe').length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-6">
              <h3 className="font-display text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.343 12.344l1.414 1.414L9 10.414V17h5v-6.586l3.243 3.243 1.414-1.414L12 5.586l-6.657 6.758z" />
                </svg>
                Recent Alerts
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-neutral-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-neutral-500">No alerts at this time</p>
                    <p className="text-xs text-neutral-400">All tourists are safe</p>
                  </div>
                ) : (
                  alerts.slice(0, 10).map((alert) => (
                    <div
                      key={alert._id}
                      className="p-4 rounded-xl border border-neutral-200 cursor-pointer hover:shadow-medium transition-all duration-200 group"
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            alert.type === 'sos' ? 'bg-red-100' : 
                            alert.type === 'geofence_breach' ? 'bg-amber-100' : 'bg-purple-100'
                          }`}>
                            <span className="text-sm">{getAlertIcon(alert.type)}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-900 capitalize">{alert.type.replace('_', ' ')}</p>
                            <p className="text-xs text-neutral-600 font-mono">{alert.touristID}</p>
                            <p className="text-xs text-neutral-500 mt-1">{alert.message}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-neutral-500">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                            alert.status === 'pending' ? 'bg-red-100 text-red-700' : 'bg-accent-100 text-accent-700'
                          }`}>
                            {alert.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* System Statistics */}
            <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-6">
              <h3 className="font-display text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                System Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm font-medium text-neutral-700">Total Alerts</span>
                  <span className="text-lg font-bold text-neutral-900">{alerts.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-red-700">Pending Alerts</span>
                  <span className="text-lg font-bold text-red-600">{alerts.filter(a => a.status === 'pending').length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-accent-50 rounded-lg">
                  <span className="text-sm font-medium text-accent-700">Safe Zones</span>
                  <span className="text-lg font-bold text-accent-600">{safeZones.filter(z => z.type === 'safe').length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm font-medium text-amber-700">Restricted Zones</span>
                  <span className="text-lg font-bold text-amber-600">{safeZones.filter(z => z.type === 'restricted').length}</span>
                </div>
              </div>
            </div>

            {/* Alert Details */}
            {selectedAlert && (
              <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-6">
                <h3 className="font-display text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Alert Details
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm font-medium text-neutral-700 mb-1">Alert Type</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getAlertIcon(selectedAlert.type)}</span>
                      <span className="text-sm font-medium text-neutral-900 capitalize">{selectedAlert.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-700 mb-1">Tourist ID</p>
                      <p className="text-sm font-mono text-primary-600 bg-primary-50 px-2 py-1 rounded">{selectedAlert.touristID}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-neutral-700 mb-1">Location Coordinates</p>
                      <p className="text-xs font-mono text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                        {selectedAlert.location.lat.toFixed(6)}, {selectedAlert.location.lng.toFixed(6)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-neutral-700 mb-1">Message</p>
                      <p className="text-sm text-neutral-900 bg-neutral-100 p-3 rounded-lg">{selectedAlert.message}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-neutral-700 mb-1">Timestamp</p>
                      <p className="text-sm text-neutral-900">{new Date(selectedAlert.timestamp).toLocaleString()}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-neutral-700 mb-1">Status</p>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedAlert.status === 'pending' ? 'bg-red-100 text-red-700' : 'bg-accent-100 text-accent-700'
                      }`}>
                        {selectedAlert.status}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-neutral-200">
                    <button className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Mark as Resolved</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
