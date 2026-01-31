import React, { useState } from 'react';
import { Compass, Users, Scan, CloudSun, Shield, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import TourGuideChat from '../components/VirtualTourGuide/TourGuideChat';
import TouristSocialHub from '../components/SocialNetwork/TouristSocialHub';
import LandmarkScanner from '../components/AR/LandmarkScanner';
import WeatherActivityRecommendations from '../components/Weather/WeatherActivityRecommendations';
import PassportVerificationSystem from '../components/DigitalPassport/PassportVerificationSystem';
import TouristGameHub from '../components/Gamification/TouristGameHub';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  gradient: string;
  component: React.ComponentType<any>;
  isNew: boolean;
}

const NewFeaturesHub: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [userLocation] = useState<[number, number]>([48.8566, 2.3522]); // Paris coordinates

  const features: Feature[] = [
    {
      id: 'tour-guide',
      title: 'AI Tour Guide',
      description: 'Get personalized recommendations and instant information about attractions, restaurants, and activities based on your location and preferences.',
      icon: Compass,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      component: TourGuideChat,
      isNew: true
    },
    {
      id: 'social-network',
      title: 'Tourist Social Hub',
      description: 'Connect with fellow travelers, share experiences, join meetups, and discover hidden gems through our vibrant tourist community.',
      icon: Users,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      component: TouristSocialHub,
      isNew: true
    },
    {
      id: 'ar-scanner',
      title: 'AR Landmark Scanner',
      description: 'Point your camera at landmarks to get instant historical information, audio guides, and fascinating facts through augmented reality.',
      icon: Scan,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      component: LandmarkScanner,
      isNew: true
    },
    {
      id: 'weather-activities',
      title: 'Weather-Based Activities',
      description: 'Discover the perfect activities for current weather conditions with smart recommendations and 5-day planning.',
      icon: CloudSun,
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
      component: WeatherActivityRecommendations,
      isNew: true
    },
    {
      id: 'passport-verification',
      title: 'Digital Passport & Visa',
      description: 'Securely scan and verify your travel documents with advanced OCR technology and biometric verification.',
      icon: Shield,
      color: 'red',
      gradient: 'from-red-500 to-red-600',
      component: PassportVerificationSystem,
      isNew: true
    },
    {
      id: 'gamification',
      title: 'Tourist Game Hub',
      description: 'Earn achievements, complete quests, compete on leaderboards, and unlock rewards as you explore new destinations.',
      icon: Trophy,
      color: 'yellow',
      gradient: 'from-yellow-500 to-yellow-600',
      component: TouristGameHub,
      isNew: true
    }
    
  ];

  const handleFeatureSelect = (featureId: string) => {
    setActiveFeature(featureId);
  };

  const handleBackToHub = () => {
    setActiveFeature(null);
  };

  if (activeFeature) {
    const feature = features.find(f => f.id === activeFeature);
    if (feature) {
      const FeatureComponent = feature.component;
      return (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className={`bg-gradient-to-r ${feature.gradient} text-white p-4`}>
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBackToHub}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  ←
                </button>
                <feature.icon className="w-6 h-6" />
                <h1 className="text-xl font-bold">{feature.title}</h1>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">New Feature</span>
              </div>
            </div>
          </div>

          {/* Feature Component */}
          <div className="min-h-screen">
            {feature.id === 'tour-guide' ? (
              <div className="max-w-4xl mx-auto p-6">
                <div className="h-96">
                  <FeatureComponent 
                    userLocation={userLocation} 
                    onLocationSelect={(coords: [number, number]) => console.log('Location selected:', coords)} 
                  />
                </div>
              </div>
            ) : (
              <FeatureComponent />
            )}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="w-8 h-8" />
              <h1 className="text-4xl font-bold">New Features Hub</h1>
              <Sparkles className="w-8 h-8" />
            </div>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Discover our latest innovative features designed to enhance your travel experience with cutting-edge technology
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>6 New Features</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                <span>Interactive</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-white rounded-xl shadow-soft hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => handleFeatureSelect(feature.id)}
            >
              <div className={`bg-gradient-to-r ${feature.gradient} p-6 rounded-t-xl`}>
                <div className="flex items-center justify-between mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                  {feature.isNew && (
                    <span className="bg-white bg-opacity-20 text-white px-2 py-1 rounded-full text-xs font-medium">
                      NEW
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Sparkles className="w-4 h-4" />
                    <span>Interactive Experience</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-600 group-hover:text-blue-700 transition-colors">
                    <span className="font-medium">Explore</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Why These Features Matter</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Each feature is designed to solve real travel challenges and enhance your journey with innovative technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Compass className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Recommendations</h3>
              <p className="text-gray-600">AI-powered suggestions tailored to your preferences and current conditions</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Social Connection</h3>
              <p className="text-gray-600">Connect with fellow travelers and discover experiences through community</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Enhanced Security</h3>
              <p className="text-gray-600">Advanced verification and safety features for worry-free travel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewFeaturesHub;
