import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, CreditCard, Car, ArrowRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface TaxiBookingProps {
  user: any;
}

interface TaxiService {
  id: string;
  provider: string;
  vehicleType: string;
  model: string;
  capacity: number;
  features: string[];
  pricePerKm: number;
  baseFare: number;
  estimatedTime: string;
  rating: number;
  driverName: string;
  vehicleNumber: string;
  available: boolean;
}

interface BookingDetails {
  pickup: string;
  destination: string;
  date: string;
  time: string;
  passengers: number;
  estimatedDistance: number;
}

const TaxiBooking: React.FC<TaxiBookingProps> = ({ user }) => {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    pickup: '',
    destination: '',
    date: '',
    time: '',
    passengers: 1,
    estimatedDistance: 0
  });
  
  const [availableTaxis, setAvailableTaxis] = useState<TaxiService[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTaxi, setSelectedTaxi] = useState<TaxiService | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Pre-built taxi data
  const preBuiltTaxis: TaxiService[] = [
    {
      id: 'OLA001',
      provider: 'Ola',
      vehicleType: 'Mini',
      model: 'Maruti Swift',
      capacity: 4,
      features: ['AC', 'Music System', 'GPS Tracking'],
      pricePerKm: 12,
      baseFare: 50,
      estimatedTime: '3 mins',
      rating: 4.2,
      driverName: 'Rajesh Kumar',
      vehicleNumber: 'DL 01 AB 1234',
      available: true
    },
    {
      id: 'UBER001',
      provider: 'Uber',
      vehicleType: 'Go',
      model: 'Hyundai Grand i10',
      capacity: 4,
      features: ['AC', 'Phone Charger', 'Water Bottle'],
      pricePerKm: 11,
      baseFare: 45,
      estimatedTime: '5 mins',
      rating: 4.5,
      driverName: 'Amit Singh',
      vehicleNumber: 'DL 02 CD 5678',
      available: true
    },
    {
      id: 'OLA002',
      provider: 'Ola',
      vehicleType: 'Prime',
      model: 'Honda City',
      capacity: 4,
      features: ['AC', 'Premium Interior', 'Music System', 'GPS Tracking'],
      pricePerKm: 18,
      baseFare: 80,
      estimatedTime: '4 mins',
      rating: 4.6,
      driverName: 'Suresh Sharma',
      vehicleNumber: 'DL 03 EF 9012',
      available: true
    },
    {
      id: 'UBER002',
      provider: 'Uber',
      vehicleType: 'XL',
      model: 'Toyota Innova',
      capacity: 6,
      features: ['AC', 'Spacious', 'Phone Charger', 'Water Bottle'],
      pricePerKm: 22,
      baseFare: 100,
      estimatedTime: '6 mins',
      rating: 4.4,
      driverName: 'Vikram Yadav',
      vehicleNumber: 'DL 04 GH 3456',
      available: true
    },
    {
      id: 'MERU001',
      provider: 'Meru',
      vehicleType: 'Sedan',
      model: 'Maruti Dzire',
      capacity: 4,
      features: ['AC', 'GPS Tracking', 'Music System', 'Clean Interior'],
      pricePerKm: 15,
      baseFare: 60,
      estimatedTime: '7 mins',
      rating: 4.1,
      driverName: 'Ravi Gupta',
      vehicleNumber: 'DL 05 IJ 7890',
      available: true
    },
    {
      id: 'OLA003',
      provider: 'Ola',
      vehicleType: 'Luxury',
      model: 'BMW 3 Series',
      capacity: 4,
      features: ['Premium AC', 'Leather Seats', 'Premium Sound', 'WiFi'],
      pricePerKm: 35,
      baseFare: 200,
      estimatedTime: '8 mins',
      rating: 4.8,
      driverName: 'Arjun Malhotra',
      vehicleNumber: 'DL 06 KL 1234',
      available: true
    }
  ];

  const popularLocations = [
    'Connaught Place, Delhi',
    'India Gate, Delhi',
    'Red Fort, Delhi',
    'Qutub Minar, Delhi',
    'Lotus Temple, Delhi',
    'Akshardham Temple, Delhi'
  ];

  useEffect(() => {
    // Calculate estimated distance based on pickup and destination
    if (bookingDetails.pickup && bookingDetails.destination) {
      // Simple estimation - in real app, use Google Maps API
      const estimatedKm = Math.floor(Math.random() * 20) + 5; // 5-25 km
      setBookingDetails(prev => ({ ...prev, estimatedDistance: estimatedKm }));
    }
  }, [bookingDetails.pickup, bookingDetails.destination]);

  const handleSearch = () => {
    if (!bookingDetails.pickup || !bookingDetails.destination) {
      toast.error('Please enter pickup and destination locations');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      setAvailableTaxis(preBuiltTaxis);
      setLoading(false);
      toast.success(`Found ${preBuiltTaxis.length} available taxis`);
    }, 1000);
  };

  const handleBookTaxi = (taxi: TaxiService) => {
    setSelectedTaxi(taxi);
    setShowBookingForm(true);
  };

  const calculateFare = (taxi: TaxiService) => {
    return taxi.baseFare + (taxi.pricePerKm * bookingDetails.estimatedDistance);
  };

  const handleBookingSubmit = async () => {
    if (!selectedTaxi) return;

    try {
      const token = localStorage.getItem('token');
      const bookingData = {
        transport_id: selectedTaxi.id,
        transport_type: 'taxi',
        booking_details: {
          provider: selectedTaxi.provider,
          vehicle_type: selectedTaxi.vehicleType,
          model: selectedTaxi.model,
          driver_name: selectedTaxi.driverName,
          vehicle_number: selectedTaxi.vehicleNumber,
          pickup: bookingDetails.pickup,
          destination: bookingDetails.destination,
          date: bookingDetails.date,
          time: bookingDetails.time,
          estimated_fare: calculateFare(selectedTaxi)
        }
      };

      const response = await axios.post('http://localhost:8002/api/transport/book', bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Taxi booking confirmed! Booking ID: ${response.data.booking_id}`);
      setShowBookingForm(false);
      setSelectedTaxi(null);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Booking failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Car className="w-8 h-8 mr-3" />
            Taxi Booking System
          </h1>
          <p className="text-yellow-100">Book rides with top taxi providers in your city</p>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Book a Ride</h2>
          
          {/* Popular Locations */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Locations</h3>
            <div className="flex flex-wrap gap-2">
              {popularLocations.map((location, index) => (
                <button
                  key={index}
                  onClick={() => setBookingDetails(prev => ({ 
                    ...prev, 
                    pickup: prev.pickup || location,
                    destination: prev.pickup ? location : prev.destination
                  }))}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm hover:bg-yellow-200 transition-colors"
                >
                  {location.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={bookingDetails.pickup}
                  onChange={(e) => setBookingDetails(prev => ({ ...prev, pickup: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter pickup location"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={bookingDetails.destination}
                  onChange={(e) => setBookingDetails(prev => ({ ...prev, destination: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter destination"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={bookingDetails.date}
                  onChange={(e) => setBookingDetails(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="time"
                  value={bookingDetails.time}
                  onChange={(e) => setBookingDetails(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Find Rides'
                )}
              </button>
            </div>
          </div>

          {bookingDetails.estimatedDistance > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700">
                Estimated Distance: <span className="font-semibold">{bookingDetails.estimatedDistance} km</span>
              </p>
            </div>
          )}
        </div>

        {/* Available Taxis */}
        {availableTaxis.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Available Rides ({availableTaxis.length})</h2>
            
            {availableTaxis.map((taxi) => (
              <div key={taxi.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Car className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{taxi.provider} {taxi.vehicleType}</h3>
                      <p className="text-sm text-gray-600">{taxi.model}</p>
                      <p className="text-sm text-yellow-600">★ {taxi.rating} • {taxi.estimatedTime} away</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Capacity: {taxi.capacity} passengers</p>
                    <p className="text-sm text-gray-600">{taxi.vehicleNumber}</p>
                    <p className="text-sm text-green-600">Driver: {taxi.driverName}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {taxi.features.map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">₹{calculateFare(taxi)}</p>
                    <p className="text-sm text-gray-600">
                      Base: ₹{taxi.baseFare} + ₹{taxi.pricePerKm}/km
                    </p>
                  </div>
                  <button
                    onClick={() => handleBookTaxi(taxi)}
                    disabled={!taxi.available}
                    className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    {taxi.available ? 'Book Ride' : 'Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Confirmation Modal */}
        {showBookingForm && selectedTaxi && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Confirm Booking</h3>
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Ride Details */}
                <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-yellow-900">{selectedTaxi.provider} {selectedTaxi.vehicleType}</h4>
                  <p className="text-yellow-700">{selectedTaxi.model} • {selectedTaxi.vehicleNumber}</p>
                  <p className="text-yellow-700">Driver: {selectedTaxi.driverName}</p>
                  <p className="text-yellow-700">Rating: ★ {selectedTaxi.rating}</p>
                </div>

                {/* Trip Details */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-semibold text-gray-900">Trip Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pickup</label>
                      <p className="text-gray-900">{bookingDetails.pickup}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                      <p className="text-gray-900">{bookingDetails.destination}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                      <p className="text-gray-900">{bookingDetails.date} at {bookingDetails.time}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Distance</label>
                      <p className="text-gray-900">{bookingDetails.estimatedDistance} km</p>
                    </div>
                  </div>
                </div>

                {/* Fare Breakdown */}
                <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-yellow-900 mb-2">Fare Breakdown</h4>
                  <div className="space-y-1 text-sm text-yellow-700">
                    <div className="flex justify-between">
                      <span>Base Fare:</span>
                      <span>₹{selectedTaxi.baseFare}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distance ({bookingDetails.estimatedDistance} km × ₹{selectedTaxi.pricePerKm}):</span>
                      <span>₹{selectedTaxi.pricePerKm * bookingDetails.estimatedDistance}</span>
                    </div>
                    <div className="border-t border-yellow-200 pt-1 flex justify-between font-semibold">
                      <span>Total Estimated Fare:</span>
                      <span>₹{calculateFare(selectedTaxi)}</span>
                    </div>
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
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
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

export default TaxiBooking;
