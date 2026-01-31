import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, Shield, Plus, Filter, Eye } from 'lucide-react';
import SafetyMap from '../components/Map/SafetyMap';
import axios from 'axios';
import toast from 'react-hot-toast';

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

const SafetyMapPage: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [dangerLocations, setDangerLocations] = useState<DangerLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<DangerLocation[]>([]);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showReportForm, setShowReportForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Report form state
  const [reportForm, setReportForm] = useState({
    name: '',
    description: '',
    latitude: 0,
    longitude: 0,
    risk_level: 'medium',
    category: 'general'
  });

  useEffect(() => {
    getCurrentLocation();
    fetchDangerLocations();
  }, []);

  useEffect(() => {
    filterLocations();
  }, [dangerLocations, selectedRiskLevel, selectedCategory]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
          // Default to Delhi if location access denied
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    }
  };

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

  const filterLocations = () => {
    let filtered = dangerLocations;

    if (selectedRiskLevel !== 'all') {
      filtered = filtered.filter(location => location.risk_level === selectedRiskLevel);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(location => location.category === selectedCategory);
    }

    setFilteredLocations(filtered);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/danger-locations`, reportForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Danger location reported successfully!');
      setShowReportForm(false);
      setReportForm({
        name: '',
        description: '',
        latitude: 0,
        longitude: 0,
        risk_level: 'medium',
        category: 'general'
      });
      fetchDangerLocations();
    } catch (error) {
      console.error('Error reporting danger location:', error);
      toast.error('Failed to report danger location');
    }
  };

  const handleMapClick = (coords: [number, number]) => {
    if (showReportForm) {
      setReportForm(prev => ({
        ...prev,
        latitude: coords[0],
        longitude: coords[1]
      }));
      toast.success('Location selected for report');
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      case 'critical': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const categories = ['general', 'crime', 'accident', 'natural_disaster', 'construction', 'protest', 'other'];
  const riskLevels = ['low', 'medium', 'high', 'critical'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Safety Map</h1>
              <p className="text-red-100">Real-time danger zones and safety information</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{dangerLocations.length}</div>
                <div className="text-sm text-red-100">Total Locations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{dangerLocations.filter(l => l.verified).length}</div>
                <div className="text-sm text-red-100">Verified</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h3>
              
              {/* Risk Level Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
                <select
                  value={selectedRiskLevel}
                  onChange={(e) => setSelectedRiskLevel(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  {riskLevels.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.replace('_', ' ').charAt(0).toUpperCase() + category.replace('_', ' ').slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Report Button */}
              <button
                onClick={() => setShowReportForm(!showReportForm)}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  showReportForm 
                    ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                <Plus className="w-4 h-4 mr-2" />
                {showReportForm ? 'Cancel Report' : 'Report Danger'}
              </button>
            </div>

            {/* Report Form */}
            {showReportForm && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Danger Location</h3>
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={reportForm.name}
                      onChange={(e) => setReportForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Location name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      required
                      value={reportForm.description}
                      onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Describe the danger..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                    <select
                      value={reportForm.risk_level}
                      onChange={(e) => setReportForm(prev => ({ ...prev, risk_level: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {riskLevels.map(level => (
                        <option key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={reportForm.category}
                      onChange={(e) => setReportForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.replace('_', ' ').charAt(0).toUpperCase() + category.replace('_', ' ').slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-sm text-gray-600">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Click on the map to select location
                  </div>

                  <button
                    type="submit"
                    disabled={!reportForm.latitude || !reportForm.longitude}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Submit Report
                  </button>
                </form>
              </div>
            )}

            {/* Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Statistics
              </h3>
              <div className="space-y-3">
                {riskLevels.map(level => {
                  const count = dangerLocations.filter(l => l.risk_level === level).length;
                  return (
                    <div key={level} className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(level)}`}>
                        {level.toUpperCase()}
                      </span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Interactive Safety Map</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Showing {filteredLocations.length} locations</span>
                </div>
              </div>
              
              <SafetyMap
                userLocation={userLocation || undefined}
                height="600px"
                showUserLocation={true}
                onLocationSelect={handleMapClick}
              />
              
              {showReportForm && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center text-blue-700">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    <span className="text-sm">Click on the map to select the danger location coordinates</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyMapPage;
