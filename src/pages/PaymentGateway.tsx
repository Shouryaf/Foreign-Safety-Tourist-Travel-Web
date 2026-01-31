import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Wallet, Smartphone, Shield, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  fees: string;
  balance?: number;
}

interface BookingData {
  booking_id: string;
  transport_type: string;
  from_location: string;
  to_location: string;
  total_amount: number;
  passengers: any[];
}

export default function PaymentGateway() {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  useEffect(() => {
    const booking = location.state?.bookingData;
    if (!booking) {
      navigate('/transport');
      return;
    }
    setBookingData(booking);
    fetchPaymentMethods();
  }, [location.state, navigate]);

  const fetchPaymentMethods = async () => {
    // Mock payment methods for demo
    const mockPaymentMethods = [
      {
        id: 'wallet',
        name: 'TrainXceralate Wallet',
        type: 'wallet',
        enabled: true,
        fees: 'Free',
        balance: 2500
      },
      {
        id: 'stripe',
        name: 'Credit/Debit Card',
        type: 'card',
        enabled: true,
        fees: '2.9% + ₹3'
      },
      {
        id: 'razorpay',
        name: 'Razorpay',
        type: 'card',
        enabled: true,
        fees: '2% + GST'
      },
      {
        id: 'upi',
        name: 'UPI Payment',
        type: 'upi',
        enabled: true,
        fees: 'Free'
      }
    ];
    
    setPaymentMethods(mockPaymentMethods);
    setSelectedMethod('wallet');
  };

  const handlePayment = async () => {
    if (!selectedMethod || !bookingData) return;

    setProcessingPayment(true);
    
    // Mock payment processing
    const mockPaymentData = {
      payment_id: `PAY${Date.now()}`,
      amount: bookingData.total_amount,
      method: selectedMethod
    };

    try {
      if (selectedMethod === 'stripe') {
        // Handle Stripe payment
        await handleStripePayment(mockPaymentData);
      } else if (selectedMethod === 'razorpay') {
        // Handle Razorpay payment
        await handleRazorpayPayment(mockPaymentData);
      } else if (selectedMethod === 'upi') {
        // Handle UPI payment
        await handleUPIPayment(mockPaymentData);
      } else if (selectedMethod === 'wallet') {
        // Wallet payment is instant
        toast.success('Payment successful!');
        navigate('/booking-confirmation', { 
          state: { 
            bookingData: {
              ...bookingData,
              payment_id: mockPaymentData.payment_id
            }
          } 
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleStripePayment = async (paymentData: any) => {
    // Mock Stripe payment flow
    setTimeout(() => {
      toast.success('Payment successful via Stripe!');
      navigate('/booking-confirmation', { 
        state: { 
          bookingData: {
            ...bookingData,
            payment_id: paymentData.payment_id
          }
        } 
      });
    }, 2000);
  };

  const handleRazorpayPayment = async (paymentData: any) => {
    // Mock Razorpay payment flow
    setTimeout(() => {
      toast.success('Payment successful via Razorpay!');
      navigate('/booking-confirmation', { 
        state: { 
          bookingData: {
            ...bookingData,
            payment_id: paymentData.payment_id
          }
        } 
      });
    }, 2000);
  };

  const handleUPIPayment = async (paymentData: any) => {
    // Mock UPI payment flow
    setTimeout(() => {
      toast.success('Payment successful via UPI!');
      navigate('/booking-confirmation', { 
        state: { 
          bookingData: {
            ...bookingData,
            payment_id: paymentData.payment_id
          }
        } 
      });
    }, 2000);
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="h-6 w-6" />;
      case 'wallet':
        return <Wallet className="h-6 w-6" />;
      case 'upi':
        return <Smartphone className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  if (!bookingData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Secure Payment</h1>
          <Shield className="h-8 w-8 text-green-500 ml-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transport:</span>
                  <span className="font-medium capitalize">{bookingData.transport_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Route:</span>
                  <span className="font-medium">{bookingData.from_location} → {bookingData.to_location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Passengers:</span>
                  <span className="font-medium">{bookingData.passengers.length}</span>
                </div>
                <hr className="my-4" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-blue-600">₹{bookingData.total_amount}</span>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-green-50 rounded-lg p-4 mt-6">
              <div className="flex items-center mb-2">
                <Shield className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Secure Payment</span>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• 256-bit SSL encryption</li>
                <li>• PCI DSS compliant</li>
                <li>• Fraud protection</li>
                <li>• Instant refund policy</li>
              </ul>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Choose Payment Method</h2>
              
              <div className="space-y-4 mb-6">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!method.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => method.enabled && setSelectedMethod(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="text-blue-600 mr-3">
                          {getPaymentIcon(method.type)}
                        </div>
                        <div>
                          <h3 className="font-medium">{method.name}</h3>
                          <p className="text-sm text-gray-500">Processing fee: {method.fees}</p>
                          {method.balance !== undefined && (
                            <p className="text-sm text-green-600">Balance: ₹{method.balance}</p>
                          )}
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedMethod === method.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedMethod === method.id && (
                          <CheckCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Details Form (shown for card payments) */}
              {selectedMethod === 'stripe' && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Card Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <div className="mt-8">
                <button
                  onClick={handlePayment}
                  disabled={!selectedMethod || processingPayment}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {processingPayment ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    `Pay ₹${bookingData.total_amount}`
                  )}
                </button>
              </div>

              {/* Terms and Conditions */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  By proceeding, you agree to our{' '}
                  <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
