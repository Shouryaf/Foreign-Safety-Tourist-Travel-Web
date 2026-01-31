import React, { useState, useEffect } from 'react';
import { Wallet, Plus, CreditCard, Smartphone, ArrowUpRight, ArrowDownLeft, History, Shield, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import CurrencyConverter from '../components/CurrencyConverter/CurrencyConverter';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletData {
  balance: number;
  transactions: Transaction[];
}

const EWallet: React.FC = () => {
  const [walletData, setWalletData] = useState<WalletData>({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showCurrencyConverter, setShowCurrencyConverter] = useState(false);
  const [processingTransaction, setProcessingTransaction] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWalletData(response.data);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      // Mock data for demo
      setWalletData({
        balance: 2500,
        transactions: [
          {
            id: '1',
            type: 'debit',
            amount: 450,
            description: 'Train Booking - Delhi to Mumbai',
            date: '2024-01-15T10:30:00Z',
            status: 'completed'
          },
          {
            id: '2',
            type: 'credit',
            amount: 1000,
            description: 'Wallet Top-up via UPI',
            date: '2024-01-14T15:45:00Z',
            status: 'completed'
          },
          {
            id: '3',
            type: 'debit',
            amount: 280,
            description: 'Bus Booking - Delhi to Jaipur',
            date: '2024-01-13T09:15:00Z',
            status: 'completed'
          },
          {
            id: '4',
            type: 'credit',
            amount: 500,
            description: 'Refund - Cancelled Flight',
            date: '2024-01-12T14:20:00Z',
            status: 'completed'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async () => {
    const amount = parseFloat(addMoneyAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount < 10) {
      toast.error('Minimum amount is ₹10');
      return;
    }

    if (amount > 50000) {
      toast.error('Maximum amount is ₹50,000');
      return;
    }

    setProcessingTransaction(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/wallet/add-money`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Simulate payment processing
      setTimeout(() => {
        setWalletData(prev => ({
          ...prev,
          balance: prev.balance + amount,
          transactions: [
            {
              id: Date.now().toString(),
              type: 'credit',
              amount,
              description: 'Wallet Top-up',
              date: new Date().toISOString(),
              status: 'completed'
            },
            ...prev.transactions
          ]
        }));
        toast.success(`₹${amount} added to wallet successfully!`);
        setAddMoneyAmount('');
        setShowAddMoney(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding money:', error);
      toast.error('Failed to add money to wallet');
    } finally {
      setProcessingTransaction(false);
    }
  };

  const handleCurrencyConversion = (amount: number, fromCurrency: string, toCurrency: string, convertedAmount: number) => {
    if (toCurrency === 'INR') {
      // Add converted amount to wallet
      setWalletData(prev => ({
        ...prev,
        balance: prev.balance + convertedAmount,
        transactions: [
          {
            id: Date.now().toString(),
            type: 'credit',
            amount: convertedAmount,
            description: `Currency Conversion: ${amount} ${fromCurrency} → ₹${convertedAmount.toFixed(2)}`,
            date: new Date().toISOString(),
            status: 'completed'
          },
          ...prev.transactions
        ]
      }));
      toast.success(`₹${convertedAmount.toFixed(2)} added to wallet from ${fromCurrency} conversion!`);
      setShowCurrencyConverter(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? (
      <ArrowDownLeft className="w-5 h-5 text-green-600" />
    ) : (
      <ArrowUpRight className="w-5 h-5 text-red-600" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-neutral-900 mb-4">
            My E-Wallet
          </h1>
          <p className="text-lg text-neutral-600">
            Manage your digital wallet for seamless bookings
          </p>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-soft p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Wallet className="w-8 h-8 mr-3" />
                <h2 className="text-2xl font-bold">Wallet Balance</h2>
              </div>
              <div className="text-4xl font-bold mb-2">₹{walletData.balance.toLocaleString()}</div>
              <p className="text-primary-100">Available for bookings</p>
            </div>
            <div className="text-right">
              <button
                onClick={() => setShowAddMoney(true)}
                className="bg-white text-primary-600 px-6 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Money
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Add Money</h3>
            <p className="text-sm text-neutral-600 mb-4">Top up your wallet instantly</p>
            <button
              onClick={() => setShowAddMoney(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Add Funds
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Currency Exchange</h3>
            <p className="text-sm text-neutral-600 mb-4">Convert foreign currency to INR</p>
            <button
              onClick={() => setShowCurrencyConverter(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
            >
              Convert Currency
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Transaction History</h3>
            <p className="text-sm text-neutral-600 mb-4">View all your transactions</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              View History
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-neutral-900 mb-2">Security</h3>
            <p className="text-sm text-neutral-600 mb-4">Secure & encrypted payments</p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
              Settings
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-soft p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Recent Transactions</h2>
          
          {walletData.transactions.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {walletData.transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl hover:border-primary-300 transition-colors">
                  <div className="flex items-center">
                    <div className="mr-4">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900">{transaction.description}</h4>
                      <p className="text-sm text-neutral-600">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Money Modal */}
        {showAddMoney && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Add Money to Wallet</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={addMoneyAmount}
                  onChange={(e) => setAddMoneyAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="10"
                  max="50000"
                />
                <p className="text-xs text-neutral-500 mt-1">Minimum: ₹10, Maximum: ₹50,000</p>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[100, 500, 1000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setAddMoneyAmount(amount.toString())}
                    className="py-2 px-4 border border-neutral-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h4 className="font-medium text-neutral-900 mb-3">Payment Method</h4>
                <div className="space-y-2">
                  <div className="flex items-center p-3 border border-neutral-200 rounded-lg">
                    <CreditCard className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-sm">Credit/Debit Card</span>
                  </div>
                  <div className="flex items-center p-3 border border-neutral-200 rounded-lg">
                    <Smartphone className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-sm">UPI</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowAddMoney(false)}
                  className="flex-1 py-3 px-6 border border-neutral-300 rounded-xl font-semibold hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMoney}
                  disabled={processingTransaction || !addMoneyAmount}
                  className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {processingTransaction ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Add Money'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Currency Converter Modal */}
        {showCurrencyConverter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-neutral-900">Currency Converter</h3>
                  <button
                    onClick={() => setShowCurrencyConverter(false)}
                    className="text-neutral-500 hover:text-neutral-700"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-neutral-600 mt-2">Convert foreign currency and add INR to your wallet</p>
              </div>
              <div className="p-6">
                <CurrencyConverter 
                  onConvert={handleCurrencyConversion}
                  showAddToWallet={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EWallet;
