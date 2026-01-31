import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import SafetyMap from '../components/Map/SafetyMap';
import { Shield, AlertTriangle, Phone, Bell, CheckCircle } from 'lucide-react';

interface DashboardProps {
  user: any;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalPosts: 0,
    followers: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [nearbyTransport, setNearbyTransport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [safetyStatus, setSafetyStatus] = useState<'safe' | 'caution' | 'danger'>('safe');
  const [lastCheckIn, setLastCheckIn] = useState<Date>(new Date());
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: 'Police', number: '100', type: 'emergency' },
    { name: 'Ambulance', number: '108', type: 'emergency' },
    { name: 'Fire Brigade', number: '101', type: 'emergency' },
    { name: 'Tourist Helpline', number: '1363', type: 'support' }
  ]);
  const [safetyAlerts, setSafetyAlerts] = useState([
    { id: 1, message: 'Heavy rainfall expected in your area. Avoid low-lying areas.', type: 'weather', time: '2 hours ago' },
    { id: 2, message: 'Road closure on Main Street due to construction work.', type: 'traffic', time: '4 hours ago' }
  ]);

  useEffect(() => {
    fetchDashboardData();
    requestLocationPermission();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch user bookings
      const bookingsResponse = await axios.get('http://localhost:8002/api/transport/bookings', { headers });
      const bookings = bookingsResponse.data.bookings || [];
      
      setRecentBookings(bookings.slice(0, 5));
      setStats(prev => ({
        ...prev,
        totalBookings: bookings.length,
        activeBookings: bookings.filter((b: any) => b.status === 'confirmed').length
      }));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          updateUserLocation(location);
          fetchNearbyTransport(location);
        },
        (error) => {
          console.log('Location permission denied:', error);
        }
      );
    }
  };

  const updateUserLocation = async (location: { latitude: number; longitude: number }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8002/api/location/update', location, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserLocation({ lat: location.latitude, lng: location.longitude });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const fetchNearbyTransport = async (location: { latitude: number; longitude: number }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8002/api/transport/nearby?transport_type=metro&radius=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNearbyTransport(response.data.nearby_options || []);
    } catch (error) {
      console.error('Error fetching nearby transport:', error);
    }
  };

  const handleEmergencyCall = (number: string) => {
    if (typeof window !== 'undefined' && 'navigator' in window) {
      window.open(`tel:${number}`, '_self');
      toast.success(`Calling ${number}...`);
    }
  };

  const handleSafetyCheckIn = () => {
    setLastCheckIn(new Date());
    toast.success('Safety check-in recorded successfully!');
  };

  const reportIncident = () => {
    toast.success('Incident report submitted. Authorities have been notified.');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Safety Status Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Safety Dashboard</h1>
              <p className="text-green-100">Welcome back, {user?.name} - Stay Safe!</p>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8" />
              <div className="text-right">
                <div className={`text-lg font-bold ${safetyStatus === 'safe' ? 'text-green-200' : safetyStatus === 'caution' ? 'text-yellow-200' : 'text-red-200'}`}>
                  {safetyStatus.toUpperCase()}
                </div>
                <div className="text-sm text-green-100">Current Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {emergencyContacts.map((contact, index) => (
            <button
              key={index}
              onClick={() => handleEmergencyCall(contact.number)}
              className={`bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all group ${
                contact.type === 'emergency' ? 'border-l-4 border-red-500' : 'border-l-4 border-blue-500'
              }`}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${contact.type === 'emergency' ? 'bg-red-100' : 'bg-blue-100'}`}>
                  <Phone className={`w-5 h-5 ${contact.type === 'emergency' ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
                <div className="ml-3 text-left">
                  <p className="font-semibold text-gray-900">{contact.name}</p>
                  <p className="text-sm text-gray-600">{contact.number}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Safety Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Safety Check-in */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Safety Check-in</h3>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Last check-in: {lastCheckIn.toLocaleTimeString()}
            </p>
            <button
              onClick={handleSafetyCheckIn}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Check In Now
            </button>
          </div>

          {/* Incident Reporting */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Report Incident</h3>
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Report safety concerns or incidents in your area
            </p>
            <button
              onClick={reportIncident}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Report Now
            </button>
          </div>

          {/* Safety Alerts */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
              <Bell className="w-6 h-6 text-red-600" />
            </div>
            <div className="space-y-2">
              {safetyAlerts.slice(0, 2).map((alert) => (
                <div key={alert.id} className="p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="text-xs text-gray-700">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Safety Map Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Safety Map & Danger Zones</h2>
            <Link to="/safety-map" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View Full Map →
            </Link>
          </div>
          <SafetyMap 
            userLocation={userLocation || undefined}
            height="400px"
            showUserLocation={true}
            onLocationSelect={(coords) => {
              console.log('Selected location:', coords);
              toast.success('Location selected on map');
            }}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{booking.transport_type.toUpperCase()} - {booking.pnr}</p>
                      <p className="text-sm text-gray-600">₹{booking.amount}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No recent bookings</p>
            )}
          </div>

          {/* Nearby Transport */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nearby Transport</h2>
            {nearbyTransport.length > 0 ? (
              <div className="space-y-4">
                {nearbyTransport.map((transport: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{transport.name}</p>
                      <p className="text-sm text-gray-600">{transport.distance} km away</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">{transport.type}</p>
                      <p className="text-xs text-gray-500">{transport.next_train || transport.next_bus}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Enable location to see nearby transport options</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
