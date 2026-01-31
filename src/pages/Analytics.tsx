import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, MapPin, Calendar, Users, Train, Bus, Plane, Car, Zap } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface UserStats {
  bookings: {
    total: number;
    completed: number;
    completion_rate: number;
  };
  spending: {
    total_amount: number;
    average_booking: number;
  };
  social: {
    posts: number;
    likes_received: number;
  };
}

interface TransportUsage {
  usage_by_type: Array<{
    _id: string;
    count: number;
    total_spent: number;
  }>;
  monthly_trend: Array<{
    _id: string;
    bookings: number;
    amount: number;
  }>;
  recommendations: string[];
}

export default function Analytics() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [transportUsage, setTransportUsage] = useState<TransportUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsResponse, usageResponse] = await Promise.all([
        axios.get('http://localhost:8002/api/analytics/user-stats', { headers }),
        axios.get('http://localhost:8002/api/analytics/transport-usage', { headers })
      ]);

      setUserStats(statsResponse.data);
      setTransportUsage(usageResponse.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getTransportIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'train':
        return <Train className="h-5 w-5" />;
      case 'bus':
        return <Bus className="h-5 w-5" />;
      case 'flight':
        return <Plane className="h-5 w-5" />;
      case 'taxi':
        return <Car className="h-5 w-5" />;
      case 'metro':
        return <Zap className="h-5 w-5" />;
      default:
        return <MapPin className="h-5 w-5" />;
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your travel patterns and spending insights</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'transport', label: 'Transport Usage', icon: MapPin },
                { id: 'spending', label: 'Spending Analysis', icon: DollarSign },
                { id: 'social', label: 'Social Activity', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && userStats && (
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.bookings.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.bookings.completion_rate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">₹{userStats.spending.total_amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Social Posts</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.social.posts}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Travel Efficiency</h4>
                  <p className="text-sm text-gray-600">
                    Average booking value: ₹{userStats.spending.average_booking.toFixed(0)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Social engagement: {userStats.social.likes_received} likes received
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Book in advance for better prices</li>
                    <li>• Share travel experiences for community engagement</li>
                    <li>• Consider eco-friendly transport options</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transport Usage Tab */}
        {activeTab === 'transport' && transportUsage && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Transport Type Distribution */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Transport Type Usage</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={transportUsage.usage_by_type}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ _id, count }) => `${_id}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {transportUsage.usage_by_type.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Spending by Transport Type */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Spending by Transport Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={transportUsage.usage_by_type}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Amount Spent']} />
                    <Bar dataKey="total_spent" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transport Type Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Transport Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {transportUsage.usage_by_type.map((transport, index) => (
                  <div key={transport._id} className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="text-blue-600 mr-2">
                        {getTransportIcon(transport._id)}
                      </div>
                      <h4 className="font-medium capitalize">{transport._id}</h4>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Bookings: {transport.count}</p>
                      <p>Total Spent: ₹{transport.total_spent}</p>
                      <p>Avg per booking: ₹{(transport.total_spent / transport.count).toFixed(0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Personalized Recommendations</h3>
              <ul className="space-y-2">
                {transportUsage.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start text-blue-800">
                    <span className="text-blue-600 mr-2">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Monthly Trend */}
        {activeTab === 'spending' && transportUsage && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Spending Trend</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={transportUsage.monthly_trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'amount' ? `₹${value}` : value,
                    name === 'amount' ? 'Amount' : 'Bookings'
                  ]} />
                  <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="bookings" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Social Activity Tab */}
        {activeTab === 'social' && userStats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Social Engagement</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Posts</span>
                    <span className="font-bold text-xl">{userStats.social.posts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Likes Received</span>
                    <span className="font-bold text-xl">{userStats.social.likes_received}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Likes per Post</span>
                    <span className="font-bold text-xl">
                      {userStats.social.posts > 0 ? (userStats.social.likes_received / userStats.social.posts).toFixed(1) : '0'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Community Impact</h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Your travel posts inspire others in the community to explore new destinations and transport options.
                  </p>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      Keep sharing your travel experiences to help fellow travelers!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
