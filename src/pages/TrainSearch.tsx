import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TrainSearchForm from '../components/TrainSearch/TrainSearchForm';
import TrainCard from '../components/TrainSearch/TrainCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { Train } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function TrainSearch() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (params: { source: string; destination: string; date: string }) => {
    setLoading(true);
    setSearched(true);
    
    try {
      // If Supabase is not configured, use mock data
      if (!isSupabaseConfigured()) {
        const mockTrains: Train[] = [
          {
            id: '1',
            train_number: '12951',
            train_name: 'Mumbai Rajdhani Express',
            source_station: 'New Delhi',
            destination_station: 'Mumbai Central',
            departure_time: '16:55',
            arrival_time: '08:35',
            duration: '15h 40m',
            distance: 1384,
            available_seats: 45,
            total_seats: 200,
            fare: 2850,
            train_type: 'rajdhani',
            days_of_operation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            train_number: '12002',
            train_name: 'Bhopal Shatabdi Express',
            source_station: 'New Delhi',
            destination_station: 'Bhopal Junction',
            departure_time: '06:00',
            arrival_time: '13:55',
            duration: '7h 55m',
            distance: 707,
            available_seats: 23,
            total_seats: 150,
            fare: 1450,
            train_type: 'shatabdi',
            days_of_operation: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            created_at: new Date().toISOString()
          }
        ];
        setTrains(mockTrains);
        setLoading(false);
        return;
      }

      // Extract station codes from the search parameters
      const sourceCode = params.source.match(/\(([^)]+)\)$/)?.[1] || params.source;
      const destCode = params.destination.match(/\(([^)]+)\)$/)?.[1] || params.destination;
      
      const { data, error } = await supabase
        .from('trains')
        .select('*')
        .or(`source_station.ilike.%${sourceCode}%,source_station.ilike.%${params.source}%`)
        .or(`destination_station.ilike.%${destCode}%,destination_station.ilike.%${params.destination}%`);

      if (error) {
        console.error('Error searching trains:', error);
        setTrains([]);
      } else {
        setTrains(data || []);
      }
    } catch (error) {
      console.error('Error searching trains:', error);
      setTrains([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookTrain = (train: Train) => {
    navigate('/book', { state: { train } });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Trains</h1>
          <p className="text-gray-600">Find and book the perfect train for your journey</p>
        </div>

        <TrainSearchForm onSearch={handleSearch} loading={loading} />

        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {searched && !loading && (
          <div className="space-y-6">
            {trains.length > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {trains.length} train{trains.length !== 1 ? 's' : ''} found
                  </h2>
                </div>
                {trains.map((train) => (
                  <TrainCard key={train.id} train={train} onBook={handleBookTrain} />
                ))}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trains found</h3>
                <p className="text-gray-500">
                  No trains available for the selected route and date. 
                  Please try different stations or dates.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}