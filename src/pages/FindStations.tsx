import React, { useState } from 'react';
import { Search, MapPin, Navigation, Clock, Phone, Wifi, Car, Coffee } from 'lucide-react';
import toast from 'react-hot-toast';

interface Station {
  code: string;
  name: string;
  city: string;
  state: string;
  zone: string;
  latitude: number;
  longitude: number;
  facilities: string[];
  platforms: number;
  contact?: string;
}

const FindStations: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  const mockStations: Station[] = [
    {
      code: 'NDLS',
      name: 'New Delhi',
      city: 'New Delhi',
      state: 'Delhi',
      zone: 'Northern Railway',
      latitude: 28.6434,
      longitude: 77.2197,
      facilities: ['WiFi', 'Parking', 'Food Court', 'Waiting Room', 'ATM', 'Medical'],
      platforms: 16,
      contact: '+91-11-23340000'
    },
    {
      code: 'BCT',
      name: 'Mumbai Central',
      city: 'Mumbai',
      state: 'Maharashtra',
      zone: 'Western Railway',
      latitude: 18.9690,
      longitude: 72.8205,
      facilities: ['WiFi', 'Parking', 'Food Court', 'Waiting Room', 'ATM'],
      platforms: 18,
      contact: '+91-22-22070000'
    },
    {
      code: 'MAS',
      name: 'Chennai Central',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zone: 'Southern Railway',
      latitude: 13.0827,
      longitude: 80.2707,
      facilities: ['WiFi', 'Parking', 'Food Court', 'Waiting Room', 'ATM', 'Medical'],
      platforms: 12,
      contact: '+91-44-25330000'
    },
    {
      code: 'HWH',
      name: 'Howrah Junction',
      city: 'Kolkata',
      state: 'West Bengal',
      zone: 'Eastern Railway',
      latitude: 22.5726,
      longitude: 88.3639,
      facilities: ['WiFi', 'Parking', 'Food Court', 'Waiting Room', 'ATM'],
      platforms: 23,
      contact: '+91-33-26602000'
    },
    {
      code: 'SBC',
      name: 'Bangalore City Junction',
      city: 'Bangalore',
      state: 'Karnataka',
      zone: 'South Western Railway',
      latitude: 12.9716,
      longitude: 77.5946,
      facilities: ['WiFi', 'Parking', 'Food Court', 'Waiting Room', 'ATM', 'Medical'],
      platforms: 10,
      contact: '+91-80-22870000'
    },
    {
      code: 'HYB',
      name: 'Hyderabad Deccan',
      city: 'Hyderabad',
      state: 'Telangana',
      zone: 'South Central Railway',
      latitude: 17.3850,
      longitude: 78.4867,
      facilities: ['WiFi', 'Parking', 'Food Court', 'Waiting Room', 'ATM'],
      platforms: 8,
      contact: '+91-40-27001000'
    },
    {
      code: 'PUNE',
      name: 'Pune Junction',
      city: 'Pune',
      state: 'Maharashtra',
      zone: 'Central Railway',
      latitude: 18.5204,
      longitude: 73.8567,
      facilities: ['WiFi', 'Parking', 'Food Court', 'Waiting Room', 'ATM'],
      platforms: 6,
      contact: '+91-20-26120000'
    },
    {
      code: 'ADI',
      name: 'Ahmedabad Junction',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zone: 'Western Railway',
      latitude: 23.0225,
      longitude: 72.5714,
      facilities: ['WiFi', 'Parking', 'Food Court', 'Waiting Room', 'ATM', 'Medical'],
      platforms: 12,
      contact: '+91-79-22140000'
    }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a station name or code');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const results = mockStations.filter(station => 
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setLoading(false);
      
      if (results.length === 0) {
        toast.error('No stations found matching your search');
      } else {
        toast.success(`Found ${results.length} station(s)`);
      }
    }, 1000);
  };

  const getFacilityIcon = (facility: string) => {
    switch (facility.toLowerCase()) {
      case 'wifi':
        return <Wifi className="w-4 h-4" />;
      case 'parking':
        return <Car className="w-4 h-4" />;
      case 'food court':
        return <Coffee className="w-4 h-4" />;
      case 'medical':
        return <Phone className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const handleGetDirections = (station: Station) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
    window.open(url, '_blank');
    toast.success('Opening directions in Google Maps');
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-neutral-900 mb-4">
            Find Railway Stations
          </h1>
          <p className="text-lg text-neutral-600">
            Search for railway stations across India with detailed information
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8">
          <div className="max-w-2xl mx-auto">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <Search className="inline w-4 h-4 mr-1" />
              Search Stations
            </label>
            <div className="flex space-x-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter station name, code, or city (e.g., Delhi, NDLS, Mumbai)"
                className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </div>
                ) : (
                  'Search'
                )}
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Search by station name, station code, or city name
            </p>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {searchResults.map((station) => (
              <div key={station.code} className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-medium transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-neutral-900 mb-1">
                      {station.name}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-2">
                      Code: <span className="font-mono font-semibold text-primary-600">{station.code}</span>
                    </p>
                    <div className="flex items-center text-sm text-neutral-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {station.city}, {station.state}
                    </div>
                    <p className="text-xs text-neutral-500">{station.zone}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center text-sm text-neutral-600 mb-2">
                    <Clock className="w-4 h-4 mr-1" />
                    Platforms: {station.platforms}
                  </div>
                  {station.contact && (
                    <div className="flex items-center text-sm text-neutral-600">
                      <Phone className="w-4 h-4 mr-1" />
                      {station.contact}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-neutral-700 mb-2">Facilities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {station.facilities.map((facility, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-lg"
                      >
                        {getFacilityIcon(facility)}
                        <span className="ml-1">{facility}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedStation(station)}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleGetDirections(station)}
                    className="flex items-center justify-center bg-accent-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-accent-700 transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Station Details Modal */}
        {selectedStation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-large max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                      {selectedStation.name}
                    </h2>
                    <p className="text-lg text-neutral-600">
                      Station Code: <span className="font-mono font-semibold text-primary-600">{selectedStation.code}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedStation(null)}
                    className="text-neutral-400 hover:text-neutral-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-3">Location Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-neutral-500" />
                        <span>{selectedStation.city}, {selectedStation.state}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-neutral-500" />
                        <span>{selectedStation.zone}</span>
                      </div>
                      <div className="flex items-center">
                        <Navigation className="w-4 h-4 mr-2 text-neutral-500" />
                        <span>Platforms: {selectedStation.platforms}</span>
                      </div>
                      {selectedStation.contact && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-neutral-500" />
                          <span>{selectedStation.contact}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-3">Coordinates</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-neutral-600">Latitude:</span>
                        <span className="ml-2 font-mono">{selectedStation.latitude}</span>
                      </div>
                      <div>
                        <span className="text-neutral-600">Longitude:</span>
                        <span className="ml-2 font-mono">{selectedStation.longitude}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-neutral-900 mb-3">Available Facilities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedStation.facilities.map((facility, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 bg-neutral-50 rounded-lg"
                      >
                        {getFacilityIcon(facility)}
                        <span className="ml-2 text-sm font-medium">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => handleGetDirections(selectedStation)}
                    className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                  >
                    <Navigation className="inline w-4 h-4 mr-2" />
                    Get Directions
                  </button>
                  <button
                    onClick={() => setSelectedStation(null)}
                    className="flex-1 bg-neutral-200 text-neutral-700 py-3 px-6 rounded-xl font-semibold hover:bg-neutral-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Popular Stations */}
        <div className="bg-white rounded-2xl shadow-soft p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Popular Railway Stations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mockStations.slice(0, 6).map((station) => (
              <button
                key={station.code}
                onClick={() => {
                  setSearchQuery(station.name);
                  setSearchResults([station]);
                }}
                className="p-4 border border-neutral-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
              >
                <div className="font-semibold text-neutral-900 text-sm">{station.code}</div>
                <div className="text-xs text-neutral-600 mt-1">{station.city}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindStations;
