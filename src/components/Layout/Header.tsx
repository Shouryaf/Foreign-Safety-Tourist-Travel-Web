import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, User, Menu, X, Home, Search, Users2, Calendar, UserCircle, Sparkles, Train, Bus, Plane, Car, ChevronDown, AlertTriangle, Phone, MapPin, Eye, Camera, Heart, Zap, Navigation, Radio, Wifi, CheckCircle } from 'lucide-react';

interface HeaderProps {
  user?: any;
  onLogout?: () => void;
}

export default function Header({ user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTransportDropdownOpen, setIsTransportDropdownOpen] = useState(false);
  const [isSafetyDropdownOpen, setIsSafetyDropdownOpen] = useState(false);

  return (
    <header className="bg-blue-900 text-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Shield className="h-8 w-8 text-orange-400" />
            <div>
              <div className="text-xl font-bold">TrainXceralate</div>
              <div className="text-xs text-blue-200">Multi-Modal Transport Platform</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user && (
              <>
                <Link to="/dashboard" className="flex items-center space-x-1 hover:text-orange-400 transition-colors">
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                
                <div className="relative">
                  <button
                    onClick={() => setIsTransportDropdownOpen(!isTransportDropdownOpen)}
                    className="flex items-center space-x-1 hover:text-orange-400 transition-colors"
                  >
                    <Search className="h-5 w-5" />
                    <span>Transport</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {isTransportDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        to="/transport"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsTransportDropdownOpen(false)}
                      >
                        <Search className="h-4 w-4" />
                        <span>Search All</span>
                      </Link>
                      <Link
                        to="/train-booking"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsTransportDropdownOpen(false)}
                      >
                        <Train className="h-4 w-4" />
                        <span>Train Booking</span>
                      </Link>
                      <Link
                        to="/bus-booking"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsTransportDropdownOpen(false)}
                      >
                        <Bus className="h-4 w-4" />
                        <span>Bus Booking</span>
                      </Link>
                      <Link
                        to="/flight-booking"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsTransportDropdownOpen(false)}
                      >
                        <Plane className="h-4 w-4" />
                        <span>Flight Booking</span>
                      </Link>
                      <Link
                        to="/taxi-booking"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsTransportDropdownOpen(false)}
                      >
                        <Car className="h-4 w-4" />
                        <span>Taxi Booking</span>
                      </Link>
                      <Link
                        to="/metro-booking"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsTransportDropdownOpen(false)}
                      >
                        <Train className="h-4 w-4" />
                        <span>Metro Booking</span>
                      </Link>
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setIsSafetyDropdownOpen(!isSafetyDropdownOpen)}
                    className="flex items-center space-x-1 hover:text-orange-400 transition-colors"
                  >
                    <Shield className="h-5 w-5" />
                    <span>Safety</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {isSafetyDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                      {/* Emergency Services */}
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">Emergency Services</div>
                      <Link
                        to="/emergency-contacts"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsSafetyDropdownOpen(false)}
                      >
                        <Phone className="h-4 w-4 text-red-600" />
                        <span>Emergency Contacts</span>
                      </Link>
                      <Link
                        to="/safety-map"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsSafetyDropdownOpen(false)}
                      >
                        <MapPin className="h-4 w-4 text-red-600" />
                        <span>Danger Zone Map</span>
                      </Link>
                      <Link
                        to="/incident-reporting"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsSafetyDropdownOpen(false)}
                      >
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span>Incident Reporting</span>
                      </Link>
                      
                      {/* Personal Safety */}
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b mt-2">Personal Safety</div>
                      <Link
                        to="/health-monitoring"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsSafetyDropdownOpen(false)}
                      >
                        <Heart className="h-4 w-4 text-pink-600" />
                        <span>Health Monitoring</span>
                      </Link>
                      <Link
                        to="/location-tracking"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsSafetyDropdownOpen(false)}
                      >
                        <Navigation className="h-4 w-4 text-blue-600" />
                        <span>Location Tracking</span>
                      </Link>
                      <Link
                        to="/safety-checkins"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsSafetyDropdownOpen(false)}
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Safety Check-ins</span>
                      </Link>
                      
                      {/* Technology Safety */}
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b mt-2">Technology Safety</div>
                      <Link
                        to="/cctv-monitoring"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsSafetyDropdownOpen(false)}
                      >
                        <Camera className="h-4 w-4 text-green-600" />
                        <span>CCTV Monitoring</span>
                      </Link>
                      <Link
                        to="/emergency-radio"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsSafetyDropdownOpen(false)}
                      >
                        <Radio className="h-4 w-4 text-purple-600" />
                        <span>Emergency Radio</span>
                      </Link>
                      
                      {/* Communication Safety */}
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b mt-2">Communication</div>
                      <Link
                        to="/social"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsSafetyDropdownOpen(false)}
                      >
                        <Users2 className="h-4 w-4 text-teal-600" />
                        <span>Community Alerts</span>
                      </Link>
                    </div>
                  )}
                </div>
                
                <Link to="/social" className="flex items-center space-x-1 hover:text-orange-400 transition-colors">
                  <Users2 className="h-5 w-5" />
                  <span>Social Feed</span>
                </Link>
                
                <Link to="/booking-history" className="flex items-center space-x-1 hover:text-orange-400 transition-colors">
                  <Calendar className="h-5 w-5" />
                  <span>My Bookings</span>
                </Link>
                
                <Link to="/features" className="flex items-center space-x-1 hover:text-orange-400 transition-colors relative">
                  <Sparkles className="h-5 w-5" />
                  <span>New Features</span>
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold animate-pulse">NEW</span>
                </Link>
              </>
            )}
            
            {!user && (
              <Link to="/auth" className="hover:text-orange-400 transition-colors font-medium">
                Login / Register
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <Link to="/profile" className="flex items-center space-x-2 hover:text-orange-400 transition-colors">
                <UserCircle className="h-5 w-5" />
                <span className="text-sm">{user.name || user.email}</span>
              </Link>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/auth"
                  className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/auth"
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-blue-800 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-800">
            <nav className="flex flex-col space-y-2">
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-white hover:bg-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Home className="h-5 w-5" />
                      <span>Dashboard</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/transport"
                    className="block px-4 py-2 text-white hover:bg-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Search className="h-5 w-5" />
                      <span>Search All Transport</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/train-booking"
                    className="block px-4 py-2 text-white hover:bg-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Train className="h-5 w-5" />
                      <span>Train Booking</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/bus-booking"
                    className="block px-4 py-2 text-white hover:bg-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Bus className="h-5 w-5" />
                      <span>Bus Booking</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/flight-booking"
                    className="block px-4 py-2 text-white hover:bg-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Plane className="h-5 w-5" />
                      <span>Flight Booking</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/taxi-booking"
                    className="block px-4 py-2 text-white hover:bg-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Car className="h-5 w-5" />
                      <span>Taxi Booking</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/metro-booking"
                    className="block px-4 py-2 text-white hover:bg-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Train className="h-5 w-5" />
                      <span>Metro Booking</span>
                    </div>
                  </Link>
                  
                  {/* Safety Menu Items */}
                  <div className="px-4 py-2 text-xs font-semibold text-blue-200 uppercase tracking-wide border-b border-blue-800">Safety Features</div>
                  
                  <Link
                    to="/emergency-contacts"
                    className="block px-4 py-2 text-white hover:bg-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Phone className="h-5 w-5" />
                      <span>Emergency Contacts</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/safety-map"
                    className="block px-4 py-2 text-white hover:bg-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Danger Zone Map</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/incident-reporting"
                    className="block px-4 py-2 text-white hover:bg-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Incident Reporting</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/health-monitoring"
                    className="block px-4 py-2 text-white hover:bg-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Heart className="h-5 w-5" />
                      <span>Health Monitoring</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/location-tracking"
                    className="block px-4 py-2 text-white hover:bg-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Navigation className="h-5 w-5" />
                      <span>Location Tracking</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/safety-checkins"
                    className="block px-4 py-2 text-white hover:bg-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Safety Check-ins</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/cctv-monitoring"
                    className="block px-4 py-2 text-white hover:bg-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Camera className="h-5 w-5" />
                      <span>CCTV Monitoring</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/emergency-radio"
                    className="block px-4 py-2 text-white hover:bg-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Radio className="h-5 w-5" />
                      <span>Emergency Radio</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/social"
                    className="block px-4 py-2 text-white hover:bg-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Users2 className="h-5 w-5" />
                      <span>Social Feed</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/booking-history"
                    className="block px-4 py-2 text-white hover:bg-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>My Bookings</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-white hover:bg-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <UserCircle className="h-5 w-5" />
                      <span>Profile</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/features"
                    className="block px-4 py-2 text-white hover:bg-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5" />
                      <span>New Features</span>
                      <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold animate-pulse">NEW</span>
                    </div>
                  </Link>
                </>
              )}
              
              {user ? (
                <div className="pt-4 border-t border-blue-800">
                  <div className="flex items-center space-x-2 mb-2 px-4">
                    <User className="h-5 w-5" />
                    <span className="text-sm">{user.name || user.email}</span>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-blue-800 space-y-2 px-4">
                  <Link
                    to="/auth"
                    className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-medium transition-colors text-center block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth"
                    className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-medium transition-colors text-center block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}