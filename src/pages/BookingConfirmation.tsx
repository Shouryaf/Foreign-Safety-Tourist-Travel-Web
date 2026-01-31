import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Share2, Calendar, MapPin, Users, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state?.bookingData;

  if (!bookingData) {
    navigate('/transport');
    return null;
  }

  const handleDownloadTicket = () => {
    toast.success('Ticket downloaded successfully!');
  };

  const handleShareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Booking Confirmation',
        text: `My ${bookingData.transport_type} booking from ${bookingData.from_location} to ${bookingData.to_location}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Booking link copied to clipboard!');
    }
  };

  const getTransportIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      train: '🚂',
      bus: '🚌',
      flight: '✈️',
      taxi: '🚗',
      metro: '🚇'
    };
    return iconMap[type] || '🚂';
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="font-display text-4xl font-bold text-neutral-900 mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-neutral-600">
            Your {bookingData.transport_type} booking has been successfully confirmed
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-3xl mr-3">{getTransportIcon(bookingData.transport_type)}</span>
                  <h2 className="text-2xl font-bold capitalize">
                    {bookingData.transport_type} Booking
                  </h2>
                </div>
                <p className="text-primary-100">Booking ID: {bookingData.booking_id}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">₹{bookingData.total_amount}</div>
                <p className="text-primary-100">Total Amount</p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-neutral-900 mb-4">Journey Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-neutral-500 mr-3" />
                    <div>
                      <p className="font-medium">{bookingData.from_location}</p>
                      <p className="text-sm text-neutral-600">Departure</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-neutral-500 mr-3" />
                    <div>
                      <p className="font-medium">{bookingData.to_location}</p>
                      <p className="text-sm text-neutral-600">Destination</p>
                    </div>
                  </div>
                  {bookingData.transport_details?.date && (
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-neutral-500 mr-3" />
                      <div>
                        <p className="font-medium">{bookingData.transport_details.date}</p>
                        <p className="text-sm text-neutral-600">Travel Date</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-neutral-900 mb-4">Passenger Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-neutral-500 mr-3" />
                    <div>
                      <p className="font-medium">{bookingData.passengers.length} Passenger(s)</p>
                      <p className="text-sm text-neutral-600">Total Travelers</p>
                    </div>
                  </div>
                  {bookingData.passengers.map((passenger: any, index: number) => (
                    <div key={index} className="ml-8">
                      <p className="font-medium">{passenger.name}</p>
                      <p className="text-sm text-neutral-600">
                        Age: {passenger.age}, {passenger.gender}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Transport Specific Details */}
            {bookingData.transport_details && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-neutral-900 mb-4">
                  {bookingData.transport_type === 'train' ? 'Train' :
                   bookingData.transport_type === 'bus' ? 'Bus' :
                   bookingData.transport_type === 'flight' ? 'Flight' :
                   bookingData.transport_type === 'taxi' ? 'Taxi' : 'Metro'} Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {bookingData.transport_details.operator && (
                    <div>
                      <p className="text-sm text-neutral-600">Operator</p>
                      <p className="font-medium">{bookingData.transport_details.operator}</p>
                    </div>
                  )}
                  {bookingData.transport_details.departure && (
                    <div>
                      <p className="text-sm text-neutral-600">Departure Time</p>
                      <p className="font-medium">{bookingData.transport_details.departure}</p>
                    </div>
                  )}
                  {bookingData.transport_details.arrival && (
                    <div>
                      <p className="text-sm text-neutral-600">Arrival Time</p>
                      <p className="font-medium">{bookingData.transport_details.arrival}</p>
                    </div>
                  )}
                  {bookingData.transport_details.duration && (
                    <div>
                      <p className="text-sm text-neutral-600">Duration</p>
                      <p className="font-medium">{bookingData.transport_details.duration}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Details */}
            <div className="border-t pt-6 mt-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Payment Details</h3>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">Payment Successful</span>
                  </div>
                  <div className="flex items-center text-green-900 font-bold">
                    <IndianRupee className="w-5 h-5 mr-1" />
                    {bookingData.total_amount}
                  </div>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  Payment processed successfully. You will receive a confirmation email shortly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={handleDownloadTicket}
            className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Ticket
          </button>
          <button
            onClick={handleShareBooking}
            className="flex-1 bg-accent-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-accent-700 transition-colors flex items-center justify-center"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Booking
          </button>
          <button
            onClick={() => navigate('/bookings')}
            className="flex-1 border border-neutral-300 text-neutral-700 py-3 px-6 rounded-xl font-semibold hover:bg-neutral-50 transition-colors"
          >
            View All Bookings
          </button>
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 mb-4">Important Information</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Please arrive at the departure point at least 30 minutes before scheduled time</li>
            <li>• Carry a valid photo ID proof during your journey</li>
            <li>• Keep your booking confirmation handy for verification</li>
            <li>• For any changes or cancellations, contact customer support</li>
            <li>• Refund policy applies as per terms and conditions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
