import React, { useState, useEffect } from 'react';
import { Bus, MapPin, Calendar, Users, ArrowRight, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';


interface BusService {
  id: string;
  name: string;
  operator: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: string;
  distance: string;
  busType: string;
  amenities: string[];
  price: number;
  availableSeats: number;
}

interface Passenger {
  name: string;
  age: string;
  gender: string;
}

const BusBooking: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    date: '',
    passengers: 1
  });
  
  const [availableBuses, setAvailableBuses] = useState<BusService[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBus, setSelectedBus] = useState<BusService | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [passengerDetails, setPassengerDetails] = useState<Passenger[]>([
    { name: '', age: '', gender: 'male' }
  ]);

  // Pre-built bus data
  const preBuiltBuses: BusService[] = [
    {
      id: 'VRL001',
      name: 'VRL Travels',
      operator: 'VRL Travels',
      origin: 'Delhi',
      destination: 'Mumbai',
      departure: '20:30',
      arrival: '12:00+1',
      duration: '15h 30m',
      distance: '1420 km',
      busType: 'Volvo Multi-Axle AC Sleeper',
      amenities: ['AC', 'WiFi', 'Charging Point', 'Water Bottle', 'Blanket'],
      price: 1200,
      availableSeats: 28
    },
    {
      id: 'RED001',
      name: 'RedBus Express',
      operator: 'RedBus',
      origin: 'Delhi',
      destination: 'Jaipur',
      departure: '06:00',
      arrival: '11:30',
      duration: '5h 30m',
      distance: '280 km',
      busType: 'AC Seater',
      amenities: ['AC', 'Charging Point', 'Water Bottle'],
      price: 450,
      availableSeats: 35
    },
    {
      id: 'SRS001',
      name: 'SRS Travels',
      operator: 'SRS Travels',
      origin: 'Bangalore',
      destination: 'Chennai',
      departure: '22:00',
      arrival: '05:30+1',
      duration: '7h 30m',
      distance: '350 km',
      busType: 'Volvo AC Sleeper',
      amenities: ['AC', 'WiFi', 'Charging Point', 'Blanket', 'Pillow'],
      price: 800,
      availableSeats: 22
    },
    {
      id: 'KPN001',
      name: 'KPN Travels',
      operator: 'KPN Travels',
      origin: 'Mumbai',
      destination: 'Pune',
      departure: '07:15',
      arrival: '10:45',
      duration: '3h 30m',
      distance: '150 km',
      busType: 'AC Seater',
      amenities: ['AC', 'Charging Point'],
      price: 300,
      availableSeats: 40
    },
    {
      id: 'GSRTC001',
      name: 'Gujarat State RTC',
      operator: 'GSRTC',
      origin: 'Ahmedabad',
      destination: 'Mumbai',
      departure: '21:45',
      arrival: '07:00+1',
      duration: '9h 15m',
      distance: '525 km',
      busType: 'Volvo AC Sleeper',
      amenities: ['AC', 'WiFi', 'Charging Point', 'Water Bottle', 'Blanket'],
      price: 950,
      availableSeats: 18
    }
  ];

  const popularRoutes = [
    { from: 'Delhi', to: 'Mumbai' },
    { from: 'Delhi', to: 'Jaipur' },
    { from: 'Bangalore', to: 'Chennai' },
    { from: 'Mumbai', to: 'Pune' },
    { from: 'Ahmedabad', to: 'Mumbai' }
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
      const filteredBuses = preBuiltBuses.filter(bus => 
        bus.origin.toLowerCase().includes(searchParams.origin.toLowerCase()) ||
        bus.destination.toLowerCase().includes(searchParams.destination.toLowerCase())
      );
      
      setAvailableBuses(filteredBuses.length > 0 ? filteredBuses : preBuiltBuses);
      setLoading(false);
      
      if (filteredBuses.length === 0) {
        toast.success('Showing all available buses');
      } else {
        toast.success(`Found ${filteredBuses.length} buses`);
      }
    }, 1000);
  };

  const handleBookBus = (bus: BusService) => {
    setSelectedBus(bus);
    setShowBookingForm(true);
  };

  const handleBookingSubmit = () => {
    if (!selectedBus) {
      toast.error('Please select a bus first');
      return;
    }

    // Validate passenger details
    for (const passenger of passengerDetails) {
      if (!passenger.name || !passenger.age) {
        toast.error('Please fill all passenger details');
        return;
      }
    }

    // Prepare booking data for payment gateway
    const bookingData = {
      booking_id: `BUS${Date.now()}`,
      transport_type: 'bus',
      from_location: selectedBus.origin,
      to_location: selectedBus.destination,
      total_amount: selectedBus.price * passengerDetails.length,
      passengers: passengerDetails,
      transport_details: {
        transport_id: selectedBus.id,
        operator: selectedBus.operator,
        bus_type: selectedBus.busType,
        departure: selectedBus.departure,
        arrival: selectedBus.arrival,
        date: searchParams.date,
        duration: selectedBus.duration
      }
    };

    console.log('Navigating to payment with data:', bookingData);
    toast.success('Redirecting to payment...');
    
    // Navigate to payment gateway
    navigate('/payment', { state: { bookingData } });
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
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Bus className="w-8 h-8 mr-3" />
            Bus Booking System
          </h1>
          <p className="text-green-100">Book your bus tickets with top operators across India</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Buses</h2>
          
          {/* Popular Routes */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Routes</h3>
            <div className="flex flex-wrap gap-2">
              {popularRoutes.map((route, index) => (
                <button
                  key={index}
                  onClick={() => setQuickRoute(route)}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
                >
                  {route.from} → {route.to}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchParams.origin}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, origin: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Origin city"
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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Destination city"
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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {[1,2,3,4,5,6].map(num => (
                    <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Search Buses'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {availableBuses.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Available Buses ({availableBuses.length})</h2>
            
            {availableBuses.map((bus) => (
              <div key={bus.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{bus.name}</h3>
                    <p className="text-sm text-gray-600">{bus.operator}</p>
                    <p className="text-sm text-green-600">{bus.busType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{bus.distance}</p>
                    <p className="text-sm text-gray-600">{bus.duration}</p>
                    <p className="text-sm text-green-600">{bus.availableSeats} seats available</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{bus.departure}</p>
                    <p className="text-sm text-gray-600">{bus.origin}</p>
                  </div>
                  
                  <div className="flex-1 mx-4">
                    <div className="flex items-center justify-center">
                      <div className="flex-1 h-px bg-gray-300"></div>
                      <ArrowRight className="w-5 h-5 text-gray-400 mx-2" />
                      <div className="flex-1 h-px bg-gray-300"></div>
                    </div>
                    <p className="text-center text-xs text-gray-500 mt-1">{bus.duration}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{bus.arrival}</p>
                    <p className="text-sm text-gray-600">{bus.destination}</p>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {bus.amenities.map((amenity, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">₹{bus.price}</p>
                    <p className="text-sm text-gray-600">per person</p>
                  </div>
                  <button
                    onClick={() => handleBookBus(bus)}
                    disabled={bus.availableSeats === 0}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    {bus.availableSeats > 0 ? 'Book Now' : 'Sold Out'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Form Modal */}
        {showBookingForm && selectedBus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Booking Details</h3>
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Bus Details */}
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-green-900">{selectedBus.name} - {selectedBus.busType}</h4>
                  <p className="text-green-700">{selectedBus.origin} → {selectedBus.destination}</p>
                  <p className="text-green-700">{selectedBus.departure} - {selectedBus.arrival}</p>
                  <p className="text-green-700">₹{selectedBus.price} per passenger</p>
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Full name"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-900">
                      ₹{selectedBus.price * passengerDetails.length}
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
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Proceed to Payment
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

export default BusBooking;
