import React, { useState, useEffect } from 'react';
import { Camera, Eye, MapPin, Shield, AlertTriangle, Play, Pause, Maximize, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface CCTVCamera {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  status: 'online' | 'offline' | 'maintenance';
  type: 'security' | 'traffic' | 'public';
  quality: 'HD' | '4K' | 'SD';
  isRecording: boolean;
  lastUpdate: string;
}

interface SecurityAlert {
  id: string;
  cameraId: string;
  type: 'motion_detected' | 'suspicious_activity' | 'crowd_gathering' | 'vehicle_incident';
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export default function CCTVMonitoring() {
  const [cameras, setCameras] = useState<CCTVCamera[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [isLiveView, setIsLiveView] = useState(false);
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');

  useEffect(() => {
    // Load sample CCTV data
    setCameras([
      {
        id: '1',
        name: 'Platform 1 - Main Entrance',
        location: 'New Delhi Railway Station',
        coordinates: { lat: 28.6139, lng: 77.2090 },
        status: 'online',
        type: 'security',
        quality: '4K',
        isRecording: true,
        lastUpdate: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Connaught Place Metro - Entry',
        location: 'Connaught Place',
        coordinates: { lat: 28.6315, lng: 77.2167 },
        status: 'online',
        type: 'public',
        quality: 'HD',
        isRecording: true,
        lastUpdate: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        name: 'Karol Bagh Market - Main Road',
        location: 'Karol Bagh',
        coordinates: { lat: 28.6519, lng: 77.1909 },
        status: 'offline',
        type: 'traffic',
        quality: 'HD',
        isRecording: false,
        lastUpdate: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        name: 'India Gate - Tourist Area',
        location: 'India Gate',
        coordinates: { lat: 28.6129, lng: 77.2295 },
        status: 'online',
        type: 'public',
        quality: '4K',
        isRecording: true,
        lastUpdate: new Date(Date.now() - 2 * 60 * 1000).toISOString()
      }
    ]);

    setAlerts([
      {
        id: '1',
        cameraId: '1',
        type: 'suspicious_activity',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        severity: 'medium',
        description: 'Unattended bag detected near platform entrance'
      },
      {
        id: '2',
        cameraId: '4',
        type: 'crowd_gathering',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        severity: 'low',
        description: 'Large crowd gathering detected at tourist spot'
      }
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCameraTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="w-4 h-4" />;
      case 'traffic': return <Camera className="w-4 h-4" />;
      case 'public': return <Eye className="w-4 h-4" />;
      default: return <Camera className="w-4 h-4" />;
    }
  };

  const handleViewCamera = (cameraId: string) => {
    setSelectedCamera(cameraId);
    setIsLiveView(true);
    toast.success('Connecting to live feed...');
  };

  const handleDownloadFootage = (cameraId: string) => {
    toast.success('Footage download request submitted');
  };

  const filteredCameras = cameras.filter(camera => {
    if (filter === 'all') return true;
    return camera.status === filter;
  });

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Camera className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CCTV Monitoring</h1>
                <p className="text-gray-600">Real-time surveillance and security monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Cameras</option>
                <option value="online">Online Only</option>
                <option value="offline">Offline Only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Camera Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredCameras.map((camera) => (
              <div key={camera.id} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                {/* Camera Preview */}
                <div className="relative bg-gray-900 h-48 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <div className="text-sm opacity-75">
                      {camera.status === 'online' ? 'Live Feed' : 'No Signal'}
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(camera.status)}`}>
                    {camera.status.toUpperCase()}
                  </div>
                  
                  {/* Recording Indicator */}
                  {camera.isRecording && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      REC
                    </div>
                  )}
                </div>

                {/* Camera Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{camera.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        {camera.location}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {getCameraTypeIcon(camera.type)}
                      <span className="text-xs text-gray-500 capitalize">{camera.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>Quality: {camera.quality}</span>
                    <span>Updated: {formatTimeAgo(camera.lastUpdate)}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewCamera(camera.id)}
                      disabled={camera.status !== 'online'}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      <Play className="w-3 h-3" />
                      View Live
                    </button>
                    <button
                      onClick={() => handleDownloadFootage(camera.id)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Security Alerts */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Alerts</h2>
            <div className="space-y-3">
              {alerts.map((alert) => {
                const camera = cameras.find(c => c.id === alert.cameraId);
                return (
                  <div key={alert.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 capitalize">
                            {alert.type.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-600">{alert.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(alert.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    {camera && (
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Camera className="w-4 h-4" />
                          {camera.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {camera.location}
                        </div>
                        <button
                          onClick={() => handleViewCamera(camera.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Camera
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Live View Modal */}
      {isLiveView && selectedCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl mx-4 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Live Feed - {cameras.find(c => c.id === selectedCamera)?.name}
              </h2>
              <button
                onClick={() => setIsLiveView(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="bg-gray-900 h-96 flex items-center justify-center">
              <div className="text-white text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <div className="text-lg mb-2">Live Camera Feed</div>
                <div className="text-sm opacity-75">Streaming in real-time</div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                <Pause className="w-4 h-4" />
                Pause
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                <Maximize className="w-4 h-4" />
                Fullscreen
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4" />
                Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}