import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  category: string;
  message: string;
  priority: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: 'general',
    message: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'booking', label: 'Booking Issues' },
    { value: 'payment', label: 'Payment & Refunds' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'feedback', label: 'Feedback & Suggestions' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-red-600' }
  ];

  const mockTickets: SupportTicket[] = [
    {
      id: 'TKT-2024-001',
      subject: 'Refund not received',
      status: 'in-progress',
      priority: 'high',
      createdAt: '2024-01-15'
    },
    {
      id: 'TKT-2024-002',
      subject: 'Booking confirmation issue',
      status: 'resolved',
      priority: 'medium',
      createdAt: '2024-01-10'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock ticket ID
    const newTicketId = `TKT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    setTicketId(newTicketId);
    setSubmitSuccess(true);
    setIsSubmitting(false);

    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      category: 'general',
      message: '',
      priority: 'medium'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-50';
      case 'in-progress': return 'text-yellow-600 bg-yellow-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      default: return 'text-neutral-600 bg-neutral-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-neutral-600 bg-neutral-50';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-neutral-900 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-neutral-600">
            Get in touch with our support team. We're here to help you with any questions or issues.
          </p>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-green-900">Support Ticket Created Successfully!</h3>
                <p className="text-green-700 mt-1">
                  Your ticket ID is <strong>{ticketId}</strong>. We'll respond within 24 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-soft p-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center">
                <MessageCircle className="w-6 h-6 mr-2" />
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Please provide detailed information about your issue or question..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Existing Tickets */}
            <div className="bg-white rounded-2xl shadow-soft p-8 mt-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Your Support Tickets</h2>
              
              {mockTickets.length > 0 ? (
                <div className="space-y-4">
                  {mockTickets.map(ticket => (
                    <div key={ticket.id} className="border border-neutral-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="font-semibold text-neutral-900 mr-3">{ticket.id}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('-', ' ').toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-neutral-500">{ticket.createdAt}</span>
                      </div>
                      <p className="text-neutral-700">{ticket.subject}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-600">No support tickets found</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Get in Touch</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-primary-600 mt-1 mr-3" />
                  <div>
                    <div className="font-semibold text-neutral-900">Phone Support</div>
                    <div className="text-neutral-600">139 (Railway Helpline)</div>
                    <div className="text-sm text-neutral-500">24/7 Available</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-primary-600 mt-1 mr-3" />
                  <div>
                    <div className="font-semibold text-neutral-900">Email Support</div>
                    <div className="text-neutral-600">support@railway.com</div>
                    <div className="text-sm text-neutral-500">Response within 24 hours</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-primary-600 mt-1 mr-3" />
                  <div>
                    <div className="font-semibold text-neutral-900">Office Address</div>
                    <div className="text-neutral-600">Railway Bhawan<br />New Delhi, India</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-primary-600 mt-1 mr-3" />
                  <div>
                    <div className="font-semibold text-neutral-900">Business Hours</div>
                    <div className="text-neutral-600">Mon - Fri: 9:00 AM - 6:00 PM</div>
                    <div className="text-neutral-600">Sat - Sun: 10:00 AM - 4:00 PM</div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-gradient-to-r from-accent-50 to-accent-100 border border-accent-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-accent-900 mb-3">Need Quick Answers?</h3>
              <p className="text-accent-700 mb-4">
                Check our FAQ section for instant answers to common questions.
              </p>
              <button className="bg-accent-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-accent-700 transition-colors">
                View FAQ
              </button>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-6">
              <div className="flex items-center mb-3">
                <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold text-red-900">Emergency Contact</h3>
              </div>
              <p className="text-red-700 mb-4">
                For urgent travel emergencies or safety concerns
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-red-600 mr-2" />
                  <span className="font-semibold text-red-800">Railway Protection Force: 182</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-red-600 mr-2" />
                  <span className="font-semibold text-red-800">Medical Emergency: 108</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
