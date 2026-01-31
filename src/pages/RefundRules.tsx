import React, { useState } from 'react';
import { Clock, CreditCard, AlertCircle, Calculator, FileText, ChevronRight } from 'lucide-react';

interface RefundRule {
  id: number;
  title: string;
  description: string;
  timeLimit: string;
  charges: string;
  applicableFor: string[];
}

const RefundRules: React.FC = () => {
  const [selectedTicketType, setSelectedTicketType] = useState('general');
  const [calculatorData, setCalculatorData] = useState({
    ticketPrice: '',
    cancellationTime: '',
    ticketType: 'general'
  });
  const [calculatedRefund, setCalculatedRefund] = useState<number | null>(null);

  const ticketTypes = [
    { value: 'general', label: 'General Tickets' },
    { value: 'tatkal', label: 'Tatkal Tickets' },
    { value: 'premium', label: 'Premium Trains' },
    { value: 'season', label: 'Season Tickets' }
  ];

  const refundRules: RefundRule[] = [
    {
      id: 1,
      title: 'More than 48 hours before departure',
      description: 'Full refund minus clerkage charges',
      timeLimit: '48+ hours',
      charges: '₹60 for AC classes, ₹30 for Non-AC',
      applicableFor: ['general', 'premium']
    },
    {
      id: 2,
      title: '12-48 hours before departure',
      description: '25% of fare deducted plus clerkage charges',
      timeLimit: '12-48 hours',
      charges: '25% + clerkage charges',
      applicableFor: ['general', 'premium']
    },
    {
      id: 3,
      title: '4-12 hours before departure',
      description: '50% of fare deducted plus clerkage charges',
      timeLimit: '4-12 hours',
      charges: '50% + clerkage charges',
      applicableFor: ['general']
    },
    {
      id: 4,
      title: 'Less than 4 hours before departure',
      description: 'No refund available',
      timeLimit: '< 4 hours',
      charges: 'No refund',
      applicableFor: ['general', 'premium']
    },
    {
      id: 5,
      title: 'Tatkal tickets cancellation',
      description: 'No refund except in case of train cancellation',
      timeLimit: 'Any time',
      charges: 'No refund',
      applicableFor: ['tatkal']
    },
    {
      id: 6,
      title: 'Season ticket cancellation',
      description: 'Refund based on unused portion',
      timeLimit: 'Any time',
      charges: 'Proportionate refund',
      applicableFor: ['season']
    }
  ];

  const filteredRules = refundRules.filter(rule => 
    rule.applicableFor.includes(selectedTicketType)
  );

  const calculateRefund = () => {
    const price = parseFloat(calculatorData.ticketPrice);
    const hours = parseFloat(calculatorData.cancellationTime);
    
    if (!price || !hours) return;

    let refundAmount = 0;
    const clerkageCharges = price > 500 ? 60 : 30;

    if (calculatorData.ticketType === 'tatkal') {
      refundAmount = 0; // No refund for Tatkal
    } else if (hours >= 48) {
      refundAmount = price - clerkageCharges;
    } else if (hours >= 12) {
      refundAmount = price * 0.75 - clerkageCharges;
    } else if (hours >= 4) {
      refundAmount = price * 0.5 - clerkageCharges;
    } else {
      refundAmount = 0; // No refund
    }

    setCalculatedRefund(Math.max(0, refundAmount));
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-neutral-900 mb-4">
            Refund Rules & Policies
          </h1>
          <p className="text-lg text-neutral-600">
            Understand cancellation charges and refund policies for different ticket types
          </p>
        </div>

        {/* Quick Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <Clock className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Time Matters</h3>
            <p className="text-neutral-600">Earlier cancellation means higher refund amount</p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <CreditCard className="w-12 h-12 text-accent-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Processing Time</h3>
            <p className="text-neutral-600">Refunds processed within 3-7 working days</p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Special Cases</h3>
            <p className="text-neutral-600">Different rules for Tatkal and premium trains</p>
          </div>
        </div>

        {/* Ticket Type Selector */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Select Ticket Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ticketTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setSelectedTicketType(type.value)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedTicketType === type.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="font-semibold">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Refund Rules */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden mb-8">
          <div className="p-6 border-b border-neutral-200">
            <h2 className="text-2xl font-bold text-neutral-900 flex items-center">
              <FileText className="w-6 h-6 mr-2" />
              Refund Rules for {ticketTypes.find(t => t.value === selectedTicketType)?.label}
            </h2>
          </div>

          <div className="divide-y divide-neutral-200">
            {filteredRules.map((rule) => (
              <div key={rule.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      {rule.title}
                    </h3>
                    <p className="text-neutral-600 mb-3">{rule.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-neutral-500 mr-2" />
                        <span className="text-sm text-neutral-700">
                          <strong>Time Limit:</strong> {rule.timeLimit}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 text-neutral-500 mr-2" />
                        <span className="text-sm text-neutral-700">
                          <strong>Charges:</strong> {rule.charges}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400 ml-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Refund Calculator */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
            <Calculator className="w-6 h-6 mr-2" />
            Refund Calculator
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Ticket Price (₹)
              </label>
              <input
                type="number"
                value={calculatorData.ticketPrice}
                onChange={(e) => setCalculatorData({...calculatorData, ticketPrice: e.target.value})}
                placeholder="Enter ticket price"
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Hours before departure
              </label>
              <input
                type="number"
                value={calculatorData.cancellationTime}
                onChange={(e) => setCalculatorData({...calculatorData, cancellationTime: e.target.value})}
                placeholder="Hours before departure"
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Ticket Type
              </label>
              <select
                value={calculatorData.ticketType}
                onChange={(e) => setCalculatorData({...calculatorData, ticketType: e.target.value})}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {ticketTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button
              onClick={calculateRefund}
              className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              Calculate Refund
            </button>

            {calculatedRefund !== null && (
              <div className="bg-accent-50 border border-accent-200 rounded-xl p-4">
                <div className="text-sm text-accent-700 mb-1">Estimated Refund Amount</div>
                <div className="text-2xl font-bold text-accent-800">
                  ₹{calculatedRefund.toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
            <AlertCircle className="w-6 h-6 mr-2 text-orange-600" />
            Important Notes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">General Rules</h3>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-start">
                  <ChevronRight className="w-4 h-4 mt-0.5 mr-2 text-orange-600" />
                  Refunds are processed to the original payment method
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-4 h-4 mt-0.5 mr-2 text-orange-600" />
                  Processing time: 3-7 working days for online payments
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-4 h-4 mt-0.5 mr-2 text-orange-600" />
                  No refund for tickets cancelled after chart preparation
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-4 h-4 mt-0.5 mr-2 text-orange-600" />
                  Full refund in case of train cancellation by railways
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">Special Cases</h3>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-start">
                  <ChevronRight className="w-4 h-4 mt-0.5 mr-2 text-orange-600" />
                  Tatkal tickets: No refund except train cancellation
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-4 h-4 mt-0.5 mr-2 text-orange-600" />
                  Premium trains may have different cancellation rules
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-4 h-4 mt-0.5 mr-2 text-orange-600" />
                  Group bookings have separate refund policies
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-4 h-4 mt-0.5 mr-2 text-orange-600" />
                  Medical emergency cancellations may get special consideration
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-soft p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Need Help with Refunds?</h2>
          <p className="text-primary-100 mb-6">
            Our support team can help you with refund queries and special cases
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-neutral-100 transition-colors">
              Contact Support
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-colors">
              View Help Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundRules;
