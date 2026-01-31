import React from 'react';
import { FileText, Shield, AlertTriangle, Scale, Users, Clock } from 'lucide-react';

const TermsConditions: React.FC = () => {
  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: <FileText className="w-6 h-6" />,
      content: `By accessing and using this railway booking platform, you accept and agree to be bound by the terms and provision of this agreement. These terms apply to all visitors, users, and others who access or use the service.`
    },
    {
      id: 'services',
      title: 'Description of Services',
      icon: <Shield className="w-6 h-6" />,
      content: `Our platform provides online railway ticket booking services, PNR status checking, train schedules, fare enquiry, and related travel information services. We act as an intermediary between passengers and the railway authorities.`
    },
    {
      id: 'user-responsibilities',
      title: 'User Responsibilities',
      icon: <Users className="w-6 h-6" />,
      content: `Users are responsible for providing accurate information during booking, maintaining the confidentiality of their account credentials, and complying with all applicable laws and regulations. Users must not misuse the platform or engage in fraudulent activities.`
    },
    {
      id: 'booking-terms',
      title: 'Booking Terms',
      icon: <Clock className="w-6 h-6" />,
      content: `All bookings are subject to availability and confirmation by the railway authorities. Ticket prices, availability, and schedules are subject to change without notice. Cancellation and refund policies apply as per railway rules.`
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      icon: <AlertTriangle className="w-6 h-6" />,
      content: `We shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from the use of our services. Our liability is limited to the extent permitted by applicable law.`
    },
    {
      id: 'governing-law',
      title: 'Governing Law',
      icon: <Scale className="w-6 h-6" />,
      content: `These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in India.`
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-neutral-900 mb-4">
            Terms & Conditions
          </h1>
          <p className="text-lg text-neutral-600">
            Please read these terms carefully before using our services
          </p>
          <div className="text-sm text-neutral-500 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Quick Summary */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Quick Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-primary-800 mb-2">What We Provide</h3>
              <ul className="text-primary-700 space-y-1">
                <li>• Online railway ticket booking</li>
                <li>• PNR status and train information</li>
                <li>• Secure payment processing</li>
                <li>• Customer support services</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-primary-800 mb-2">Your Responsibilities</h3>
              <ul className="text-primary-700 space-y-1">
                <li>• Provide accurate information</li>
                <li>• Follow railway rules and regulations</li>
                <li>• Maintain account security</li>
                <li>• Use services lawfully</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Detailed Terms */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={section.id} className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-900 flex items-center">
                  <div className="text-primary-600 mr-3">
                    {section.icon}
                  </div>
                  {index + 1}. {section.title}
                </h2>
              </div>
              <div className="p-6">
                <p className="text-neutral-700 leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Terms Content */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mt-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Detailed Terms</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">7. Account Registration</h3>
              <div className="text-neutral-700 space-y-3">
                <p>To access certain features of our service, you must register for an account. You agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">8. Payment Terms</h3>
              <div className="text-neutral-700 space-y-3">
                <p>Payment for services must be made in advance. We accept various payment methods including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Credit and debit cards</li>
                  <li>Net banking</li>
                  <li>UPI and digital wallets</li>
                  <li>Other payment methods as available</li>
                </ul>
                <p>All payments are processed securely through encrypted channels. Refunds are subject to our refund policy and railway rules.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">9. Cancellation and Refunds</h3>
              <div className="text-neutral-700 space-y-3">
                <p>Cancellation and refund policies are governed by Indian Railway rules:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Cancellation charges apply based on the time of cancellation</li>
                  <li>No refund for Tatkal tickets except in case of train cancellation</li>
                  <li>Refunds are processed to the original payment method</li>
                  <li>Processing time may vary from 3-7 working days</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">10. Privacy and Data Protection</h3>
              <div className="text-neutral-700 space-y-3">
                <p>We are committed to protecting your privacy and personal data:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Personal information is collected and used as per our Privacy Policy</li>
                  <li>Data is stored securely and not shared with unauthorized parties</li>
                  <li>You have rights regarding your personal data as per applicable laws</li>
                  <li>We comply with data protection regulations</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">11. Prohibited Uses</h3>
              <div className="text-neutral-700 space-y-3">
                <p>You may not use our service for any unlawful purpose or to solicit others to perform unlawful acts. Prohibited activities include:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Fraudulent booking or payment activities</li>
                  <li>Attempting to gain unauthorized access to our systems</li>
                  <li>Using automated systems to make bookings</li>
                  <li>Reselling tickets for commercial purposes without authorization</li>
                  <li>Violating any applicable laws or regulations</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">12. Service Availability</h3>
              <div className="text-neutral-700 space-y-3">
                <p>While we strive to maintain service availability:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Services may be temporarily unavailable due to maintenance</li>
                  <li>We do not guarantee uninterrupted access to our platform</li>
                  <li>Railway data and availability are subject to change</li>
                  <li>We reserve the right to modify or discontinue services</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">13. Modifications to Terms</h3>
              <div className="text-neutral-700 space-y-3">
                <p>We reserve the right to modify these terms at any time:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Changes will be posted on this page with updated date</li>
                  <li>Continued use of services constitutes acceptance of modified terms</li>
                  <li>Material changes may be communicated via email or platform notifications</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-soft p-8 mt-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Questions About These Terms?</h2>
          <p className="text-primary-100 mb-6">
            If you have any questions about these Terms & Conditions, please contact us
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-neutral-100 transition-colors">
              Contact Support
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-colors">
              View Privacy Policy
            </button>
          </div>
        </div>

        {/* Agreement Confirmation */}
        <div className="bg-neutral-100 rounded-2xl p-6 mt-8 text-center">
          <p className="text-neutral-700">
            By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
