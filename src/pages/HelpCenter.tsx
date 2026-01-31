import React, { useState } from 'react';
import { Search, HelpCircle, Phone, Mail, MessageCircle, ChevronDown, ChevronRight } from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'booking', label: 'Booking & Tickets' },
    { value: 'payment', label: 'Payment & Refunds' },
    { value: 'travel', label: 'Travel Information' },
    { value: 'account', label: 'Account & Profile' },
    { value: 'technical', label: 'Technical Issues' }
  ];

  const faqs: FAQ[] = [
    {
      id: 1,
      question: 'How do I book a train ticket online?',
      answer: 'To book a train ticket online: 1) Go to the Book Tickets page, 2) Select your departure and destination stations, 3) Choose your travel date and class, 4) Search for available trains, 5) Select your preferred train, 6) Fill in passenger details, 7) Make payment to confirm your booking.',
      category: 'booking'
    },
    {
      id: 2,
      question: 'What is PNR and how do I check my ticket status?',
      answer: 'PNR (Passenger Name Record) is a 10-digit number that uniquely identifies your booking. You can check your ticket status by going to the PNR Status page and entering your PNR number. This will show you confirmation status, seat numbers, and other booking details.',
      category: 'booking'
    },
    {
      id: 3,
      question: 'How can I cancel my ticket and get a refund?',
      answer: 'To cancel your ticket: 1) Go to your bookings section, 2) Select the ticket you want to cancel, 3) Click on cancel ticket, 4) Confirm cancellation. Refund will be processed according to railway refund rules. Cancellation charges may apply based on the time of cancellation.',
      category: 'payment'
    },
    {
      id: 4,
      question: 'What payment methods are accepted?',
      answer: 'We accept various payment methods including Credit Cards (Visa, MasterCard, American Express), Debit Cards, Net Banking, UPI payments (Google Pay, PhonePe, Paytm), and Digital Wallets. All transactions are secured with 256-bit SSL encryption.',
      category: 'payment'
    },
    {
      id: 5,
      question: 'What documents do I need to carry while traveling?',
      answer: 'You must carry a valid photo ID proof such as Aadhaar Card, Passport, Driving License, Voter ID, or PAN Card. The ID should match the name on your ticket. For online bookings, you can show the ticket on your mobile phone or carry a printout.',
      category: 'travel'
    },
    {
      id: 6,
      question: 'How early should I reach the station?',
      answer: 'We recommend reaching the station at least 30 minutes before departure for regular trains and 45 minutes for premium trains like Rajdhani, Shatabdi, and Duronto. This allows time for security checks and finding your coach.',
      category: 'travel'
    },
    {
      id: 7,
      question: 'How do I create an account?',
      answer: 'To create an account: 1) Click on Register/Sign Up, 2) Fill in your personal details including name, email, and phone number, 3) Create a strong password, 4) Verify your email address through the verification link sent to your email, 5) Your account will be activated and ready to use.',
      category: 'account'
    },
    {
      id: 8,
      question: 'I forgot my password. How do I reset it?',
      answer: 'To reset your password: 1) Go to the login page, 2) Click on "Forgot Password", 3) Enter your registered email address, 4) Check your email for a password reset link, 5) Click the link and create a new password, 6) Use your new password to log in.',
      category: 'account'
    },
    {
      id: 9,
      question: 'The website is not loading properly. What should I do?',
      answer: 'If you\'re experiencing technical issues: 1) Clear your browser cache and cookies, 2) Try using a different browser, 3) Check your internet connection, 4) Disable browser extensions temporarily, 5) Try accessing from incognito/private mode. If issues persist, contact our support team.',
      category: 'technical'
    },
    {
      id: 10,
      question: 'What is Tatkal booking and how does it work?',
      answer: 'Tatkal booking allows you to book tickets at short notice with additional charges. Tatkal booking opens 1 day before journey date (excluding date of journey) at 10:00 AM for AC classes and 11:00 AM for Non-AC classes. Additional Tatkal charges apply.',
      category: 'booking'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-neutral-900 mb-4">
            Help Center
          </h1>
          <p className="text-lg text-neutral-600">
            Find answers to frequently asked questions and get support
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <Search className="inline w-4 h-4 mr-1" />
                Search FAQs
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help topics..."
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <Phone className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Call Support</h3>
            <p className="text-neutral-600 mb-4">Get immediate assistance from our support team</p>
            <div className="text-primary-600 font-semibold">139 (Railway Helpline)</div>
            <div className="text-sm text-neutral-500">24/7 Available</div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <Mail className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Email Support</h3>
            <p className="text-neutral-600 mb-4">Send us your queries via email</p>
            <div className="text-primary-600 font-semibold">support@railway.com</div>
            <div className="text-sm text-neutral-500">Response within 24 hours</div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <MessageCircle className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Live Chat</h3>
            <p className="text-neutral-600 mb-4">Chat with our support agents</p>
            <button className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors">
              Start Chat
            </button>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="p-6 border-b border-neutral-200">
            <h2 className="text-2xl font-bold text-neutral-900 flex items-center">
              <HelpCircle className="w-6 h-6 mr-2" />
              Frequently Asked Questions
            </h2>
            <p className="text-neutral-600 mt-2">
              {filteredFAQs.length} question(s) found
            </p>
          </div>

          <div className="divide-y divide-neutral-200">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className="p-6">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                      {faq.question}
                    </h3>
                    <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                      {categories.find(c => c.value === faq.category)?.label}
                    </span>
                  </div>
                  <div className="ml-4">
                    {expandedFAQ === faq.id ? (
                      <ChevronDown className="w-5 h-5 text-neutral-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-neutral-500" />
                    )}
                  </div>
                </button>

                {expandedFAQ === faq.id && (
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <p className="text-neutral-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="p-12 text-center">
              <HelpCircle className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No FAQs Found</h3>
              <p className="text-neutral-600">
                Try adjusting your search terms or category filter
              </p>
            </div>
          )}
        </div>

        {/* Additional Resources */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mt-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Additional Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-primary-600 hover:text-primary-700 flex items-center">
                    <ChevronRight className="w-4 h-4 mr-1" />
                    How to Book Tickets
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary-600 hover:text-primary-700 flex items-center">
                    <ChevronRight className="w-4 h-4 mr-1" />
                    Cancellation & Refund Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary-600 hover:text-primary-700 flex items-center">
                    <ChevronRight className="w-4 h-4 mr-1" />
                    Travel Guidelines
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary-600 hover:text-primary-700 flex items-center">
                    <ChevronRight className="w-4 h-4 mr-1" />
                    Station Information
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Emergency Contacts</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-neutral-500 mr-2" />
                  <div>
                    <div className="font-medium">Railway Protection Force</div>
                    <div className="text-sm text-neutral-600">182</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-neutral-500 mr-2" />
                  <div>
                    <div className="font-medium">Medical Emergency</div>
                    <div className="text-sm text-neutral-600">108</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-neutral-500 mr-2" />
                  <div>
                    <div className="font-medium">General Emergency</div>
                    <div className="text-sm text-neutral-600">112</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Still Need Help */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-soft p-8 mt-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-primary-100 mb-6">
            Can't find what you're looking for? Our support team is here to help you.
          </p>
          <button className="bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-neutral-100 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
