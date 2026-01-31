import React, { useState, useEffect } from 'react';
import { Search, ArrowRightLeft, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../UI/Button';
import { Station } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface TrainSearchFormProps {
  onSearch: (params: {
    source: string;
    destination: string;
    date: string;
  }) => void;
  loading?: boolean;
}

export default function TrainSearchForm({ onSearch, loading = false }: TrainSearchFormProps) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [stations, setStations] = useState<Station[]>([]);
  const [sourceStations, setSourceStations] = useState<Station[]>([]);
  const [destStations, setDestStations] = useState<Station[]>([]);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    // If Supabase is not configured, use mock data
    if (!isSupabaseConfigured()) {
      const mockStations: Station[] = [
        { id: '1', station_code: 'NDLS', station_name: 'New Delhi', city: 'Delhi', state: 'Delhi', created_at: new Date().toISOString() },
        { id: '2', station_code: 'BCT', station_name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra', created_at: new Date().toISOString() },
        { id: '3', station_code: 'HWH', station_name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal', created_at: new Date().toISOString() },
        { id: '4', station_code: 'MAS', station_name: 'Chennai Central', city: 'Chennai', state: 'Tamil Nadu', created_at: new Date().toISOString() },
        { id: '5', station_code: 'SBC', station_name: 'Bangalore City', city: 'Bangalore', state: 'Karnataka', created_at: new Date().toISOString() },
        { id: '6', station_code: 'HYB', station_name: 'Hyderabad Deccan', city: 'Hyderabad', state: 'Telangana', created_at: new Date().toISOString() },
        { id: '7', station_code: 'PUNE', station_name: 'Pune Junction', city: 'Pune', state: 'Maharashtra', created_at: new Date().toISOString() },
        { id: '8', station_code: 'ADI', station_name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat', created_at: new Date().toISOString() },
      ];
      setStations(mockStations);
      return;
    }

    const { data, error } = await supabase
      .from('stations')
      .select('*')
      .order('station_name');
    
    if (data && !error) {
      setStations(data);
    } else {
      console.error('Error fetching stations:', error);
      // Fallback to empty array if there's an error
      setStations([]);
    }
  };

  const filterStations = (query: string, type: 'source' | 'destination') => {
    if (!query.trim()) {
      if (type === 'source') {
        setSourceStations([]);
        setShowSourceDropdown(false);
      } else {
        setDestStations([]);
        setShowDestDropdown(false);
      }
      return;
    }

    const filtered = stations.filter(station =>
      station.station_name.toLowerCase().includes(query.toLowerCase()) ||
      station.station_code.toLowerCase().includes(query.toLowerCase()) ||
      station.city.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);

    if (type === 'source') {
      setSourceStations(filtered);
      setShowSourceDropdown(true);
    } else {
      setDestStations(filtered);
      setShowDestDropdown(true);
    }
  };

  const handleSourceChange = (value: string) => {
    setSource(value);
    filterStations(value, 'source');
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    filterStations(value, 'destination');
  };

  const selectStation = (station: Station, type: 'source' | 'destination') => {
    const stationText = `${station.station_name} (${station.station_code})`;
    if (type === 'source') {
      setSource(stationText);
      setShowSourceDropdown(false);
    } else {
      setDestination(stationText);
      setShowDestDropdown(false);
    }
  };

  const swapStations = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (source && destination && date) {
      onSearch({ source, destination, date });
    }
  };

  const tomorrow = format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Source Station */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              From
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => handleSourceChange(e.target.value)}
              onFocus={() => filterStations(source, 'source')}
              placeholder="Source station"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {showSourceDropdown && sourceStations.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {sourceStations.map((station) => (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => selectStation(station, 'source')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{station.station_name}</div>
                    <div className="text-sm text-gray-500">{station.station_code} - {station.city}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex items-end justify-center">
            <button
              type="button"
              onClick={swapStations}
              className="p-3 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Swap stations"
            >
              <ArrowRightLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Destination Station */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              To
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              onFocus={() => filterStations(destination, 'destination')}
              placeholder="Destination station"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {showDestDropdown && destStations.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {destStations.map((station) => (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => selectStation(station, 'destination')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{station.station_name}</div>
                    <div className="text-sm text-gray-500">{station.station_code} - {station.city}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          {/* Travel Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Journey Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={tomorrow}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Search Button */}
          <div>
            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="w-full"
              variant="primary"
            >
              <Search className="h-5 w-5 mr-2" />
              Search Trains
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}