import React, { useState } from 'react';
import { Search, Train, Clock, MapPin, Calendar, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface TrainSchedule {
  trainNumber: string;
  trainName: string;
  type: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  frequency: string;
  classes: string[];
  status: 'on-time' | 'delayed' | 'cancelled';
  delay?: number;
}

const TrainSchedule: React.FC = () => {
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [trainType, setTrainType] = useState('all');
  const [schedules, setSchedules] = useState<TrainSchedule[]>([]);
  const [loading, setLoading] = useState(false);

  const stations = [
    'New Delhi (NDLS)', 'Mumbai Central (BCT)', 'Chennai Central (MAS)',
    'Kolkata (HWH)', 'Bangalore City (SBC)', 'Hyderabad (HYB)',
    'Pune Junction (PUNE)', 'Ahmedabad (ADI)', 'Jaipur (JP)', 'Lucknow (LKO)'
  ];

  const mockSchedules: TrainSchedule[] = [
    {
      trainNumber: '12951',
      trainName: 'Mumbai Rajdhani Express',
      type: 'Rajdhani',
      from: 'New Delhi (NDLS)',
      to: 'Mumbai Central (BCT)',
      departure: '16:35',
      arrival: '08:35+1',
      duration: '16h 00m',
      frequency: 'Daily',
      classes: ['1A', '2A', '3A'],
      status: 'on-time'
    },
    {
      trainNumber: '12301',
      trainName: 'Howrah Rajdhani Express',
      type: 'Rajdhani',
      from: 'New Delhi (NDLS)',
      to: 'Howrah Junction (HWH)',
      departure: '17:00',
      arrival: '09:55+1',
      duration: '16h 55m',
      frequency: 'Daily',
      classes: ['1A', '2A', '3A'],
      status: 'delayed',
      delay: 45
    },
    {
      trainNumber: '12423',
      trainName: 'Dibrugarh Rajdhani Express',
      type: 'Rajdhani',
      from: 'New Delhi (NDLS)',
      to: 'Dibrugarh (DBRG)',
      departure: '21:30',
      arrival: '18:05+2',
      duration: '44h 35m',
      frequency: 'Weekly',
      classes: ['1A', '2A', '3A'],
      status: 'on-time'
    },
    {
      trainNumber: '12002',
      trainName: 'Bhopal Shatabdi Express',
      type: 'Shatabdi',
      from: 'New Delhi (NDLS)',
      to: 'Bhopal Junction (BPL)',
      departure: '06:15',
      arrival: '13:45',
      duration: '7h 30m',
      frequency: 'Daily except Sunday',
      classes: ['CC', 'EC'],
      status: 'on-time'
    },
    {
      trainNumber: '12019',
      trainName: 'Howrah Shatabdi Express',
      type: 'Shatabdi',
      from: 'New Delhi (NDLS)',
      to: 'Howrah Junction (HWH)',
      departure: '06:00',
      arrival: '22:05',
      duration: '16h 05m',
      frequency: 'Daily except Friday',
      classes: ['CC', 'EC'],
      status: 'on-time'
    },
    {
      trainNumber: '12626',
      trainName: 'Kerala Express',
      type: 'Express',
      from: 'New Delhi (NDLS)',
      to: 'Thiruvananthapuram (TVC)',
      departure: '11:00',
      arrival: '11:05+2',
      duration: '48h 05m',
      frequency: 'Daily',
      classes: ['SL', '3A', '2A', '1A'],
      status: 'on-time'
    }
  ];

  const handleSearch = async () => {
    if (!fromStation || !toStation) {
      toast.error('Please select both departure and destination stations');
      return;
    }

    if (fromStation === toStation) {
      toast.error('Departure and destination stations cannot be the same');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let results = mockSchedules.filter(schedule => {
        const matchesRoute = schedule.from.includes(fromStation.split('(')[0]) || 
                           schedule.to.includes(toStation.split('(')[0]);
        const matchesType = trainType === 'all' || schedule.type.toLowerCase() === trainType;
        return matchesRoute && matchesType;
      });

      setSchedules(results);
      setLoading(false);
      
      if (results.length === 0) {
        toast.error('No trains found for the selected route');
      } else {
        toast.success(`Found ${results.length} train(s)`);
      }
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'text-green-600 bg-green-50';
      case 'delayed':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-neutral-600 bg-neutral-50';
    }
  };

  const getTrainTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'rajdhani':
        return 'bg-red-100 text-red-800';
      case 'shatabdi':
        return 'bg-blue-100 text-blue-800';
      case 'duronto':
        return 'bg-purple-100 text-purple-800';
      case 'express':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-neutral-900 mb-4">
            Train Schedule
          </h1>
          <p className="text-lg text-neutral-600">
            Check train timings and schedules between stations
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                From Station
              </label>
              <select
                value={fromStation}
                onChange={(e) => setFromStation(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select departure station</option>
                {stations.map(station => (
                  <option key={station} value={station}>{station}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                To Station
              </label>
              <select
                value={toStation}
                onChange={(e) => setToStation(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select destination station</option>
                {stations.map(station => (
                  <option key={station} value={station}>{station}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <Filter className="inline w-4 h-4 mr-1" />
                Train Type
              </label>
              <select
                value={trainType}
                onChange={(e) => setTrainType(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="rajdhani">Rajdhani</option>
                <option value="shatabdi">Shatabdi</option>
                <option value="duronto">Duronto</option>
                <option value="express">Express</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </div>
                ) : (
                  <>
                    <Search className="inline w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {schedules.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900">
                Train Schedule ({schedules.length} trains)
              </h2>
              <div className="text-sm text-neutral-600">
                Date: {new Date(selectedDate).toLocaleDateString()}
              </div>
            </div>

            {schedules.map((train) => (
              <div key={train.trainNumber} className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <Train className="w-6 h-6 text-primary-600 mr-3" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-neutral-900">
                            {train.trainName} ({train.trainNumber})
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrainTypeColor(train.type)}`}>
                            {train.type}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(train.status)}`}>
                            {train.status === 'delayed' && train.delay ? `Delayed by ${train.delay}m` : train.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-neutral-600">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{train.duration} • {train.frequency}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neutral-900">{train.departure}</div>
                        <div className="text-sm text-neutral-600">{train.from.split('(')[0]}</div>
                        <div className="text-xs text-neutral-500">{train.from.match(/\(([^)]+)\)/)?.[1]}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <div className="flex-1 h-px bg-neutral-300"></div>
                          <div className="px-3 text-sm font-medium text-neutral-600">{train.duration}</div>
                          <div className="flex-1 h-px bg-neutral-300"></div>
                        </div>
                        <div className="text-xs text-neutral-500">Non-stop</div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-neutral-900">{train.arrival}</div>
                        <div className="text-sm text-neutral-600">{train.to.split('(')[0]}</div>
                        <div className="text-xs text-neutral-500">{train.to.match(/\(([^)]+)\)/)?.[1]}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-neutral-700">Available Classes: </span>
                        <div className="flex space-x-2 mt-1">
                          {train.classes.map((cls, index) => (
                            <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded">
                              {cls}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:ml-6 mt-4 lg:mt-0">
                    <button className="w-full lg:w-auto bg-accent-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-accent-700 transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Popular Routes */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mt-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Popular Routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { from: 'Delhi', to: 'Mumbai', trains: 25 },
              { from: 'Delhi', to: 'Kolkata', trains: 18 },
              { from: 'Mumbai', to: 'Chennai', trains: 12 },
              { from: 'Delhi', to: 'Bangalore', trains: 15 },
              { from: 'Mumbai', to: 'Kolkata', trains: 8 },
              { from: 'Chennai', to: 'Bangalore', trains: 22 }
            ].map((route, index) => (
              <button
                key={index}
                onClick={() => {
                  const fromStn = stations.find(s => s.includes(route.from));
                  const toStn = stations.find(s => s.includes(route.to));
                  if (fromStn && toStn) {
                    setFromStation(fromStn);
                    setToStation(toStn);
                  }
                }}
                className="p-4 border border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
              >
                <div className="font-semibold text-neutral-900">{route.from} → {route.to}</div>
                <div className="text-sm text-neutral-600">{route.trains} trains daily</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainSchedule;
