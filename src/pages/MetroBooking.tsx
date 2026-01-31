import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, CreditCard, Train, ArrowRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface MetroBookingProps {
  user: any;
}

interface MetroRoute {
  id: string;
  line: string;
  origin: string;
  destination: string;
  distance: number;
  duration: string;
  fare: number;
  stations: string[];
  lineColor: string;
  frequency: string;
  firstTrain: string;
  lastTrain: string;
}

interface MetroCard {
  type: string;
  balance: number;
  validity: string;
}

const MetroBooking: React.FC<MetroBookingProps> = ({ user }) => {
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    date: '',
    time: '',
    passengers: 1
  });
  
  const [availableRoutes, setAvailableRoutes] = useState<MetroRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<MetroRoute | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [metroCard, setMetroCard] = useState<MetroCard>({
    type: 'Smart Card',
    balance: 250,
    validity: '2025-12-31'
  });

  // Pre-built metro data (Delhi Metro)
  const preBuiltRoutes: MetroRoute[] = [
    {
      id: 'RED001',
      line: 'Red Line',
      origin: 'Rithala',
      destination: 'Shaheed Sthal',
      distance: 25.1,
      duration: '45 mins',
      fare: 30,
      stations: ['Rithala', 'Rohini West', 'Rohini East', 'Pitam Pura', 'Kohat Enclave', 'Netaji Subhash Place', 'Keshav Puram', 'Kanhaiya Nagar', 'Inderlok', 'Shastri Nagar', 'Pratap Nagar', 'Pulbangash', 'Tis Hazari', 'Kashmere Gate', 'Shastri Park', 'Seelampur', 'Welcome', 'Shahdara', 'Mansarovar Park', 'Jhilmil', 'Dilshad Garden', 'Shaheed Sthal'],
      lineColor: '#FF0000',
      frequency: '2-4 mins',
      firstTrain: '05:30',
      lastTrain: '23:30'
    },
    {
      id: 'BLUE001',
      line: 'Blue Line',
      origin: 'Dwarka Sector 21',
      destination: 'Noida Electronic City',
      distance: 50.4,
      duration: '85 mins',
      fare: 45,
      stations: ['Dwarka Sector 21', 'Dwarka Sector 8', 'Dwarka Sector 9', 'Dwarka Sector 10', 'Dwarka Sector 11', 'Dwarka Sector 12', 'Dwarka Sector 13', 'Dwarka Sector 14', 'Dwarka', 'Dwarka Mor', 'Nawada', 'Uttam Nagar West', 'Uttam Nagar East', 'Janakpuri West', 'Janakpuri East', 'Tilak Nagar', 'Subhash Nagar', 'Tagore Garden', 'Rajouri Garden', 'Ramesh Nagar', 'Moti Nagar', 'Kirti Nagar', 'Shadipur', 'Patel Nagar', 'Rajendra Place', 'Karol Bagh', 'Jhandewalan', 'RK Ashram Marg', 'Rajiv Chowk', 'Barakhamba Road', 'Mandi House', 'Supreme Court', 'Indraprastha', 'Yamuna Bank', 'Akshardham', 'Mayur Vihar Phase 1', 'Mayur Vihar Extension', 'New Ashok Nagar', 'Noida Sector 15', 'Noida Sector 16', 'Noida Sector 18', 'Botanical Garden', 'Golf Course', 'Noida City Centre', 'Noida Sector 34', 'Noida Sector 52', 'Noida Sector 61', 'Noida Sector 59', 'Noida Sector 62', 'Noida Electronic City'],
      lineColor: '#0000FF',
      frequency: '2-5 mins',
      firstTrain: '05:15',
      lastTrain: '23:45'
    },
    {
      id: 'YELLOW001',
      line: 'Yellow Line',
      origin: 'Samaypur Badli',
      destination: 'HUDA City Centre',
      distance: 49.0,
      duration: '80 mins',
      fare: 40,
      stations: ['Samaypur Badli', 'Rohini Sector 18', 'Haiderpur Badli Mor', 'Jahangirpuri', 'Adarsh Nagar', 'Azadpur', 'Model Town', 'GTB Nagar', 'Vishwavidyalaya', 'Vidhan Sabha', 'Civil Lines', 'Kashmere Gate', 'Chandni Chowk', 'Chawri Bazar', 'New Delhi', 'Rajiv Chowk', 'Patel Chowk', 'Central Secretariat', 'Udyog Bhawan', 'Race Course', 'Jor Bagh', 'INA', 'AIIMS', 'Green Park', 'Hauz Khas', 'Malviya Nagar', 'Saket', 'Qutab Minar', 'Chhatarpur', 'Sultanpur', 'Ghitorni', 'Arjan Garh', 'Guru Dronacharya', 'Sikanderpur', 'MG Road', 'IFFCO Chowk', 'HUDA City Centre'],
      lineColor: '#FFFF00',
      frequency: '2-4 mins',
      firstTrain: '05:30',
      lastTrain: '23:30'
    },
    {
      id: 'GREEN001',
      line: 'Green Line',
      origin: 'Brigadier Hoshiar Singh',
      destination: 'Kirti Nagar',
      distance: 23.0,
      duration: '40 mins',
      fare: 25,
      stations: ['Brigadier Hoshiar Singh', 'Ashok Park Main', 'Punjabi Bagh West', 'Punjabi Bagh', 'Shivaji Park', 'Madipur', 'Paschim Vihar East', 'Paschim Vihar West', 'Peeragarhi', 'Udyog Nagar', 'Maharaja Surajmal Stadium', 'Nangloi', 'Nangloi Railway Station', 'Rajdhani Park', 'Mundka', 'Mundka Industrial Area', 'Ghevra Metro Station', 'Tikri Kalan', 'Tikri Border', 'Pandit Shree Ram Sharma', 'Bahadurgarh City', 'Brigadier Hoshiar Singh'],
      lineColor: '#00FF00',
      frequency: '5-8 mins',
      firstTrain: '06:00',
      lastTrain: '23:00'
    },
    {
      id: 'VIOLET001',
      line: 'Violet Line',
      origin: 'Kashmere Gate',
      destination: 'Raja Nahar Singh',
      distance: 35.0,
      duration: '60 mins',
      fare: 35,
      stations: ['Kashmere Gate', 'Lal Qila', 'Jama Masjid', 'Delhi Gate', 'ITO', 'Mandi House', 'Janpath', 'Central Secretariat', 'Khan Market', 'JLN Stadium', 'Jangpura', 'Lajpat Nagar', 'Moolchand', 'Kailash Colony', 'Nehru Place', 'Kalkaji Mandir', 'Govind Puri', 'Harkesh Nagar Okhla', 'Jasola Apollo', 'Sarita Vihar', 'Mohan Estate', 'Tughlakabad Station', 'Badarpur Border', 'Sarai', 'NHPC Chowk', 'Mewala Maharajpur', 'Sector 28', 'Badkal Mor', 'Old Faridabad', 'Neelam Chowk Ajronda', 'Bata Chowk', 'Escorts Mujesar', 'Sant Surdas', 'Raja Nahar Singh'],
      lineColor: '#8B00FF',
      frequency: '3-6 mins',
      firstTrain: '05:45',
      lastTrain: '23:15'
    }
  ];

  const popularStations = [
    'Rajiv Chowk',
    'Kashmere Gate',
    'New Delhi',
    'Connaught Place',
    'AIIMS',
    'Hauz Khas',
    'Noida City Centre',
    'Dwarka Sector 21'
  ];

  const handleSearch = () => {
    if (!searchParams.origin || !searchParams.destination) {
      toast.error('Please enter origin and destination stations');
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      const filteredRoutes = preBuiltRoutes.filter(route => 
        route.stations.some(station => 
          station.toLowerCase().includes(searchParams.origin.toLowerCase())
        ) &&
        route.stations.some(station => 
          station.toLowerCase().includes(searchParams.destination.toLowerCase())
        )
      );
      
      setAvailableRoutes(filteredRoutes.length > 0 ? filteredRoutes : preBuiltRoutes.slice(0, 3));
      setLoading(false);
      
      if (filteredRoutes.length === 0) {
        toast.success('Showing suggested routes');
      } else {
        toast.success(`Found ${filteredRoutes.length} route(s)`);
      }
    }, 1000);
  };

  const handleBookRoute = (route: MetroRoute) => {
    setSelectedRoute(route);
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async () => {
    if (!selectedRoute) return;

    if (metroCard.balance < selectedRoute.fare * searchParams.passengers) {
      toast.error('Insufficient balance in metro card. Please recharge.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const bookingData = {
        transport_id: selectedRoute.id,
        transport_type: 'metro',
        booking_details: {
          line: selectedRoute.line,
          origin: searchParams.origin,
          destination: searchParams.destination,
          date: searchParams.date,
          time: searchParams.time,
          passengers: searchParams.passengers,
          fare: selectedRoute.fare * searchParams.passengers,
          card_type: metroCard.type
        }
      };

      const response = await axios.post('http://localhost:8002/api/transport/book', bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update metro card balance
      setMetroCard(prev => ({
        ...prev,
        balance: prev.balance - (selectedRoute.fare * searchParams.passengers)
      }));

      toast.success(`Metro ticket booked! Booking ID: ${response.data.booking_id}`);
      setShowBookingForm(false);
      setSelectedRoute(null);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Booking failed. Please try again.');
    }
  };

  const rechargeCard = () => {
    setMetroCard(prev => ({
      ...prev,
      balance: prev.balance + 500
    }));
    toast.success('Metro card recharged with ₹500');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Train className="w-8 h-8 mr-3" />
            Metro Booking System
          </h1>
          <p className="text-purple-100">Book metro tickets for Delhi Metro network</p>
        </div>

        {/* Metro Card Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Metro Card</h3>
              <p className="text-sm text-gray-600">{metroCard.type}</p>
              <p className="text-2xl font-bold text-purple-600">₹{metroCard.balance}</p>
              <p className="text-sm text-gray-600">Valid till: {metroCard.validity}</p>
            </div>
            <button
              onClick={rechargeCard}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Recharge Card
            </button>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Plan Your Journey</h2>
          
          {/* Popular Stations */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Stations</h3>
            <div className="flex flex-wrap gap-2">
              {popularStations.map((station, index) => (
                <button
                  key={index}
                  onClick={() => setSearchParams(prev => ({ 
                    ...prev, 
                    origin: prev.origin || station,
                    destination: prev.origin ? station : prev.destination
                  }))}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
                >
                  {station}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Station</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchParams.origin}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, origin: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Origin station"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Station</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchParams.destination}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, destination: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Find Routes'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Available Routes */}
        {availableRoutes.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Available Routes ({availableRoutes.length})</h2>
            
            {availableRoutes.map((route) => (
              <div key={route.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: route.lineColor }}
                      ></div>
                      <h3 className="text-lg font-semibold text-gray-900">{route.line}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{route.distance} km • {route.duration}</p>
                    <p className="text-sm text-purple-600">Frequency: {route.frequency}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">First: {route.firstTrain}</p>
                    <p className="text-sm text-gray-600">Last: {route.lastTrain}</p>
                    <p className="text-sm text-green-600">{route.stations.length} stations</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{searchParams.origin || route.origin}</p>
                    <p className="text-sm text-gray-600">Origin</p>
                  </div>
                  
                  <div className="flex-1 mx-4">
                    <div className="flex items-center justify-center">
                      <div className="flex-1 h-px bg-gray-300"></div>
                      <ArrowRight className="w-5 h-5 text-gray-400 mx-2" />
                      <div className="flex-1 h-px bg-gray-300"></div>
                    </div>
                    <p className="text-center text-xs text-gray-500 mt-1">{route.duration}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{searchParams.destination || route.destination}</p>
                    <p className="text-sm text-gray-600">Destination</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">₹{route.fare}</p>
                    <p className="text-sm text-gray-600">per person</p>
                  </div>
                  <button
                    onClick={() => handleBookRoute(route)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    Book Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Form Modal */}
        {showBookingForm && selectedRoute && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Metro Ticket Booking</h3>
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Route Details */}
                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: selectedRoute.lineColor }}
                    ></div>
                    <h4 className="font-semibold text-purple-900">{selectedRoute.line}</h4>
                  </div>
                  <p className="text-purple-700">{searchParams.origin} → {searchParams.destination}</p>
                  <p className="text-purple-700">{selectedRoute.distance} km • {selectedRoute.duration}</p>
                  <p className="text-purple-700">₹{selectedRoute.fare} per passenger</p>
                </div>

                {/* Journey Details */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-semibold text-gray-900">Journey Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <p className="text-gray-900">{searchParams.date}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
                      <p className="text-gray-900">{searchParams.passengers}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-purple-900 mb-2">Payment Details</h4>
                  <div className="space-y-1 text-sm text-purple-700">
                    <div className="flex justify-between">
                      <span>Fare per passenger:</span>
                      <span>₹{selectedRoute.fare}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Number of passengers:</span>
                      <span>{searchParams.passengers}</span>
                    </div>
                    <div className="border-t border-purple-200 pt-1 flex justify-between font-semibold">
                      <span>Total Amount:</span>
                      <span>₹{selectedRoute.fare * searchParams.passengers}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Metro Card Balance:</span>
                      <span>₹{metroCard.balance}</span>
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
                    disabled={metroCard.balance < selectedRoute.fare * searchParams.passengers}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    {metroCard.balance < selectedRoute.fare * searchParams.passengers ? 'Insufficient Balance' : 'Book Ticket'}
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

export default MetroBooking;
