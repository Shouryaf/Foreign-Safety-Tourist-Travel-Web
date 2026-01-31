import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface TransportSearchProps {
  user: any;
}

interface SearchResult {
  id: string;
  type: string;
  name?: string;
  operator?: string;
  airline?: string;
  service?: string;
  origin: string;
  destination: string;
  departure: string;
  arrival?: string;
  duration?: string;
  price: number;
  available_seats?: number;
  classes?: any;
  car_type?: string;
  estimated_time?: string;
  distance?: string;
}

const TransportSearch: React.FC<TransportSearchProps> = ({ user }) => {
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    date: '',
    transport_type: 'train',
    passengers: 1
  });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [passengerDetails, setPassengerDetails] = useState([{ name: '', age: '', gender: 'male' }]);

  const transportTypes = [
    { value: 'train', label: '🚂 Train', icon: '🚂' },
    { value: 'bus', label: '🚌 Bus', icon: '🚌' },
    { value: 'flight', label: '✈️ Flight', icon: '✈️' },
    { value: 'taxi', label: '🚕 Taxi', icon: '🚕' },
    { value: 'metro', label: '🚇 Metro', icon: '🚇' }
  ];

  const handleSearch = async () => {
    if (!searchParams.origin || !searchParams.destination) {
      toast.error('Please enter origin and destination');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8002/api/transport/search', searchParams, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSearchResults(response.data.results);
      if (response.data.results.length === 0) {
        toast.info('No results found for your search');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedResult) return;

    try {
      const token = localStorage.getItem('token');
      const bookingData = {
        transport_id: selectedResult.id,
        transport_type: selectedResult.type,
        passenger_details: passengerDetails,
        payment_method: 'card'
      };

      const response = await axios.post('http://localhost:8002/api/transport/book', bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Booking confirmed! PNR: ${response.data.pnr}`);
      setShowBookingForm(false);
      setSelectedResult(null);
      setPassengerDetails([{ name: '', age: '', gender: 'male' }]);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Booking failed. Please try again.');
    }
  };

  const addPassenger = () => {
    if (passengerDetails.length < searchParams.passengers) {
      setPassengerDetails([...passengerDetails, { name: '', age: '', gender: 'male' }]);
    }
  };

  const updatePassenger = (index: number, field: string, value: string) => {
    const updated = [...passengerDetails];
    updated[index] = { ...updated[index], [field]: value };
    setPassengerDetails(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Transport</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
              <input
                type="text"
                value={searchParams.origin}
                onChange={(e) => setSearchParams({ ...searchParams, origin: e.target.value })}
                placeholder="Enter origin"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <input
                type="text"
                value={searchParams.destination}
                onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
                placeholder="Enter destination"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={searchParams.date}
                onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transport</label>
              <select
                value={searchParams.transport_type}
                onChange={(e) => setSearchParams({ ...searchParams, transport_type: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {transportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
              <select
                value={searchParams.passengers}
                onChange={(e) => setSearchParams({ ...searchParams, passengers: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Transport'}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Search Results</h2>
            
            <div className="space-y-4">
              {searchResults.map((result) => (
                <div key={result.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">
                          {transportTypes.find(t => t.value === result.type)?.icon}
                        </span>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {result.name || result.operator || result.airline || result.service || `${result.type.toUpperCase()} Service`}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {result.origin} → {result.destination}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Departure</p>
                          <p className="font-medium">{result.departure}</p>
                        </div>
                        {result.arrival && (
                          <div>
                            <p className="text-gray-600">Arrival</p>
                            <p className="font-medium">{result.arrival}</p>
                          </div>
                        )}
                        {result.duration && (
                          <div>
                            <p className="text-gray-600">Duration</p>
                            <p className="font-medium">{result.duration}</p>
                          </div>
                        )}
                        {result.estimated_time && (
                          <div>
                            <p className="text-gray-600">ETA</p>
                            <p className="font-medium">{result.estimated_time}</p>
                          </div>
                        )}
                      </div>

                      {result.classes && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">Available Classes:</p>
                          <div className="flex gap-2 flex-wrap">
                            {Object.entries(result.classes).map(([className, details]: [string, any]) => (
                              <span key={className} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {className}: ₹{details.price} ({details.available} seats)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-6">
                      <div className="mb-2">
                        <p className="text-2xl font-bold text-green-600">₹{result.price}</p>
                        {result.available_seats && (
                          <p className="text-sm text-gray-600">{result.available_seats} seats left</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedResult(result);
                          setShowBookingForm(true);
                        }}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking Form Modal */}
        {showBookingForm && selectedResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Book Your Journey</h2>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Journey Details</h3>
                <p>{selectedResult.name || selectedResult.operator || selectedResult.service}</p>
                <p className="text-sm text-gray-600">{selectedResult.origin} → {selectedResult.destination}</p>
                <p className="text-sm text-gray-600">Departure: {selectedResult.departure}</p>
                <p className="font-semibold text-green-600">Total: ₹{selectedResult.price * searchParams.passengers}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Passenger Details</h3>
                {passengerDetails.map((passenger, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={passenger.name}
                        onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Full Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                      <input
                        type="number"
                        value={passenger.age}
                        onChange={(e) => updatePassenger(index, 'age', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Age"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        value={passenger.gender}
                        onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                ))}
                
                {passengerDetails.length < searchParams.passengers && (
                  <button
                    onClick={addPassenger}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Passenger
                  </button>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowBookingForm(false);
                    setSelectedResult(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBooking}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportSearch;
