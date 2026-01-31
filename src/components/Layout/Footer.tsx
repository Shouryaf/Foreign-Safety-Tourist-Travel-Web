import React from 'react';
import { Link } from 'react-router-dom';
import { Train, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Train className="h-8 w-8 text-orange-400" />
              <div>
                <div className="text-xl font-bold">Indian Railways</div>
                <div className="text-sm text-gray-400">Lifeline of the Nation</div>
              </div>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Connecting every corner of India with safe, reliable, and affordable rail transportation. 
              Book your journey with confidence on India's largest railway network.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-orange-400" />
                <span>Railway Helpline: 139</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/transport/train" className="hover:text-white transition-colors">Book Tickets</Link></li>
              <li><Link to="/pnr-status" className="hover:text-white transition-colors">PNR Status</Link></li>
              <li><Link to="/find-stations" className="hover:text-white transition-colors">Find Stations</Link></li>
              <li><Link to="/transport/train" className="hover:text-white transition-colors">Train Schedule</Link></li>
              <li><Link to="/fare-enquiry" className="hover:text-white transition-colors">Fare Enquiry</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/features" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/bookings" className="hover:text-white transition-colors">Refund Rules</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Indian Railways. All rights reserved. | Powered by Railway Innovation
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Mail className="h-4 w-4" />
                <span>care@indianrailways.gov.in</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>Ministry of Railways, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}