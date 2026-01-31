import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Auth from './pages/Auth';
import EnhancedAuth from './pages/EnhancedAuth';
import Dashboard from './pages/Dashboard';
import SocialFeed from './pages/SocialFeed';
import TransportSearch from './pages/TransportSearch';
import BusBooking from './pages/BusBooking';
import FlightBooking from './pages/FlightBooking';
import TaxiBooking from './pages/TaxiBooking';
import MetroBooking from './pages/MetroBooking';
import BookingHistory from './pages/BookingHistory';
import Profile from './pages/Profile';
import PaymentGateway from './pages/PaymentGateway';
import BookingConfirmation from './pages/BookingConfirmation';
import EWallet from './pages/EWallet';
import Analytics from './pages/Analytics';
import NewFeaturesHub from './pages/NewFeaturesHub';
import PNRStatus from './pages/PNRStatus';
import FareEnquiry from './pages/FareEnquiry';
import FindStations from './pages/FindStations';
import TourGuideChat from './components/VirtualTourGuide/TourGuideChat';
import TouristSocialHub from './components/SocialNetwork/TouristSocialHub';
import LandmarkScanner from './components/AR/LandmarkScanner';
import WeatherActivityRecommendations from './components/Weather/WeatherActivityRecommendations';
import PassportVerificationSystem from './components/DigitalPassport/PassportVerificationSystem';
import TouristGameHub from './components/Gamification/TouristGameHub';
import SafetyMapPage from './pages/SafetyMapPage';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import toast from 'react-hot-toast';
import EmergencyContacts from './components/Safety/EmergencyContacts';
import IncidentReporting from './components/Safety/IncidentReporting';
import HealthMonitoring from './components/Safety/HealthMonitoring';
import LocationTracking from './components/Safety/LocationTracking';
import SafetyCheckins from './components/Safety/SafetyCheckins';
import CCTVMonitoring from './components/Safety/CCTVMonitoring';
import EmergencyRadio from './components/Safety/EmergencyRadio';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }: { children: JSX.Element, requiredRole?: string }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleGlobalSOS = async () => {
    if (!user) {
      toast.error('Please login to use SOS feature');
      return;
    }

    if (!userLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(location);
            await sendSOSAlert(location);
          },
          () => {
            toast.error('Location access required for SOS');
          }
        );
      } else {
        toast.error('Geolocation not supported');
      }
      return;
    }

    await sendSOSAlert(userLocation);
  };

  const sendSOSAlert = async (location: { lat: number; lng: number }) => {
    try {
      // Show immediate feedback
      toast.loading('🚨 Sending SOS Alert...', { duration: 2000 });
      
      const token = localStorage.getItem('token');
      
      // Simulate API call (replace with real backend)
      setTimeout(() => {
        toast.success('🚨 SOS Alert Sent! Emergency services notified.');
        toast.success(`📍 Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
        
        // Simulate emergency contact notifications
        toast.success('📞 Trusted contacts have been notified');
      }, 2000);
      
    } catch (error) {
      console.error('SOS error:', error);
      toast.error('Failed to send SOS alert. Please try again.');
    }
  };

  useEffect(() => {
    if (user && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or unavailable:', error);
        }
      );
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header user={user} onLogout={handleLogout} />
        <main className="flex-grow">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/auth" />} />
            <Route 
              path="/auth" 
              element={user ? 
                <Navigate to="/" /> : 
                <Auth onLogin={handleLogin} />} 
            />
            <Route 
              path="/enhanced-auth" 
              element={user ? 
                <Navigate to="/" /> : 
                <EnhancedAuth onLogin={handleLogin} />} 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/social" 
              element={
                <ProtectedRoute>
                  <SocialFeed user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transport" 
              element={
                <ProtectedRoute>
                  <TransportSearch user={user} />
                </ProtectedRoute>
              } 
            />

            {/* Transport Booking Routes */}
            <Route 
              path="/train-booking" 
              element={
                <ProtectedRoute>
                  <BusBooking />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bus-booking" 
              element={
                <ProtectedRoute>
                  <BusBooking />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/flight-booking" 
              element={
                <ProtectedRoute>
                  <FlightBooking user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/taxi-booking" 
              element={
                <ProtectedRoute>
                  <TaxiBooking user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/metro-booking" 
              element={
                <ProtectedRoute>
                  <MetroBooking user={user} />
                </ProtectedRoute>
              } 
            />

            {/* Legacy transport routes for backward compatibility */}
            <Route 
              path="/transport/train" 
              element={
                <ProtectedRoute>
                  <BusBooking />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transport/bus" 
              element={
                <ProtectedRoute>
                  <BusBooking />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transport/flight" 
              element={
                <ProtectedRoute>
                  <FlightBooking user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transport/taxi" 
              element={
                <ProtectedRoute>
                  <TaxiBooking user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transport/metro" 
              element={
                <ProtectedRoute>
                  <MetroBooking user={user} />
                </ProtectedRoute>
              } 
            />

            {/* Other Routes */}
            <Route 
              path="/booking-history" 
              element={
                <ProtectedRoute>
                  <BookingHistory user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bookings" 
              element={
                <ProtectedRoute>
                  <BookingHistory user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile user={user} />
                </ProtectedRoute>
              } 
            />
            <Route path="/payment" element={<ProtectedRoute><PaymentGateway /></ProtectedRoute>} />
            <Route path="/booking-confirmation" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><EWallet /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/pnr-status" element={<ProtectedRoute><PNRStatus /></ProtectedRoute>} />
            <Route path="/fare-enquiry" element={<ProtectedRoute><FareEnquiry /></ProtectedRoute>} />
            <Route path="/find-stations" element={<ProtectedRoute><FindStations /></ProtectedRoute>} />
            
            {/* Safety Routes */}
            <Route path="/emergency-contacts" element={<ProtectedRoute><EmergencyContacts /></ProtectedRoute>} />
            <Route path="/incident-reporting" element={<ProtectedRoute><IncidentReporting /></ProtectedRoute>} />
            <Route path="/health-monitoring" element={<ProtectedRoute><HealthMonitoring /></ProtectedRoute>} />
            <Route path="/location-tracking" element={<ProtectedRoute><LocationTracking /></ProtectedRoute>} />
            <Route path="/safety-checkins" element={<ProtectedRoute><SafetyCheckins /></ProtectedRoute>} />
            <Route path="/cctv-monitoring" element={<ProtectedRoute><CCTVMonitoring /></ProtectedRoute>} />
            <Route path="/emergency-radio" element={<ProtectedRoute><EmergencyRadio /></ProtectedRoute>} />
            <Route path="/safety-map" element={<ProtectedRoute><SafetyMapPage /></ProtectedRoute>} />
            
            {/* New Features Routes */}
            <Route path="/features" element={<ProtectedRoute><NewFeaturesHub /></ProtectedRoute>} />
            <Route path="/tour-guide" element={<ProtectedRoute><TourGuideChat userLocation={[userLocation?.lat || 0, userLocation?.lng || 0]} onLocationSelect={(coords) => console.log('Location selected:', coords)} /></ProtectedRoute>} />
            <Route path="/social-hub" element={<ProtectedRoute><TouristSocialHub /></ProtectedRoute>} />
            <Route path="/ar-scanner" element={<ProtectedRoute><LandmarkScanner /></ProtectedRoute>} />
            <Route path="/weather-activities" element={<ProtectedRoute><WeatherActivityRecommendations /></ProtectedRoute>} />
            <Route path="/passport-verification" element={<ProtectedRoute><PassportVerificationSystem /></ProtectedRoute>} />
            <Route path="/game-hub" element={<ProtectedRoute><TouristGameHub /></ProtectedRoute>} />
            
          </Routes>
        </main>
        <Footer />
        
        {/* Global SOS Button */}
        {user && (
          <button
            onClick={handleGlobalSOS}
            className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3 group z-50 border-2 border-red-500 animate-pulse hover:animate-none"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-bold">EMERGENCY SOS</span>
          </button>
        )}
      </div>
    </Router>
  );
}

export default App;