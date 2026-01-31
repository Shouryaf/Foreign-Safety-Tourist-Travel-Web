import React from 'react';
import { Clock, MapPin, IndianRupee, Users } from 'lucide-react';
import { Train } from '../../types';
import Button from '../UI/Button';

interface TrainCardProps {
  train: Train;
  onBook: (train: Train) => void;
}

export default function TrainCard({ train, onBook }: TrainCardProps) {
  const getTrainTypeColor = (type: string) => {
    switch (type) {
      case 'rajdhani':
        return 'bg-red-100 text-red-800';
      case 'shatabdi':
        return 'bg-blue-100 text-blue-800';
      case 'superfast':
        return 'bg-green-100 text-green-800';
      case 'express':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between">
        <div className="flex-1">
          {/* Train Info */}
          <div className="mb-4">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">
                {train.train_name}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTrainTypeColor(train.train_type)}`}>
                {train.train_type.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-600 font-medium">#{train.train_number}</p>
          </div>

          {/* Route & Timing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">{train.source_station}</p>
                <p className="text-lg font-bold text-blue-600">{train.departure_time}</p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <Clock className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                <p className="text-sm text-gray-600">{train.duration}</p>
                <p className="text-xs text-gray-500">{train.distance} km</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-gray-900">{train.destination_station}</p>
                <p className="text-lg font-bold text-blue-600">{train.arrival_time}</p>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">
                Available: <span className="font-medium text-green-600">{train.available_seats}</span> / {train.total_seats}
              </span>
            </div>
          </div>
        </div>

        {/* Fare & Book Button */}
        <div className="lg:ml-6 mt-4 lg:mt-0 text-center lg:text-right">
          <div className="mb-4">
            <div className="flex items-center justify-center lg:justify-end space-x-1">
              <IndianRupee className="h-5 w-5 text-gray-600" />
              <span className="text-2xl font-bold text-gray-900">{train.fare}</span>
            </div>
            <p className="text-sm text-gray-500">per person</p>
          </div>
          
          <Button
            onClick={() => onBook(train)}
            variant="primary"
            size="lg"
            disabled={train.available_seats <= 0}
            className="w-full lg:w-auto"
          >
            {train.available_seats > 0 ? 'Book Now' : 'Sold Out'}
          </Button>
        </div>
      </div>
    </div>
  );
}