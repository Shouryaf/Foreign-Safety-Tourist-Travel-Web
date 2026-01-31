import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, TrendingUp, Globe, Calculator, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExchangeRate {
  currency: string;
  name: string;
  rate: number;
  flag: string;
  symbol: string;
}

interface CurrencyConverterProps {
  onConvert?: (amount: number, fromCurrency: string, toCurrency: string, convertedAmount: number) => void;
  showAddToWallet?: boolean;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ onConvert, showAddToWallet = false }) => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock exchange rates (in production, this would come from a real API)
  const exchangeRates: ExchangeRate[] = [
    { currency: 'USD', name: 'US Dollar', rate: 83.25, flag: '🇺🇸', symbol: '$' },
    { currency: 'EUR', name: 'Euro', rate: 90.15, flag: '🇪🇺', symbol: '€' },
    { currency: 'GBP', name: 'British Pound', rate: 105.50, flag: '🇬🇧', symbol: '£' },
    { currency: 'JPY', name: 'Japanese Yen', rate: 0.56, flag: '🇯🇵', symbol: '¥' },
    { currency: 'AUD', name: 'Australian Dollar', rate: 54.75, flag: '🇦🇺', symbol: 'A$' },
    { currency: 'CAD', name: 'Canadian Dollar', rate: 61.20, flag: '🇨🇦', symbol: 'C$' },
    { currency: 'CHF', name: 'Swiss Franc', rate: 92.80, flag: '🇨🇭', symbol: 'CHF' },
    { currency: 'CNY', name: 'Chinese Yuan', rate: 11.45, flag: '🇨🇳', symbol: '¥' },
    { currency: 'SGD', name: 'Singapore Dollar', rate: 61.85, flag: '🇸🇬', symbol: 'S$' },
    { currency: 'AED', name: 'UAE Dirham', rate: 22.65, flag: '🇦🇪', symbol: 'د.إ' },
    { currency: 'SAR', name: 'Saudi Riyal', rate: 22.20, flag: '🇸🇦', symbol: 'ر.س' },
    { currency: 'KWD', name: 'Kuwaiti Dinar', rate: 270.45, flag: '🇰🇼', symbol: 'د.ك' },
    { currency: 'INR', name: 'Indian Rupee', rate: 1.00, flag: '🇮🇳', symbol: '₹' }
  ];

  const getCurrencyInfo = (currencyCode: string) => {
    return exchangeRates.find(rate => rate.currency === currencyCode) || exchangeRates[0];
  };

  const convertCurrency = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const fromRate = getCurrencyInfo(fromCurrency).rate;
      const toRate = getCurrencyInfo(toCurrency).rate;
      
      let result: number;
      
      if (fromCurrency === 'INR') {
        // Converting from INR to other currency
        result = parseFloat(amount) / toRate;
      } else if (toCurrency === 'INR') {
        // Converting to INR from other currency
        result = parseFloat(amount) * fromRate;
      } else {
        // Converting between two foreign currencies via INR
        const inrAmount = parseFloat(amount) * fromRate;
        result = inrAmount / toRate;
      }
      
      setConvertedAmount(result);
      setLastUpdated(new Date());
      setLoading(false);
      
      if (onConvert) {
        onConvert(parseFloat(amount), fromCurrency, toCurrency, result);
      }
      
      toast.success('Currency converted successfully!');
    }, 1000);
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount('');
    setConvertedAmount(0);
  };

  const refreshRates = () => {
    setLoading(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setLoading(false);
      toast.success('Exchange rates updated!');
    }, 1000);
  };

  const handleAddToWallet = () => {
    if (toCurrency !== 'INR') {
      toast.error('Can only add INR to wallet');
      return;
    }
    
    if (convertedAmount <= 0) {
      toast.error('Please convert currency first');
      return;
    }

    // This would integrate with the wallet system
    toast.success(`₹${convertedAmount.toFixed(2)} will be added to your wallet after payment confirmation`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Globe className="w-6 h-6 text-primary-600 mr-2" />
          <h3 className="text-xl font-bold text-neutral-900">Currency Converter</h3>
        </div>
        <button
          onClick={refreshRates}
          disabled={loading}
          className="flex items-center text-sm text-neutral-600 hover:text-primary-600 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh Rates
        </button>
      </div>

      {/* Currency Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* From Currency */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">From</label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {exchangeRates.map((rate) => (
              <option key={rate.currency} value={rate.currency}>
                {rate.flag} {rate.currency} - {rate.name}
              </option>
            ))}
          </select>
        </div>

        {/* To Currency */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">To</label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {exchangeRates.map((rate) => (
              <option key={rate.currency} value={rate.currency}>
                {rate.flag} {rate.currency} - {rate.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-2">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
            {getCurrencyInfo(fromCurrency).symbol}
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={swapCurrencies}
          className="bg-neutral-100 hover:bg-neutral-200 p-3 rounded-full transition-colors"
        >
          <ArrowRightLeft className="w-5 h-5 text-neutral-600" />
        </button>
      </div>

      {/* Convert Button */}
      <button
        onClick={convertCurrency}
        disabled={loading || !amount}
        className="w-full bg-primary-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center mb-6"
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Converting...
          </div>
        ) : (
          <>
            <Calculator className="w-5 h-5 mr-2" />
            Convert Currency
          </>
        )}
      </button>

      {/* Conversion Result */}
      {convertedAmount > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
          <div className="text-center">
            <div className="text-sm text-neutral-600 mb-2">
              {getCurrencyInfo(fromCurrency).symbol}{parseFloat(amount).toLocaleString()} {fromCurrency} =
            </div>
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {getCurrencyInfo(toCurrency).symbol}{convertedAmount.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })} {toCurrency}
            </div>
            <div className="text-xs text-neutral-500">
              Rate: 1 {fromCurrency} = {getCurrencyInfo(fromCurrency).rate} INR
            </div>
          </div>
        </div>
      )}

      {/* Add to Wallet Button */}
      {showAddToWallet && convertedAmount > 0 && toCurrency === 'INR' && (
        <button
          onClick={handleAddToWallet}
          className="w-full bg-accent-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-accent-700 transition-colors flex items-center justify-center mb-4"
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          Add ₹{convertedAmount.toFixed(2)} to Wallet
        </button>
      )}

      {/* Exchange Rate Info */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <span>Last updated:</span>
          <span>{lastUpdated.toLocaleTimeString()}</span>
        </div>
        <div className="mt-2 text-xs text-neutral-500">
          * Rates are indicative and may vary at the time of actual transaction
        </div>
      </div>

      {/* Popular Currency Pairs */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-neutral-700 mb-3">Popular Conversions to INR</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { from: 'USD', rate: 83.25 },
            { from: 'EUR', rate: 90.15 },
            { from: 'GBP', rate: 105.50 },
            { from: 'AED', rate: 22.65 }
          ].map((pair) => (
            <button
              key={pair.from}
              onClick={() => {
                setFromCurrency(pair.from);
                setToCurrency('INR');
                setAmount('1');
              }}
              className="text-left p-2 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="text-xs text-neutral-600">1 {pair.from}</div>
              <div className="font-medium text-neutral-900">₹{pair.rate}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
