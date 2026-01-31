import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, CreditCard, Train, ArrowRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface TrainBookingProps {
  user: any;
}

interface TrainService {
  id: string;
  name: string;
  number: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: string;
  distance: string;
  trainType: string;
  classes: {
    name: string;
    price: number;
    availableSeats: number;
  }[];
  daysOfOperation: string[];
}

interface Passenger {
  name: string;
  age: string;
  gender: string;
}

const TrainBooking: React.FC<TrainBookingProps> = ({ user }) => {
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    date: '',
    passengers: 1,
    class: 'SL'
  });
  
  const [availableTrains, setAvailableTrains] = useState<TrainService[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState<TrainService | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('SL');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [passengerDetails, setPassengerDetails] = useState<Passenger[]>([
    { name: '', age: '', gender: 'male' }
  ]);

  // Pre-built train data
  const preBuiltTrains: TrainService[] = [
    {
      id: '12301',
      name: 'Rajdhani Express',
      number: '12301',
      origin: 'New Delhi (NDLS)',
      destination: 'Howrah Jn (HWH)',
      departure: '16:55',
      arrival: '10:05+1',
      duration: '17h 10m',
      distance: '1441 km',
      trainType: 'Rajdhani',
      classes: [
        { name: '1A', price: 3500, availableSeats: 18 },
        { name: '2A', price: 2100, availableSeats: 54 },
        { name: '3A', price: 1500, availableSeats: 64 }
      ],
      daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    {
      id: '12002',
      name: 'Shatabdi Express',
      number: '12002',
      origin: 'New Delhi (NDLS)',
      destination: 'Kalka (KLK)',
      departure: '07:40',
      arrival: '12:30',
      duration: '4h 50m',
      distance: '308 km',
      trainType: 'Shatabdi',
      classes: [
        { name: 'CC', price: 690, availableSeats: 78 },
        { name: 'EC', price: 1365, availableSeats: 20 }
      ],
      daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    {
      id: '12622',
      name: 'Tamil Nadu Express',
      number: '12622',
      origin: 'New Delhi (NDLS)',
      destination: 'Chennai Central (MAS)',
      departure: '22:30',
      arrival: '04:25+2',
      duration: '29h 55m',
      distance: '2180 km',
      trainType: 'Mail/Express',
      classes: [
        { name: 'SL', price: 665, availableSeats: 72 },
        { name: '3A', price: 1750, availableSeats: 64 },
        { name: '2A', price: 2530, availableSeats: 54 },
        { name: '1A', price: 4220, availableSeats: 18 }
      ],
      daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    {
      id: '12951',
      name: 'Mumbai Rajdhani',
      number: '12951',
      origin: 'New Delhi (NDLS)',
      destination: 'Mumbai Central (BCT)',
      departure: '16:00',
      arrival: '08:35+1',
      duration: '16h 35m',
      distance: '1384 km',
      trainType: 'Rajdhani',
      classes: [
        { name: '1A', price: 4040, availableSeats: 18 },
        { name: '2A', price: 2430, availableSeats: 54 },
        { name: '3A', price: 1715, availableSeats: 64 }
      ],
      daysOfOperation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    {
      id: '12423',
      name: 'Dibrugarh Rajdhani',
      number: '12423',
      origin: 'New Delhi (NDLS)',
      destination: 'Dibrugarh (DBRG)',
      departure: '11:45',
      arrival: '18:00+1',
      duration: '30h 15m',
      distance: '2370 km',
      trainType: 'Rajdhani',
      classes: [
        { name: '1A', price: 5280, availableSeats: 18 },
        { name: '2A', price: 3165, availableSeats: 54 },
        { name: '3A', price: 2230, availableSeats: 64 }
      ],
      daysOfOperation: ['Mon', 'Wed', 'Sat']
    }
  ];

  const popularRoutes = [
    { from: 'New Delhi', to: 'Mumbai' },
    { from: 'New Delhi', to: 'Kolkata' },
    { from: 'New Delhi', to: 'Chennai' },
    { from: 'New Delhi', to: 'Bangalore' },
    { from: 'Mumbai', to: 'Pune' }
  ];

  useEffect(() => {
    const newPassengerDetails = Array.from({ length: searchParams.passengers }, (_, index) => 
      passengerDetails[index] || { name: '', age: '', gender: 'male' }
    );
    setPassengerDetails(newPassengerDetails);
  }, [searchParams.passengers]);

  const handleSearch = () => {
    if (!searchParams.origin || !searchParams.destination || !searchParams.date) {
      toast.error('Please fill all search fields');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      const filteredTrains = preBuiltTrains.filter(train => 
        train.origin.toLowerCase().includes(searchParams.origin.toLowerCase()) ||
        train.destination.toLowerCase().includes(searchParams.destination.toLowerCase())
      );
      
      setAvailableTrains(filteredTrains.length > 0 ? filteredTrains : preBuiltTrains);
      setLoading(false);
      
      if (filteredTrains.length === 0) {
        toast.success('Showing all available trains');
      } else {
        toast.success(`Found ${filteredTrains.length} trains`);
      }
    }, 1000);
  };

  const handleBookTrain = (train: TrainService, classType: string) => {
    setSelectedTrain(train);
    setSelectedClass(classType);
    setShowBookingForm(true);
  };

  const getClassPrice = (train: TrainService, classType: string) => {
    const classInfo = train.classes.find(c => c.name === classType);
    return classInfo ? classInfo.price : 0;
  };

  const getAvailableSeats = (train: TrainService, classType: string) => {
    const classInfo = train.classes.find(c => c.name === classType);
    return classInfo ? classInfo.availableSeats : 0;
  };

  const handleBookingSubmit = async () => {
    if (!selectedTrain) return;

    for (const passenger of passengerDetails) {
      if (!passenger.name || !passenger.age) {
        toast.error('Please fill all passenger details');
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const bookingData = {
        transport_id: selectedTrain.id,
        transport_type: 'train',
        passenger_details: passengerDetails,
        seat_preferences: {
          train_name: selectedTrain.name,
          train_number: selectedTrain.number,
          class: selectedClass,
          origin: selectedTrain.origin,
          destination: selectedTrain.destination,
          departure: selectedTrain.departure,
          date: searchParams.date
        }
      };

      const response = await axios.post('http://localhost:8002/api/transport/book', bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Train booking confirmed! PNR: ${response.data.booking_id}`);
      setShowBookingForm(false);
      setSelectedTrain(null);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Booking failed. Please try again.');
    }
  };

  const setQuickRoute = (route: { from: string; to: string }) => {
    setSearchParams(prev => ({
      ...prev,
      origin: route.from,
      destination: route.to
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Train className="w-8 h-8 mr-3" />
            Train Booking System
          </h1>
          <p className="text-red-100">Book train tickets across India with IRCTC-style booking</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Trains</h2>
          
          {/* Popular Routes */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Routes</h3>
            <div className="flex flex-wrap gap-2">
              {popularRoutes.map((route, index) => (
                <button
                  key={index}
                  onClick={() => setQuickRoute(route)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200 transition-colors"
                >
                  {route.from} → {route.to}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchParams.origin}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, origin: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Origin station"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchParams.destination}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, destination: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Destination station"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={searchParams.date}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                  value={searchParams.passengers}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {[1,2,3,4,5,6].map(num => (
                    <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                value={searchParams.class}
                onChange={(e) => setSearchParams(prev => ({ ...prev, class: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="SL">Sleeper (SL)</option>
                <option value="3A">AC 3 Tier (3A)</option>
                <option value="2A">AC 2 Tier (2A)</option>
                <option value="1A">AC First Class (1A)</option>
                <option value="CC">Chair Car (CC)</option>
                <option value="EC">Executive Chair Car (EC)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Search Trains'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {availableTrains.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Available Trains ({availableTrains.length})</h2>
            
            {availableTrains.map((train) => (
              <div key={train.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{train.name}</h3>
                    <p className="text-sm text-gray-600">#{train.number} • {train.trainType}</p>
                    <p className="text-sm text-red-600">{train.distance} • {train.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Runs on:</p>
                    <p className="text-sm text-green-600">{train.daysOfOperation.join(', ')}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{train.departure}</p>
                    <p className="text-sm text-gray-600">{train.origin.split(' ')[0]}</p>
                  </div>
                  
                  <div className="flex-1 mx-4">
                    <div className="flex items-center justify-center">
                      <div className="flex-1 h-px bg-gray-300"></div>
                      <ArrowRight className="w-5 h-5 text-gray-400 mx-2" />
                      <div className="flex-1 h-px bg-gray-300"></div>
                    </div>
                    <p className="text-center text-xs text-gray-500 mt-1">{train.duration}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{train.arrival}</p>
                    <p className="text-sm text-gray-600">{train.destination.split(' ')[0]}</p>
                  </div>
                </div>

                {/* Class Options */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {train.classes.map((classInfo) => (
                    <div key={classInfo.name} className="border border-gray-200 rounded-lg p-4">
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-900">{classInfo.name}</h4>
                        <p className="text-lg font-bold text-red-600">₹{classInfo.price}</p>
                        <p className="text-sm text-gray-600">{classInfo.availableSeats} seats</p>
                        <button
                          onClick={() => handleBookTrain(train, classInfo.name)}
                          disabled={classInfo.availableSeats === 0}
                          className="mt-2 w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-1 px-3 rounded transition-colors text-sm"
                        >
                          {classInfo.availableSeats > 0 ? 'Book Now' : 'Waitlist'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Form Modal */}
        {showBookingForm && selectedTrain && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Train Booking Details</h3>
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Train Details */}
                <div className="bg-red-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-red-900">{selectedTrain.name} ({selectedTrain.number})</h4>
                  <p className="text-red-700">{selectedTrain.origin} → {selectedTrain.destination}</p>
                  <p className="text-red-700">{selectedTrain.departure} - {selectedTrain.arrival}</p>
                  <p className="text-red-700">Class: {selectedClass} • ₹{getClassPrice(selectedTrain, selectedClass)} per passenger</p>
                </div>

                {/* Passenger Details */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-semibold text-gray-900">Passenger Details</h4>
                  {passengerDetails.map((passenger, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Passenger {index + 1} Name
                        </label>
                        <input
                          type="text"
                          value={passenger.name}
                          onChange={(e) => {
                            const newDetails = [...passengerDetails];
                            newDetails[index].name = e.target.value;
                            setPassengerDetails(newDetails);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Full name as per ID"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <input
                          type="number"
                          value={passenger.age}
                          onChange={(e) => {
                            const newDetails = [...passengerDetails];
                            newDetails[index].age = e.target.value;
                            setPassengerDetails(newDetails);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Age"
                          min="1"
                          max="120"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select
                          value={passenger.gender}
                          onChange={(e) => {
                            const newDetails = [...passengerDetails];
                            newDetails[index].gender = e.target.value;
                            setPassengerDetails(newDetails);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Amount */}
                <div className="bg-red-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-red-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-red-900">
                      ₹{getClassPrice(selectedTrain, selectedClass) * passengerDetails.length}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBookingSubmit}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Confirm Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainBooking;
