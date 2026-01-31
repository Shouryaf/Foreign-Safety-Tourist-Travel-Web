import React from 'react';
import { Shield, Eye, Lock, Database, UserCheck, Globe } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: <Database className="w-6 h-6" />,
      content: `We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support. This includes personal information like name, email, phone number, and payment details.`
    },
    {
      id: 'information-use',
      title: 'How We Use Your Information',
      icon: <UserCheck className="w-6 h-6" />,
      content: `We use your information to provide and improve our services, process bookings, communicate with you, ensure security, and comply with legal obligations. We do not sell your personal information to third parties.`
    },
    {
      id: 'information-sharing',
      title: 'Information Sharing',
      icon: <Globe className="w-6 h-6" />,
      content: `We may share your information with railway authorities for booking purposes, payment processors for transactions, and service providers who assist us in operating our platform, all under strict confidentiality agreements.`
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: <Lock className="w-6 h-6" />,
      content: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All sensitive data is encrypted in transit and at rest.`
    },
    {
      id: 'your-rights',
      title: 'Your Rights',
      icon: <Eye className="w-6 h-6" />,
      content: `You have the right to access, update, or delete your personal information. You can also opt out of certain communications and request data portability. Contact us to exercise these rights.`
    },
    {
      id: 'data-retention',
      title: 'Data Retention',
      icon: <Shield className="w-6 h-6" />,
      content: `We retain your personal information only as long as necessary to provide our services and comply with legal obligations. Booking records may be retained for longer periods as required by railway regulations.`
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-neutral-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-neutral-600">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <div className="text-sm text-neutral-500 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Privacy Commitment */}
        <div className="bg-gradient-to-r from-accent-50 to-accent-100 border border-accent-200 rounded-2xl p-8 mb-8">
          <div className="flex items-center mb-4">
            <Shield className="w-8 h-8 text-accent-600 mr-3" />
            <h2 className="text-2xl font-bold text-accent-900">Our Privacy Commitment</h2>
          </div>
          <p className="text-accent-800 leading-relaxed">
            We are committed to protecting your privacy and ensuring the security of your personal information. 
            We follow industry best practices and comply with applicable data protection laws to safeguard your data.
          </p>
        </div>

        {/* Key Privacy Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <Lock className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Secure by Design</h3>
            <p className="text-neutral-600">All data is encrypted and stored securely using industry standards</p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <Eye className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Transparency</h3>
            <p className="text-neutral-600">Clear information about what data we collect and how we use it</p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 text-center">
            <UserCheck className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">User Control</h3>
            <p className="text-neutral-600">You have full control over your personal information and privacy settings</p>
          </div>
        </div>

        {/* Privacy Sections */}
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

        {/* Detailed Privacy Information */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mt-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Detailed Privacy Information</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Types of Information We Collect</h3>
              <div className="text-neutral-700 space-y-3">
                <div>
                  <h4 className="font-semibold mb-2">Personal Information:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Name, email address, phone number</li>
                    <li>Date of birth and gender (for booking purposes)</li>
                    <li>Government ID details (as required by railway regulations)</li>
                    <li>Payment information (processed securely through payment gateways)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Usage Information:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Booking history and preferences</li>
                    <li>Website usage patterns and interactions</li>
                    <li>Device information and IP address</li>
                    <li>Location data (when permission is granted)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Cookies and Tracking Technologies</h3>
              <div className="text-neutral-700 space-y-3">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze website performance and usage</li>
                  <li>Provide personalized content and recommendations</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
                <p>You can control cookie settings through your browser preferences.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Third-Party Services</h3>
              <div className="text-neutral-700 space-y-3">
                <p>We work with trusted third-party services including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Payment Processors:</strong> To securely process payments</li>
                  <li><strong>Railway Authorities:</strong> To complete bookings and provide services</li>
                  <li><strong>Analytics Providers:</strong> To understand website usage</li>
                  <li><strong>Customer Support Tools:</strong> To provide better support</li>
                </ul>
                <p>All third parties are bound by strict data protection agreements.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">International Data Transfers</h3>
              <div className="text-neutral-700 space-y-3">
                <p>Your information may be transferred to and processed in countries other than your own. We ensure that:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Adequate protection measures are in place</li>
                  <li>Data is transferred only to countries with adequate protection laws</li>
                  <li>Appropriate safeguards are implemented for all transfers</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Children's Privacy</h3>
              <div className="text-neutral-700 space-y-3">
                <p>Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">Changes to This Policy</h3>
              <div className="text-neutral-700 space-y-3">
                <p>We may update this privacy policy from time to time. We will:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Post the updated policy on this page</li>
                  <li>Update the "Last updated" date</li>
                  <li>Notify you of significant changes via email or platform notification</li>
                  <li>Obtain your consent for material changes where required by law</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Your Privacy Rights */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mt-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Your Privacy Rights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">Access & Control</h3>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-start">
                  <UserCheck className="w-4 h-4 mt-0.5 mr-2 text-primary-600" />
                  Access your personal information
                </li>
                <li className="flex items-start">
                  <UserCheck className="w-4 h-4 mt-0.5 mr-2 text-primary-600" />
                  Update or correct your data
                </li>
                <li className="flex items-start">
                  <UserCheck className="w-4 h-4 mt-0.5 mr-2 text-primary-600" />
                  Delete your account and data
                </li>
                <li className="flex items-start">
                  <UserCheck className="w-4 h-4 mt-0.5 mr-2 text-primary-600" />
                  Export your data
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">Communication Preferences</h3>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-start">
                  <Eye className="w-4 h-4 mt-0.5 mr-2 text-primary-600" />
                  Opt out of marketing emails
                </li>
                <li className="flex items-start">
                  <Eye className="w-4 h-4 mt-0.5 mr-2 text-primary-600" />
                  Control notification settings
                </li>
                <li className="flex items-start">
                  <Eye className="w-4 h-4 mt-0.5 mr-2 text-primary-600" />
                  Manage cookie preferences
                </li>
                <li className="flex items-start">
                  <Eye className="w-4 h-4 mt-0.5 mr-2 text-primary-600" />
                  Restrict data processing
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-soft p-8 mt-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Questions About Your Privacy?</h2>
          <p className="text-primary-100 mb-6">
            If you have any questions about this Privacy Policy or want to exercise your rights, please contact us
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-neutral-100 transition-colors">
              Contact Privacy Team
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-colors">
              Data Protection Officer
            </button>
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-neutral-100 rounded-2xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Privacy Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-neutral-700">
            <div>
              <strong>Email:</strong> privacy@railway.com
            </div>
            <div>
              <strong>Phone:</strong> +91-11-2345-6789
            </div>
            <div>
              <strong>Address:</strong> Data Protection Officer, Railway Services, New Delhi, India
            </div>
            <div>
              <strong>Response Time:</strong> Within 30 days of request
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
