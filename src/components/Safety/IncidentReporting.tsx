import React, { useState, useEffect } from 'react';
import { AlertTriangle, Camera, MapPin, Clock, User, FileText, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Incident {
  id: string;
  type: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'resolved';
  timestamp: string;
  reportedBy: string;
  images?: string[];
}

export default function IncidentReporting() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [newIncident, setNewIncident] = useState({
    type: '',
    description: '',
    severity: 'medium' as const,
    images: [] as string[]
  });

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          toast.error('Location access required for incident reporting');
        }
      );
    }

    // Load sample incidents
    setIncidents([
      {
        id: '1',
        type: 'Theft',
        description: 'Pickpocketing incident near platform 3',
        location: {
          lat: 28.6139,
          lng: 77.2090,
          address: 'New Delhi Railway Station, Platform 3'
        },
        severity: 'high',
        status: 'investigating',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        reportedBy: 'Anonymous User'
      },
      {
        id: '2',
        type: 'Harassment',
        description: 'Verbal harassment in ladies compartment',
        location: {
          lat: 28.6129,
          lng: 77.2295,
          address: 'Rajiv Chowk Metro Station'
        },
        severity: 'critical',
        status: 'reported',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        reportedBy: 'Verified User'
      }
    ]);
  }, []);

  const handleSubmitIncident = async () => {
    if (!newIncident.type || !newIncident.description) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!userLocation) {
      toast.error('Location is required for incident reporting');
      return;
    }

    const incident: Incident = {
      id: Date.now().toString(),
      ...newIncident,
      location: {
        ...userLocation,
        address: 'Current Location' // In real app, reverse geocode this
      },
      status: 'reported',
      timestamp: new Date().toISOString(),
      reportedBy: 'Current User'
    };

    setIncidents([incident, ...incidents]);
    setNewIncident({
      type: '',
      description: '',
      severity: 'medium',
      images: []
    });
    setShowReportForm(false);
    toast.success('Incident reported successfully. Authorities have been notified.');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'text-blue-600 bg-blue-100';
      case 'investigating': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
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
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Incident Reporting</h1>
                <p className="text-gray-600">Report safety incidents and track their status</p>
              </div>
            </div>
            <button
              onClick={() => setShowReportForm(true)}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              Report Incident
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Recent Incidents */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Incidents</h2>
            {incidents.map((incident) => (
              <div key={incident.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{incident.type}</h3>
                      <p className="text-gray-600 text-sm">{incident.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                      {incident.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {incident.location.address}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTimeAgo(incident.timestamp)}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {incident.reportedBy}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Incident Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Report Safety Incident</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Incident Type *</label>
                <select
                  value={newIncident.type}
                  onChange={(e) => setNewIncident({...newIncident, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select incident type</option>
                  <option value="Theft">Theft</option>
                  <option value="Harassment">Harassment</option>
                  <option value="Violence">Violence</option>
                  <option value="Suspicious Activity">Suspicious Activity</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Infrastructure Issue">Infrastructure Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity Level *</label>
                <select
                  value={newIncident.severity}
                  onChange={(e) => setNewIncident({...newIncident, severity: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="low">Low - Minor issue</option>
                  <option value="medium">Medium - Moderate concern</option>
                  <option value="high">High - Serious issue</option>
                  <option value="critical">Critical - Immediate attention required</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Provide detailed description of the incident..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">Location Information</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  {userLocation ? 
                    `Your current location will be automatically included with this report.` :
                    'Please enable location access to include location data with your report.'
                  }
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Important Notice</span>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  For immediate emergencies, please call emergency services directly. This report will be reviewed by authorities within 24 hours.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReportForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitIncident}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}