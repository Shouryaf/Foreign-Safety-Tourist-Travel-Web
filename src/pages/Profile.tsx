import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Wallet, Globe, Plus, CreditCard, Smartphone, History, LogOut } from 'lucide-react';
import CurrencyConverter from '../components/CurrencyConverter/CurrencyConverter';

interface ProfileProps {
  user: any;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: null as { latitude: number; longitude: number } | null,
    preferences: {
      transport_modes: [] as string[],
      notifications: true,
      location_sharing: false
    },
    social_stats: {
      posts: 0,
      followers: 0,
      following: 0
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Wallet state
  const [walletData, setWalletData] = useState({
    balance: 2500.75,
    transactions: [
      {
        id: '1',
        type: 'credit' as const,
        amount: 500,
        description: 'Added money via UPI',
        date: new Date().toISOString(),
        status: 'completed' as const
      },
      {
        id: '2',
        type: 'debit' as const,
        amount: 150,
        description: 'Bus booking payment',
        date: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed' as const
      }
    ]
  });
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showCurrencyConverter, setShowCurrencyConverter] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [processingTransaction, setProcessingTransaction] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      // Since we don't have a specific profile endpoint, we'll use the stored user data
      // and enhance it with additional profile information
      setProfileData(prev => ({
        ...prev,
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Update location if available
      if (profileData.location) {
        await axios.post('http://localhost:8002/api/location/update', profileData.location, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Update localStorage with new user data
      const updatedUser = {
        ...user,
        name: profileData.name,
        phone: profileData.phone
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
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
          setProfileData(prev => ({ ...prev, location }));
          toast.success('Location updated successfully!');
        },
        (error) => {
          toast.error('Location access denied');
        }
      );
    } else {
      toast.error('Geolocation not supported by this browser');
    }
  };

  const toggleTransportMode = (mode: string) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        transport_modes: prev.preferences.transport_modes.includes(mode)
          ? prev.preferences.transport_modes.filter(m => m !== mode)
          : [...prev.preferences.transport_modes, mode]
      }
    }));
  };

  // Wallet functions
  const handleAddMoney = async () => {
    if (!addMoneyAmount || parseFloat(addMoneyAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setProcessingTransaction(true);
    try {
      const amount = parseFloat(addMoneyAmount);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update wallet balance and add transaction
      setWalletData(prev => ({
        ...prev,
        balance: prev.balance + amount,
        transactions: [
          {
            id: Date.now().toString(),
            type: 'credit',
            amount: amount,
            description: `Added money via Credit Card`,
            date: new Date().toISOString(),
            status: 'completed'
          },
          ...prev.transactions
        ]
      }));
      
      toast.success(`₹${amount} added to wallet successfully!`);
      setAddMoneyAmount('');
      
      setTimeout(() => {
        setShowAddMoney(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding money:', error);
      toast.error('Failed to add money to wallet');
    } finally {
      setProcessingTransaction(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully!');
    navigate('/auth');
  };

  const handleCurrencyConversion = (amount: number, fromCurrency: string, toCurrency: string, convertedAmount: number) => {
    if (toCurrency === 'INR') {
      // Add converted amount to wallet
      setWalletData(prev => ({
        ...prev,
        balance: prev.balance + convertedAmount,
        transactions: [
          {
            id: Date.now().toString(),
            type: 'credit',
            amount: convertedAmount,
            description: `Currency Conversion: ${amount} ${fromCurrency} → ₹${convertedAmount.toFixed(2)}`,
            date: new Date().toISOString(),
            status: 'completed'
          },
          ...prev.transactions
        ]
      }));
      toast.success(`₹${convertedAmount.toFixed(2)} added to wallet from ${fromCurrency} conversion!`);
      setShowCurrencyConverter(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const transportModes = [
    { value: 'train', label: 'Train', icon: '🚂' },
    { value: 'bus', label: 'Bus', icon: '🚌' },
    { value: 'flight', label: 'Flight', icon: '✈️' },
    { value: 'taxi', label: 'Taxi', icon: '🚕' },
    { value: 'metro', label: 'Metro', icon: '🚇' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profileData.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                <p className="text-gray-600">{profileData.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Social Stats */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{profileData.social_stats.posts}</p>
              <p className="text-sm text-gray-600">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{profileData.social_stats.followers}</p>
              <p className="text-sm text-gray-600">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{profileData.social_stats.following}</p>
              <p className="text-sm text-gray-600">Following</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Personal Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="p-3 bg-gray-50 rounded-lg">{profileData.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <p className="p-3 bg-gray-50 rounded-lg text-gray-600">{profileData.email}</p>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="p-3 bg-gray-50 rounded-lg">{profileData.phone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    {profileData.location ? (
                      <p className="p-3 bg-gray-50 rounded-lg text-sm">
                        {profileData.location.latitude.toFixed(4)}, {profileData.location.longitude.toFixed(4)}
                      </p>
                    ) : (
                      <p className="p-3 bg-gray-50 rounded-lg text-gray-500">Location not set</p>
                    )}
                  </div>
                  <button
                    onClick={requestLocationPermission}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Update Location
                  </button>
                </div>
              </div>
            </div>

              {isEditing && (
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateProfile}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* Transport Preferences */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Transport Preferences</h2>
              
              <div className="space-y-3">
                {transportModes.map((mode) => (
                  <label key={mode.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileData.preferences.transport_modes.includes(mode.value)}
                      onChange={() => toggleTransportMode(mode.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-xl">{mode.icon}</span>
                    <span className="font-medium text-gray-900">{mode.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Wallet & Settings */}
          <div className="space-y-8">
            {/* E-Wallet Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-blue-600" />
                  E-Wallet
                </h2>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Current Balance</p>
                  <p className="text-2xl font-bold text-green-600">₹{walletData.balance.toFixed(2)}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 gap-3 mb-6">
                <button
                  onClick={() => setShowAddMoney(true)}
                  className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <Plus className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-700">Add Money</span>
                </button>
                
                <button
                  onClick={() => setShowCurrencyConverter(true)}
                  className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
                >
                  <Globe className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-gray-700">Convert Currency</span>
                </button>
              </div>

              {/* Recent Transactions */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Recent Transactions
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {walletData.transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                      </div>
                      <div className={`text-sm font-semibold ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Privacy Settings</h2>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-600">Receive notifications about bookings and updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileData.preferences.notifications}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, notifications: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Location Sharing</p>
                    <p className="text-sm text-gray-600">Share your location with friends and for better recommendations</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileData.preferences.location_sharing}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, location_sharing: e.target.checked }
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Account Actions</h2>
              
              <div className="space-y-3">
                <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900">Change Password</p>
                  <p className="text-sm text-gray-600">Update your account password</p>
                </button>

                <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900">Download Data</p>
                  <p className="text-sm text-gray-600">Export your account data</p>
                </button>

                <button 
                  onClick={handleLogout}
                  className="w-full p-3 text-left border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-blue-600 flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Logout</p>
                    <p className="text-sm">Sign out of your account</p>
                  </div>
                </button>

                <button className="w-full p-3 text-left border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600">
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm">Permanently delete your account and all data</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Add Money Modal */}
        {showAddMoney && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">Add Money</h3>
                  <button
                    onClick={() => setShowAddMoney(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-gray-600 mt-2">Add money to your wallet for seamless payments</p>
              </div>
              
              <div className="p-6">
                {/* Amount Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    value={addMoneyAmount}
                    onChange={(e) => setAddMoneyAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Quick Select</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 2000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setAddMoneyAmount(amount.toString())}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors text-sm font-medium"
                      >
                        ₹{amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Payment Method</h4>
                  <div className="space-y-2">
                    <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                      <CreditCard className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="text-sm">Credit/Debit Card</span>
                    </div>
                    <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                      <Smartphone className="w-5 h-5 text-green-600 mr-3" />
                      <span className="text-sm">UPI</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowAddMoney(false)}
                    className="flex-1 py-3 px-6 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMoney}
                    disabled={processingTransaction || !addMoneyAmount}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {processingTransaction ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      'Add Money'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Currency Converter Modal */}
        {showCurrencyConverter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">Currency Converter</h3>
                  <button
                    onClick={() => setShowCurrencyConverter(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-gray-600 mt-2">Convert foreign currency and add INR to your wallet</p>
              </div>
              <div className="p-6">
                <CurrencyConverter 
                  onConvert={handleCurrencyConversion}
                  showAddToWallet={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
