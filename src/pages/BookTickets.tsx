import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock, CreditCard, Train } from 'lucide-react';
import toast from 'react-hot-toast';

interface BookingForm {
  from: string;
  to: string;
  departureDate: string;
  returnDate: string;
  passengers: number;
  class: string;
  tripType: 'one-way' | 'round-trip';
}

const BookTickets: React.FC = () => {
  const [form, setForm] = useState<BookingForm>({
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    class: 'sleeper',
    tripType: 'one-way'
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'search' | 'results' | 'booking'>('search');

  const stations = [
    'New Delhi (NDLS)', 'Mumbai Central (BCT)', 'Chennai Central (MAS)',
    'Kolkata (HWH)', 'Bangalore City (SBC)', 'Hyderabad (HYB)',
    'Pune Junction (PUNE)', 'Ahmedabad (ADI)', 'Jaipur (JP)', 'Lucknow (LKO)'
  ];

  const trainClasses = [
    { value: 'sleeper', label: 'Sleeper (SL)', price: 450 },
    { value: '3ac', label: '3 Tier AC (3A)', price: 1200 },
    { value: '2ac', label: '2 Tier AC (2A)', price: 1800 },
    { value: '1ac', label: '1st AC (1A)', price: 3200 },
    { value: 'cc', label: 'Chair Car (CC)', price: 600 }
  ];

  const mockTrains = [
    {
      id: '12951',
      name: 'Mumbai Rajdhani Express',
      departure: '16:35',
      arrival: '08:35+1',
      duration: '16h 00m',
      availability: { sleeper: 45, '3ac': 23, '2ac': 12, '1ac': 5 }
    },
    {
      id: '12301',
      name: 'Howrah Rajdhani Express',
      departure: '17:00',
      arrival: '09:55+1',
      duration: '16h 55m',
      availability: { sleeper: 32, '3ac': 18, '2ac': 8, '1ac': 3 }
    },
    {
      id: '12423',
      name: 'Dibrugarh Rajdhani Express',
      departure: '21:30',
      arrival: '18:05+1',
      duration: '20h 35m',
      availability: { sleeper: 28, '3ac': 15, '2ac': 6, '1ac': 2 }
    }
  ];

  const handleSearch = async () => {
    if (!form.from || !form.to || !form.departureDate) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSearchResults(mockTrains);
      setStep('results');
      setLoading(false);
      toast.success('Trains found!');
    }, 1500);
  };

  const handleBooking = (train: any) => {
    setStep('booking');
    toast.success(`Booking ${train.name}`);
  };

  const getClassPrice = (className: string) => {
    return trainClasses.find(c => c.value === className)?.price || 0;
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-neutral-900 mb-4">
            Book Train Tickets
          </h1>
          <p className="text-lg text-neutral-600">
            Find and book train tickets across India
          </p>
        </div>

        {step === 'search' && (
          <div className="bg-white rounded-2xl shadow-soft p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  From Station
                </label>
                <select
                  value={form.from}
                  onChange={(e) => setForm({ ...form, from: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select departure station</option>
                  {stations.map(station => (
                    <option key={station} value={station}>{station}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  To Station
                </label>
                <select
                  value={form.to}
                  onChange={(e) => setForm({ ...form, to: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select destination station</option>
                  {stations.map(station => (
                    <option key={station} value={station}>{station}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Departure Date
                </label>
                <input
                  type="date"
                  value={form.departureDate}
                  onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <Users className="inline w-4 h-4 mr-1" />
                  Passengers
                </label>
                <select
                  value={form.passengers}
                  onChange={(e) => setForm({ ...form, passengers: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Trip Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="one-way"
                      checked={form.tripType === 'one-way'}
                      onChange={(e) => setForm({ ...form, tripType: e.target.value as 'one-way' })}
                      className="mr-2"
                    />
                    One Way
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="round-trip"
                      checked={form.tripType === 'round-trip'}
                      onChange={(e) => setForm({ ...form, tripType: e.target.value as 'round-trip' })}
                      className="mr-2"
                    />
                    Round Trip
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Class
                </label>
                <select
                  value={form.class}
                  onChange={(e) => setForm({ ...form, class: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {trainClasses.map(cls => (
                    <option key={cls.value} value={cls.value}>
                      {cls.label} - ₹{cls.price}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {form.tripType === 'round-trip' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Return Date
                </label>
                <input
                  type="date"
                  value={form.returnDate}
                  onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
                  min={form.departureDate}
                  className="w-full md:w-1/2 px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}

            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-primary-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Searching Trains...
                </div>
              ) : (
                'Search Trains'
              )}
            </button>
          </div>
        )}

        {step === 'results' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900">
                Available Trains ({searchResults.length})
              </h2>
              <button
                onClick={() => setStep('search')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                ← Modify Search
              </button>
            </div>

            {searchResults.map((train) => (
              <div key={train.id} className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <Train className="w-6 h-6 text-primary-600 mr-3" />
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900">
                          {train.name} ({train.id})
                        </h3>
                        <div className="flex items-center text-neutral-600 mt-1">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{train.duration}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neutral-900">{train.departure}</div>
                        <div className="text-sm text-neutral-600">{form.from.split('(')[0]}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-neutral-600">Duration</div>
                        <div className="font-medium">{train.duration}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-neutral-900">{train.arrival}</div>
                        <div className="text-sm text-neutral-600">{form.to.split('(')[0]}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {trainClasses.map((cls) => (
                        <div key={cls.value} className="bg-neutral-100 rounded-lg px-3 py-2">
                          <div className="text-sm font-medium">{cls.label}</div>
                          <div className="text-xs text-neutral-600">
                            Available: {train.availability[cls.value] || 0}
                          </div>
                          <div className="text-sm font-bold text-primary-600">₹{cls.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:ml-6">
                    <button
                      onClick={() => handleBooking(train)}
                      className="w-full lg:w-auto bg-accent-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-accent-700 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 'booking' && (
          <div className="bg-white rounded-2xl shadow-soft p-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
              <CreditCard className="inline w-6 h-6 mr-2" />
              Complete Your Booking
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Passenger Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter passenger name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter age"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Gender
                    </label>
                    <select className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
                <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span>Route:</span>
                    <span className="font-medium">{form.from.split('(')[0]} → {form.to.split('(')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">{form.departureDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passengers:</span>
                    <span className="font-medium">{form.passengers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Class:</span>
                    <span className="font-medium">{trainClasses.find(c => c.value === form.class)?.label}</span>
                  </div>
                  <hr className="border-neutral-200" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-primary-600">₹{getClassPrice(form.class) * form.passengers}</span>
                  </div>
                </div>

                <button
                  onClick={() => toast.success('Booking confirmed! PNR: PNR123456789')}
                  className="w-full mt-6 bg-accent-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-accent-700 transition-colors"
                >
                  Pay & Confirm Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookTickets;
