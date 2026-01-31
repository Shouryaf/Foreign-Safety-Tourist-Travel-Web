import React, { useState } from 'react';
import { Search, Train, Clock, MapPin, User, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface PNRData {
  pnr: string;
  trainNumber: string;
  trainName: string;
  from: string;
  to: string;
  dateOfJourney: string;
  class: string;
  status: 'confirmed' | 'waitlisted' | 'cancelled';
  passengers: Array<{
    name: string;
    age: number;
    gender: string;
    seatNumber?: string;
    status: string;
  }>;
  bookingStatus: string;
  chartStatus: string;
}

const PNRStatus: React.FC = () => {
  const [pnrNumber, setPnrNumber] = useState('');
  const [pnrData, setPnrData] = useState<PNRData | null>(null);
  const [loading, setLoading] = useState(false);

  const mockPNRData: PNRData = {
    pnr: '1234567890',
    trainNumber: '12951',
    trainName: 'Mumbai Rajdhani Express',
    from: 'New Delhi (NDLS)',
    to: 'Mumbai Central (BCT)',
    dateOfJourney: '2024-01-15',
    class: '3A',
    status: 'confirmed',
    passengers: [
      {
        name: 'John Doe',
        age: 35,
        gender: 'Male',
        seatNumber: 'B1-45',
        status: 'CNF'
      },
      {
        name: 'Jane Doe',
        age: 32,
        gender: 'Female',
        seatNumber: 'B1-46',
        status: 'CNF'
      }
    ],
    bookingStatus: 'Confirmed',
    chartStatus: 'Chart Prepared'
  };

  const handlePNRSearch = async () => {
    if (!pnrNumber || pnrNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit PNR number');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPnrData({ ...mockPNRData, pnr: pnrNumber });
      setLoading(false);
      toast.success('PNR status retrieved successfully!');
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'cnf':
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'wl':
      case 'waitlisted':
        return 'text-yellow-600 bg-yellow-50';
      case 'can':
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-neutral-600 bg-neutral-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'cnf':
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'wl':
      case 'waitlisted':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'can':
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-neutral-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-neutral-900 mb-4">
            PNR Status
          </h1>
          <p className="text-lg text-neutral-600">
            Check your train ticket booking status
          </p>
        </div>

        {/* PNR Search Form */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8">
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <Search className="inline w-4 h-4 mr-1" />
              Enter PNR Number
            </label>
            <div className="flex space-x-4">
              <input
                type="text"
                value={pnrNumber}
                onChange={(e) => setPnrNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit PNR number"
                className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                maxLength={10}
              />
              <button
                onClick={handlePNRSearch}
                disabled={loading || pnrNumber.length !== 10}
                className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Checking...
                  </div>
                ) : (
                  'Check Status'
                )}
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              PNR number is a 10-digit number printed on your ticket
            </p>
          </div>
        </div>

        {/* PNR Results */}
        {pnrData && (
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">PNR: {pnrData.pnr}</h2>
                  <div className="flex items-center space-x-4 text-primary-100">
                    <span className="flex items-center">
                      <Train className="w-4 h-4 mr-1" />
                      {pnrData.trainNumber} - {pnrData.trainName}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(pnrData.dateOfJourney).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full ${getStatusColor(pnrData.bookingStatus)}`}>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(pnrData.bookingStatus)}
                    <span className="font-semibold">{pnrData.bookingStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Journey Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <MapPin className="w-5 h-5 text-primary-600 mr-1" />
                    <span className="text-sm font-medium text-neutral-600">From</span>
                  </div>
                  <div className="text-lg font-bold text-neutral-900">{pnrData.from}</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Train className="w-5 h-5 text-primary-600 mr-1" />
                    <span className="text-sm font-medium text-neutral-600">Class</span>
                  </div>
                  <div className="text-lg font-bold text-neutral-900">{pnrData.class}</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <MapPin className="w-5 h-5 text-primary-600 mr-1" />
                    <span className="text-sm font-medium text-neutral-600">To</span>
                  </div>
                  <div className="text-lg font-bold text-neutral-900">{pnrData.to}</div>
                </div>
              </div>

              {/* Chart Status */}
              <div className="bg-neutral-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-700">Chart Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pnrData.chartStatus)}`}>
                    {pnrData.chartStatus}
                  </span>
                </div>
              </div>

              {/* Passenger Details */}
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Passenger Details
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-3 px-4 font-semibold text-neutral-700">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-700">Age</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-700">Gender</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-700">Seat/Berth</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pnrData.passengers.map((passenger, index) => (
                        <tr key={index} className="border-b border-neutral-100">
                          <td className="py-4 px-4 font-medium text-neutral-900">{passenger.name}</td>
                          <td className="py-4 px-4 text-neutral-700">{passenger.age}</td>
                          <td className="py-4 px-4 text-neutral-700">{passenger.gender}</td>
                          <td className="py-4 px-4 text-neutral-700">{passenger.seatNumber || 'Not Assigned'}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(passenger.status)}`}>
                              {passenger.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-8 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold text-blue-900 mb-2">Important Information:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Please carry a valid photo ID proof during your journey</li>
                  <li>• Report at the station at least 30 minutes before departure</li>
                  <li>• Chart is usually prepared 4 hours before departure</li>
                  <li>• For any queries, contact railway helpline: 139</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Sample PNR for Testing */}
        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-600 mb-2">
            For testing, try PNR: <button 
              onClick={() => setPnrNumber('1234567890')}
              className="text-primary-600 hover:text-primary-700 font-medium underline"
            >
              1234567890
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PNRStatus;
