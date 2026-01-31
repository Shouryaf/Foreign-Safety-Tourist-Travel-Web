import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, Users, AlertTriangle, Smartphone, Globe, Lock, Zap, CheckCircle, Heart, ArrowRight, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-neutral-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-neutral-900">SafeTravel</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-neutral-600 hover:text-primary-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-neutral-600 hover:text-primary-600 transition-colors">How It Works</a>
              <a href="#security" className="text-neutral-600 hover:text-primary-600 transition-colors">Security</a>
              <Link to="/auth" className="text-primary-600 hover:text-primary-700 font-medium">Sign In</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-primary-50 rounded-full border border-primary-200 mb-8">
              <Star className="w-4 h-4 mr-2 text-primary-600" />
              <span className="text-primary-700 text-sm font-medium">Trusted by 50,000+ travelers worldwide</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-8 leading-tight">
              Travel with
              <span className="block text-primary-600">Complete Confidence</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-neutral-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Advanced blockchain security meets AI-powered monitoring to create the world's most comprehensive tourist safety platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link 
                to="/register"
                className="group inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-primary-700 hover:shadow-large"
              >
                Get Protected Today
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                to="/auth"
                className="inline-flex items-center px-8 py-4 border-2 border-neutral-300 text-neutral-700 rounded-xl font-semibold text-lg transition-all duration-300 hover:border-primary-300 hover:text-primary-600"
              >
                Authority Access
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-neutral-900 mb-2">50,000+</div>
                <div className="text-neutral-600">Protected Travelers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-neutral-900 mb-2">99.8%</div>
                <div className="text-neutral-600">Safety Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-neutral-900 mb-2">24/7</div>
                <div className="text-neutral-600">AI Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Enterprise-Grade Protection
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Military-grade security meets consumer-friendly design. Every feature is built with your safety and privacy in mind.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white p-8 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <Lock className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-display text-xl font-semibold text-neutral-900 mb-4">Blockchain Identity</h3>
              <p className="text-neutral-600 leading-relaxed">
                Immutable digital identity stored on blockchain. Your tourist ID cannot be forged, stolen, or tampered with.
              </p>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-accent-600" />
              </div>
              <h3 className="font-display text-xl font-semibold text-neutral-900 mb-4">AI Threat Detection</h3>
              <p className="text-neutral-600 leading-relaxed">
                Advanced machine learning algorithms continuously analyze patterns to predict and prevent potential safety risks.
              </p>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="h-6 w-6 text-secondary-600" />
              </div>
              <h3 className="font-display text-xl font-semibold text-neutral-900 mb-4">Smart Geofencing</h3>
              <p className="text-neutral-600 leading-relaxed">
                Intelligent location monitoring with dynamic safe zones that adapt to real-time conditions and local events.
              </p>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-display text-xl font-semibold text-neutral-900 mb-4">Emergency Response</h3>
              <p className="text-neutral-600 leading-relaxed">
                One-touch SOS with automatic location sharing and direct connection to local emergency services.
              </p>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-display text-xl font-semibold text-neutral-900 mb-4">Global Coverage</h3>
              <p className="text-neutral-600 leading-relaxed">
                Protection in 150+ countries with local partnerships and 24/7 multilingual support teams.
              </p>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Smartphone className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-display text-xl font-semibold text-neutral-900 mb-4">Mobile First</h3>
              <p className="text-neutral-600 leading-relaxed">
                Intuitive mobile app with offline capabilities, ensuring protection even without internet connectivity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Simple. Secure. Seamless.
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Get protected in three easy steps. No complex setup, no technical knowledge required.
            </p>
          </div>
          
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-neutral-200 transform -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-medium group-hover:shadow-large transition-all duration-300">
                    <span className="text-white text-xl font-bold">1</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="font-display text-xl font-semibold text-neutral-900 mb-4">Create Your Digital ID</h3>
                <p className="text-neutral-600 leading-relaxed max-w-sm mx-auto">
                  Quick registration creates your blockchain-secured digital identity. Takes less than 2 minutes.
                </p>
              </div>
              
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-medium group-hover:shadow-large transition-all duration-300">
                    <span className="text-white text-xl font-bold">2</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="font-display text-xl font-semibold text-neutral-900 mb-4">Travel Protected</h3>
                <p className="text-neutral-600 leading-relaxed max-w-sm mx-auto">
                  AI monitors your journey in real-time, alerting you to safe zones and potential risks automatically.
                </p>
              </div>
              
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-medium group-hover:shadow-large transition-all duration-300">
                    <span className="text-white text-xl font-bold">3</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="font-display text-xl font-semibold text-neutral-900 mb-4">Stay Connected</h3>
                <p className="text-neutral-600 leading-relaxed max-w-sm mx-auto">
                  Emergency services and local authorities have instant access to help when you need it most.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Bank-Level Security
            </h2>
            <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
              Your safety and privacy are protected by the same technology that secures global financial institutions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-3">End-to-End Encryption</h3>
              <p className="text-neutral-400 text-sm">All data is encrypted using AES-256 military-grade encryption.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-3">Blockchain Immutability</h3>
              <p className="text-neutral-400 text-sm">Records cannot be altered, deleted, or tampered with.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-3">Privacy First</h3>
              <p className="text-neutral-400 text-sm">Zero-knowledge architecture protects your personal data.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-3">Compliance Ready</h3>
              <p className="text-neutral-400 text-sm">GDPR, CCPA, and international privacy standards compliant.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Start Your Protected Journey
          </h2>
          <p className="text-xl text-primary-100 mb-12">
            Join 50,000+ travelers who trust SafeTravel for their security. 
            Get instant protection with your blockchain-secured digital identity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              to="/register"
              className="group inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-neutral-50 hover:shadow-large"
            >
              Create Your Digital ID
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/auth"
              className="inline-flex items-center px-8 py-4 border-2 border-white/30 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:border-white hover:bg-white/10"
            >
              Authority Portal
            </Link>
          </div>
          
          <p className="text-sm text-primary-200">
            ✓ Free 30-day trial • ✓ No setup fees • ✓ Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl">SafeTravel</span>
            </div>
            <div className="text-sm text-neutral-400">
              © 2024 SafeTravel. All rights reserved. • Privacy Policy • Terms of Service
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}