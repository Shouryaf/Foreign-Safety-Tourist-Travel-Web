import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface BookingHistoryProps {
  user: any;
}

interface Booking {
  id: string;
  pnr: string;
  transport_id: string;
  transport_type: string;
  passenger_details: Array<{ name: string; age: string; gender: string }>;
  status: string;
  booking_date: string;
  payment_status: string;
  amount: number;
}

const BookingHistory: React.FC<BookingHistoryProps> = ({ user }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [trackingData, setTrackingData] = useState<any>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8002/api/transport/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data.bookings);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load booking history');
      setLoading(false);
    }
  };

  const fetchLiveTracking = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8002/api/transport/live-tracking/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrackingData(response.data);
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      toast.error('Live tracking not available');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'train': return '🚂';
      case 'bus': return '🚌';
      case 'flight': return '✈️';
      case 'taxi': return '🚕';
      case 'metro': return '🚇';
      default: return '🚗';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking History</h1>
          <p className="text-gray-600">Track and manage all your travel bookings</p>
        </div>

        {/* Bookings List */}
        {bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getTransportIcon(booking.transport_type)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.transport_type.toUpperCase()} Booking
                      </h3>
                      <p className="text-sm text-gray-600">PNR: {booking.pnr}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">₹{booking.amount}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Booking Date</p>
                    <p className="font-medium">{formatDate(booking.booking_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className={`font-medium ${booking.payment_status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Passengers</p>
                    <p className="font-medium">{booking.passenger_details.length} {booking.passenger_details.length === 1 ? 'Passenger' : 'Passengers'}</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {booking.passenger_details.map((passenger, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {passenger.name} ({passenger.age}y, {passenger.gender})
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Details
                    </button>
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => fetchLiveTracking(booking.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Live Tracking
                      </button>
                    )}
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      Download Ticket
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-4">Start your journey by booking your first transport!</p>
            <button
              onClick={() => window.location.href = '/transport'}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search Transport
            </button>
          </div>
        )}

        {/* Booking Details Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{getTransportIcon(selectedBooking.transport_type)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedBooking.transport_type.toUpperCase()} Journey</h3>
                      <p className="text-sm text-gray-600">PNR: {selectedBooking.pnr}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Status</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600">Amount</p>
                      <p className="font-semibold text-green-600">₹{selectedBooking.amount}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Passenger Information</h4>
                  <div className="space-y-2">
                    {selectedBooking.passenger_details.map((passenger, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{passenger.name}</p>
                          <p className="text-sm text-gray-600">{passenger.age} years, {passenger.gender}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Booking Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Booking Date</p>
                      <p className="font-medium">{formatDate(selectedBooking.booking_date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Payment Status</p>
                      <p className={`font-medium ${selectedBooking.payment_status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedBooking.payment_status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Download Ticket
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Tracking Modal */}
        {trackingData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Live Tracking</h2>
                <button
                  onClick={() => setTrackingData(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    trackingData.status === 'in_transit' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {trackingData.status === 'in_transit' ? '🚗 In Transit' : '✅ Arrived'}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Current Location</p>
                      <p className="font-medium">
                        {trackingData.current_location.latitude.toFixed(4)}, {trackingData.current_location.longitude.toFixed(4)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">ETA</p>
                      <p className="font-medium">{trackingData.estimated_arrival}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Next Stop</p>
                      <p className="font-medium">{trackingData.next_stop}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Delay</p>
                      <p className={`font-medium ${trackingData.delay > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {trackingData.delay > 0 ? `+${trackingData.delay} min` : 'On Time'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date(trackingData.last_updated).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setTrackingData(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
