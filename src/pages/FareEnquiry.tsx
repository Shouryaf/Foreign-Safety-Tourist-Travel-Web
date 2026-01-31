import React, { useState } from 'react';
import { Search, MapPin, Users, Calendar, IndianRupee, Train, Clock, Bus, Plane, Car } from 'lucide-react';
import toast from 'react-hot-toast';

interface FareDetails {
  id: string;
  name: string;
  from: string;
  to: string;
  distance: number;
  transportType: 'train' | 'bus' | 'flight' | 'taxi' | 'metro';
  options: Array<{
    name: string;
    code: string;
    fare: number;
    availability: string;
    duration?: string;
  }>;
}

const FareEnquiry: React.FC = () => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [transportType, setTransportType] = useState('all');
  const [fareDetails, setFareDetails] = useState<FareDetails[]>([]);
  const [loading, setLoading] = useState(false);

  const locations = [
    'New Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Bangalore', 'Hyderabad',
    'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Goa', 'Kochi', 'Chandigarh'
  ];

  const mockFareData: FareDetails[] = [
    // Train Options
    {
      id: '12951',
      name: 'Mumbai Rajdhani Express',
      from: 'New Delhi',
      to: 'Mumbai',
      distance: 1384,
      transportType: 'train',
      options: [
        { name: '1st AC', code: '1A', fare: 3200, availability: 'Available', duration: '16h 35m' },
        { name: '2 Tier AC', code: '2A', fare: 1800, availability: 'Available', duration: '16h 35m' },
        { name: '3 Tier AC', code: '3A', fare: 1200, availability: 'Available', duration: '16h 35m' }
      ]
    },
    // Bus Options
    {
      id: 'VRL001',
      name: 'VRL Travels AC Sleeper',
      from: 'New Delhi',
      to: 'Mumbai',
      distance: 1420,
      transportType: 'bus',
      options: [
        { name: 'AC Sleeper', code: 'SL', fare: 1200, availability: 'Available', duration: '15h 30m' },
        { name: 'AC Seater', code: 'ST', fare: 800, availability: 'Available', duration: '15h 30m' }
      ]
    },
    // Flight Options
    {
      id: 'AI101',
      name: 'Air India',
      from: 'New Delhi',
      to: 'Mumbai',
      distance: 1136,
      transportType: 'flight',
      options: [
        { name: 'Business Class', code: 'BC', fare: 12000, availability: 'Available', duration: '2h 15m' },
        { name: 'Economy Class', code: 'EC', fare: 4500, availability: 'Available', duration: '2h 15m' }
      ]
    },
    // Taxi Options
    {
      id: 'OLA001',
      name: 'Ola Cab Service',
      from: 'New Delhi',
      to: 'Mumbai',
      distance: 1420,
      transportType: 'taxi',
      options: [
        { name: 'Prime Sedan', code: 'PR', fare: 18000, availability: 'Available', duration: '18h 0m' },
        { name: 'Mini', code: 'MN', fare: 15000, availability: 'Available', duration: '18h 0m' }
      ]
    },
    // Metro Options (Local)
    {
      id: 'DMRC001',
      name: 'Delhi Metro',
      from: 'Rajiv Chowk',
      to: 'AIIMS',
      distance: 8,
      transportType: 'metro',
      options: [
        { name: 'Metro Token', code: 'TK', fare: 30, availability: 'Available', duration: '25m' },
        { name: 'Smart Card', code: 'SC', fare: 28, availability: 'Available', duration: '25m' }
      ]
    }
  ];

  const handleSearch = async () => {
    if (!fromLocation || !toLocation) {
      toast.error('Please select both departure and destination locations');
      return;
    }

    if (fromLocation === toLocation) {
      toast.error('Departure and destination locations cannot be the same');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let results = mockFareData.filter(fare => {
        const matchesRoute = fare.from.toLowerCase().includes(fromLocation.toLowerCase()) || 
                           fare.to.toLowerCase().includes(toLocation.toLowerCase());
        const matchesTransport = transportType === 'all' || fare.transportType === transportType;
        return matchesRoute && matchesTransport;
      });

      setFareDetails(results);
      setLoading(false);
      
      if (results.length === 0) {
        toast.error('No fare information found for the selected route and transport type');
      } else {
        toast.success(`Found fare details for ${results.length} transport option(s)`);
      }
    }, 1500);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability.toLowerCase()) {
      case 'available':
        return 'text-green-600 bg-green-50';
      case 'waiting list':
        return 'text-yellow-600 bg-yellow-50';
      case 'not available':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-neutral-600 bg-neutral-50';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-neutral-900 mb-4">
            Fare Enquiry
          </h1>
          <p className="text-lg text-neutral-600">
            Compare fares across all transport modes - trains, buses, flights, taxis, and metro
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                From Location
              </label>
              <select
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select departure location</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                To Location
              </label>
              <select
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select destination location</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Transport Mode
              </label>
              <select
                value={transportType}
                onChange={(e) => setTransportType(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Transport Modes</option>
                <option value="train">🚂 Train</option>
                <option value="bus">🚌 Bus</option>
                <option value="flight">✈️ Flight</option>
                <option value="taxi">🚗 Taxi</option>
                <option value="metro">🚇 Metro</option>
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
                    Check Fare
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Fare Results */}
        {fareDetails.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              Fare Details ({fareDetails.length} transport option(s))
            </h2>

            {fareDetails.map((fare) => {
              const getTransportIcon = (type: string) => {
                switch(type) {
                  case 'train': return <Train className="w-6 h-6" />;
                  case 'bus': return <Bus className="w-6 h-6" />;
                  case 'flight': return <Plane className="w-6 h-6" />;
                  case 'taxi': return <Car className="w-6 h-6" />;
                  case 'metro': return <Train className="w-6 h-6" />;
                  default: return <Train className="w-6 h-6" />;
                }
              };
              
              const getTransportColor = (type: string) => {
                switch(type) {
                  case 'train': return 'from-red-600 to-red-700';
                  case 'bus': return 'from-green-600 to-green-700';
                  case 'flight': return 'from-blue-600 to-blue-700';
                  case 'taxi': return 'from-yellow-600 to-yellow-700';
                  case 'metro': return 'from-purple-600 to-purple-700';
                  default: return 'from-primary-600 to-primary-700';
                }
              };
              
              return (
              <div key={fare.id} className="bg-white rounded-2xl shadow-soft overflow-hidden">
                {/* Transport Header */}
                <div className={`bg-gradient-to-r ${getTransportColor(fare.transportType)} text-white p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        {getTransportIcon(fare.transportType)}
                        <h3 className="text-2xl font-bold ml-3">
                          {fare.name} ({fare.id})
                        </h3>
                      </div>
                      <div className="flex items-center space-x-4 text-white opacity-90">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {fare.from} → {fare.to}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Distance: {fare.distance} km
                        </span>
                        <span className="capitalize bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                          {fare.transportType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fare Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fare.options.map((option, index) => (
                      <div key={index} className="border border-neutral-200 rounded-xl p-4 hover:border-primary-300 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-neutral-900">{option.name}</h4>
                            <p className="text-sm text-neutral-600">{option.code} {option.duration && `• ${option.duration}`}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(option.availability)}`}>
                            {option.availability}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-2xl font-bold text-primary-600">
                            <IndianRupee className="w-6 h-6 mr-1" />
                            {option.fare.toLocaleString()}
                          </div>
                          <button className="bg-accent-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-700 transition-colors">
                            Book Now
                          </button>
                        </div>
                        
                        <div className="mt-3 text-xs text-neutral-500">
                          Per person • Base fare
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Additional Information */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                    <h4 className="font-semibold text-blue-900 mb-2">Fare Information:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Fares are subject to change without prior notice</li>
                      <li>• Additional charges may apply for peak hours/seasons</li>
                      <li>• Discounts available for senior citizens and children</li>
                      <li>• All applicable taxes included in the fare</li>
                    </ul>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}

        {/* Fare Calculator */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mt-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Fare Calculator</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <Users className="inline w-4 h-4 mr-1" />
                Number of Passengers
              </label>
              <select className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="1">1 Passenger</option>
                <option value="2">2 Passengers</option>
                <option value="3">3 Passengers</option>
                <option value="4">4 Passengers</option>
                <option value="5">5 Passengers</option>
                <option value="6">6 Passengers</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Booking Type
              </label>
              <select className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="general">General Booking</option>
                <option value="tatkal">Tatkal Booking (+10%)</option>
                <option value="premium-tatkal">Premium Tatkal (+30%)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Passenger Category
              </label>
              <select className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="general">General</option>
                <option value="senior">Senior Citizen (-40%)</option>
                <option value="child">Child (5-12 years, -50%)</option>
                <option value="student">Student (-25%)</option>
              </select>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-xl p-4">
            <h3 className="font-semibold text-neutral-900 mb-2">Fare Breakdown:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base Fare:</span>
                <span>₹1,200</span>
              </div>
              <div className="flex justify-between">
                <span>Reservation Charges:</span>
                <span>₹40</span>
              </div>
              <div className="flex justify-between">
                <span>Service Tax:</span>
                <span>₹60</span>
              </div>
              <hr className="border-neutral-200" />
              <div className="flex justify-between font-semibold">
                <span>Total Amount:</span>
                <span className="text-primary-600">₹1,300</span>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Routes Fare */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mt-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Popular Routes - Starting Fares</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { route: 'Delhi → Mumbai', trainFare: 450, busFare: 800, flightFare: 4500, mode: 'Multi-modal' },
              { route: 'Delhi → Kolkata', trainFare: 420, busFare: 750, flightFare: 4200, mode: 'Multi-modal' },
              { route: 'Mumbai → Chennai', trainFare: 380, busFare: 650, flightFare: 3800, mode: 'Multi-modal' },
              { route: 'Delhi → Bangalore', trainFare: 520, busFare: 900, flightFare: 5200, mode: 'Multi-modal' }
            ].map((route, index) => (
              <div key={index} className="p-4 border border-neutral-200 rounded-xl hover:border-primary-300 transition-colors">
                <div className="font-semibold text-neutral-900 mb-3">{route.route}</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center"><Train className="w-3 h-3 mr-1" />Train</span>
                    <div className="flex items-center text-red-600 font-semibold">
                      <IndianRupee className="w-3 h-3 mr-1" />
                      {route.trainFare}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center"><Bus className="w-3 h-3 mr-1" />Bus</span>
                    <div className="flex items-center text-green-600 font-semibold">
                      <IndianRupee className="w-3 h-3 mr-1" />
                      {route.busFare}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center"><Plane className="w-3 h-3 mr-1" />Flight</span>
                    <div className="flex items-center text-blue-600 font-semibold">
                      <IndianRupee className="w-3 h-3 mr-1" />
                      {route.flightFare}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FareEnquiry;
