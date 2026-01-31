import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, CreditCard, Plane, ArrowRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface FlightBookingProps {
  user: any;
}

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: string;
  distance: string;
  aircraft: string;
  class: string;
  price: number;
  availableSeats: number;
  stops: number;
}

interface Passenger {
  name: string;
  age: string;
  gender: string;
}

const FlightBooking: React.FC<FlightBookingProps> = ({ user }) => {
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    date: '',
    passengers: 1,
    class: 'economy'
  });
  
  const [availableFlights, setAvailableFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [passengerDetails, setPassengerDetails] = useState<Passenger[]>([
    { name: '', age: '', gender: 'male' }
  ]);

  // Pre-built flight data
  const preBuiltFlights: Flight[] = [
    {
      id: 'AI101',
      airline: 'Air India',
      flightNumber: 'AI 101',
      origin: 'Delhi (DEL)',
      destination: 'Mumbai (BOM)',
      departure: '06:00',
      arrival: '08:15',
      duration: '2h 15m',
      distance: '1136 km',
      aircraft: 'Boeing 737-800',
      class: 'Economy',
      price: 4500,
      availableSeats: 45,
      stops: 0
    },
    {
      id: 'SG205',
      airline: 'SpiceJet',
      flightNumber: 'SG 205',
      origin: 'Delhi (DEL)',
      destination: 'Bangalore (BLR)',
      departure: '14:30',
      arrival: '17:15',
      duration: '2h 45m',
      distance: '1740 km',
      aircraft: 'Boeing 737 MAX',
      class: 'Economy',
      price: 5200,
      availableSeats: 32,
      stops: 0
    },
    {
      id: 'UK955',
      airline: 'Vistara',
      flightNumber: 'UK 955',
      origin: 'Mumbai (BOM)',
      destination: 'Chennai (MAA)',
      departure: '19:45',
      arrival: '21:30',
      duration: '1h 45m',
      distance: '1025 km',
      aircraft: 'Airbus A320neo',
      class: 'Economy',
      price: 3800,
      availableSeats: 28,
      stops: 0
    },
    {
      id: 'AI131',
      airline: 'Air India',
      flightNumber: 'AI 131',
      origin: 'Delhi (DEL)',
      destination: 'Kolkata (CCU)',
      departure: '11:20',
      arrival: '13:45',
      duration: '2h 25m',
      distance: '1305 km',
      aircraft: 'Airbus A321',
      class: 'Economy',
      price: 4200,
      availableSeats: 38,
      stops: 0
    },
    {
      id: 'G8394',
      airline: 'GoAir',
      flightNumber: 'G8 394',
      origin: 'Bangalore (BLR)',
      destination: 'Goa (GOI)',
      departure: '16:10',
      arrival: '17:25',
      duration: '1h 15m',
      distance: '312 km',
      aircraft: 'Airbus A320',
      class: 'Economy',
      price: 2800,
      availableSeats: 42,
      stops: 0
    },
    {
      id: 'AI127',
      airline: 'Air India',
      flightNumber: 'AI 127',
      origin: 'Delhi (DEL)',
      destination: 'London (LHR)',
      departure: '02:15',
      arrival: '07:30',
      duration: '8h 45m',
      distance: '6700 km',
      aircraft: 'Boeing 787-8',
      class: 'Business',
      price: 45000,
      availableSeats: 12,
      stops: 0
    }
  ];

  const popularRoutes = [
    { from: 'Delhi (DEL)', to: 'Mumbai (BOM)' },
    { from: 'Delhi (DEL)', to: 'Bangalore (BLR)' },
    { from: 'Mumbai (BOM)', to: 'Chennai (MAA)' },
    { from: 'Delhi (DEL)', to: 'Kolkata (CCU)' },
    { from: 'Bangalore (BLR)', to: 'Goa (GOI)' }
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
      const filteredFlights = preBuiltFlights.filter(flight => 
        flight.origin.toLowerCase().includes(searchParams.origin.toLowerCase()) ||
        flight.destination.toLowerCase().includes(searchParams.destination.toLowerCase())
      );
      
      setAvailableFlights(filteredFlights.length > 0 ? filteredFlights : preBuiltFlights);
      setLoading(false);
      
      if (filteredFlights.length === 0) {
        toast.success('Showing all available flights');
      } else {
        toast.success(`Found ${filteredFlights.length} flights`);
      }
    }, 1000);
  };

  const handleBookFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async () => {
    if (!selectedFlight) return;

    for (const passenger of passengerDetails) {
      if (!passenger.name || !passenger.age) {
        toast.error('Please fill all passenger details');
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const bookingData = {
        transport_id: selectedFlight.id,
        transport_type: 'flight',
        passenger_details: passengerDetails,
        seat_preferences: {
          airline: selectedFlight.airline,
          flight_number: selectedFlight.flightNumber,
          class: selectedFlight.class,
          origin: selectedFlight.origin,
          destination: selectedFlight.destination,
          departure: selectedFlight.departure,
          date: searchParams.date
        }
      };

      const response = await axios.post('http://localhost:8002/api/transport/book', bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Flight booking confirmed! Booking ID: ${response.data.booking_id}`);
      setShowBookingForm(false);
      setSelectedFlight(null);
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Plane className="w-8 h-8 mr-3" />
            Flight Booking System
          </h1>
          <p className="text-blue-100">Book domestic and international flights with major airlines</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Flights</h2>
          
          {/* Popular Routes */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Routes</h3>
            <div className="flex flex-wrap gap-2">
              {popularRoutes.map((route, index) => (
                <button
                  key={index}
                  onClick={() => setQuickRoute(route)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  {route.from.split(' ')[0]} → {route.to.split(' ')[0]}
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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Origin airport"
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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Destination airport"
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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Search Flights'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {availableFlights.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Available Flights ({availableFlights.length})</h2>
            
            {availableFlights.map((flight) => (
              <div key={flight.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{flight.airline}</h3>
                    <p className="text-sm text-gray-600">{flight.flightNumber} • {flight.aircraft}</p>
                    <p className="text-sm text-blue-600">{flight.class} Class</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{flight.distance}</p>
                    <p className="text-sm text-gray-600">{flight.duration}</p>
                    <p className="text-sm text-blue-600">{flight.availableSeats} seats available</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{flight.departure}</p>
                    <p className="text-sm text-gray-600">{flight.origin}</p>
                  </div>
                  
                  <div className="flex-1 mx-4">
                    <div className="flex items-center justify-center">
                      <div className="flex-1 h-px bg-gray-300"></div>
                      <div className="mx-2 text-center">
                        <Plane className="w-5 h-5 text-gray-400 mx-auto" />
                        <p className="text-xs text-gray-500 mt-1">
                          {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                        </p>
                      </div>
                      <div className="flex-1 h-px bg-gray-300"></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{flight.arrival}</p>
                    <p className="text-sm text-gray-600">{flight.destination}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">₹{flight.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">per person</p>
                  </div>
                  <button
                    onClick={() => handleBookFlight(flight)}
                    disabled={flight.availableSeats === 0}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    {flight.availableSeats > 0 ? 'Book Now' : 'Sold Out'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Form Modal */}
        {showBookingForm && selectedFlight && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Flight Booking Details</h3>
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Flight Details */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900">{selectedFlight.airline} {selectedFlight.flightNumber}</h4>
                  <p className="text-blue-700">{selectedFlight.origin} → {selectedFlight.destination}</p>
                  <p className="text-blue-700">{selectedFlight.departure} - {selectedFlight.arrival}</p>
                  <p className="text-blue-700">₹{selectedFlight.price.toLocaleString()} per passenger</p>
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-blue-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-900">
                      ₹{(selectedFlight.price * passengerDetails.length).toLocaleString()}
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
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
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

export default FlightBooking;
