import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, MapPin, Users, Shield, AlertTriangle, Calendar, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface CheckIn {
  id: string;
  location: string;
  coordinates: { lat: number; lng: number };
  timestamp: string;
  status: 'safe' | 'concern' | 'emergency';
  message?: string;
  contacts_notified: string[];
}

interface ScheduledCheckIn {
  id: string;
  time: string;
  frequency: 'once' | 'daily' | 'hourly';
  enabled: boolean;
  contacts: string[];
}

export default function SafetyCheckins() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [scheduledCheckIns, setScheduledCheckIns] = useState<ScheduledCheckIn[]>([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    time: '',
    frequency: 'daily' as const,
    contacts: [] as string[]
  });

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        }
      );
    }

    // Load sample data
    setCheckIns([
      {
        id: '1',
        location: 'New Delhi Railway Station',
        coordinates: { lat: 28.6139, lng: 77.2090 },
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'safe',
        message: 'Arrived safely at platform 3',
        contacts_notified: ['Mom', 'Dad']
      },
      {
        id: '2',
        location: 'Connaught Place Metro',
        coordinates: { lat: 28.6315, lng: 77.2167 },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'safe',
        contacts_notified: ['Emergency Contact']
      }
    ]);

    setScheduledCheckIns([
      {
        id: '1',
        time: '20:00',
        frequency: 'daily',
        enabled: true,
        contacts: ['Mom', 'Dad', 'Emergency Contact']
      }
    ]);
  }, []);

  const handleQuickCheckIn = async (status: 'safe' | 'concern' | 'emergency', message?: string) => {
    if (!currentLocation) {
      toast.error('Location required for check-in');
      return;
    }

    const checkIn: CheckIn = {
      id: Date.now().toString(),
      location: 'Current Location', // In real app, reverse geocode
      coordinates: currentLocation,
      timestamp: new Date().toISOString(),
      status,
      message,
      contacts_notified: ['Emergency Contact']
    };

    setCheckIns([checkIn, ...checkIns]);
    
    if (status === 'emergency') {
      toast.error('Emergency check-in sent! Authorities notified.');
    } else if (status === 'concern') {
      toast.error('Concern reported. Contacts have been notified.');
    } else {
      toast.success('Safe check-in completed!');
    }
  };

  const handleScheduleCheckIn = () => {
    if (!newSchedule.time) {
      toast.error('Please select a time');
      return;
    }

    const schedule: ScheduledCheckIn = {
      id: Date.now().toString(),
      ...newSchedule,
      enabled: true
    };

    setScheduledCheckIns([...scheduledCheckIns, schedule]);
    setNewSchedule({ time: '', frequency: 'daily', contacts: [] });
    setShowScheduleForm(false);
    toast.success('Check-in scheduled successfully');
  };

  const toggleSchedule = (id: string) => {
    setScheduledCheckIns(scheduledCheckIns.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-100 border-green-200';
      case 'concern': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'emergency': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
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
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Safety Check-ins</h1>
                <p className="text-gray-600">Regular safety updates for peace of mind</p>
              </div>
            </div>
            <button
              onClick={() => setShowScheduleForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Schedule Check-in
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Quick Check-in Buttons */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Check-in</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleQuickCheckIn('safe', 'I am safe and secure')}
                className="p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="font-semibold text-green-900">I'm Safe</span>
                </div>
                <p className="text-green-700 text-sm">Send safe status to contacts</p>
              </button>

              <button
                onClick={() => handleQuickCheckIn('concern', 'I have some concerns about my safety')}
                className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  <span className="font-semibold text-yellow-900">Need Attention</span>
                </div>
                <p className="text-yellow-700 text-sm">Alert contacts about concerns</p>
              </button>

              <button
                onClick={() => handleQuickCheckIn('emergency', 'EMERGENCY - Need immediate help')}
                className="p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-6 h-6 text-red-600" />
                  <span className="font-semibold text-red-900">Emergency</span>
                </div>
                <p className="text-red-700 text-sm">Send emergency alert immediately</p>
              </button>
            </div>
          </div>

          {/* Scheduled Check-ins */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Check-ins</h2>
            <div className="space-y-3">
              {scheduledCheckIns.map((schedule) => (
                <div key={schedule.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {schedule.time} - {schedule.frequency}
                        </div>
                        <div className="text-sm text-gray-600">
                          Notifies: {schedule.contacts.join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        schedule.enabled ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                      }`}>
                        {schedule.enabled ? 'Active' : 'Disabled'}
                      </span>
                      <button
                        onClick={() => toggleSchedule(schedule.id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        {schedule.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Check-ins */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Check-ins</h2>
            <div className="space-y-3">
              {checkIns.map((checkIn) => (
                <div key={checkIn.id} className={`border rounded-lg p-4 ${getStatusColor(checkIn.status)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white bg-opacity-50 rounded-lg">
                        {checkIn.status === 'safe' && <CheckCircle className="w-5 h-5" />}
                        {checkIn.status === 'concern' && <AlertTriangle className="w-5 h-5" />}
                        {checkIn.status === 'emergency' && <Shield className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-semibold capitalize">{checkIn.status} Check-in</div>
                        {checkIn.message && (
                          <div className="text-sm opacity-90">{checkIn.message}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm opacity-75">
                      {formatTimeAgo(checkIn.timestamp)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm opacity-75">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {checkIn.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {checkIn.contacts_notified.length} contacts notified
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Check-in Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Schedule Check-in</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={newSchedule.time}
                  onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  value={newSchedule.frequency}
                  onChange={(e) => setNewSchedule({...newSchedule, frequency: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="once">Once</option>
                  <option value="daily">Daily</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowScheduleForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleCheckIn}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}