import React, { useState, useRef, useEffect } from 'react';
import { Send, MapPin, Camera, Star, Clock, Users, Compass } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'guide';
  content: string;
  timestamp: Date;
  recommendations?: Recommendation[];
}

interface Recommendation {
  id: string;
  name: string;
  type: 'restaurant' | 'attraction' | 'activity' | 'shopping';
  rating: number;
  distance: string;
  estimatedTime: string;
  price: string;
  description: string;
  image: string;
  coordinates: [number, number];
}

interface TourGuideChatProps {
  userLocation: [number, number];
  onLocationSelect: (coords: [number, number]) => void;
}

const TourGuideChat: React.FC<TourGuideChatProps> = ({ userLocation, onLocationSelect }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'guide',
      content: "Hello! I'm your AI tour guide. I can help you discover amazing places, recommend activities based on your preferences, and provide real-time insights about your current location. What would you like to explore today?",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateRecommendations = (query: string): Recommendation[] => {
    const sampleRecommendations: Recommendation[] = [
      {
        id: '1',
        name: 'Historic City Center',
        type: 'attraction',
        rating: 4.8,
        distance: '0.5 km',
        estimatedTime: '2-3 hours',
        price: 'Free',
        description: 'Beautiful historic architecture with guided tours available',
        image: '/api/placeholder/300/200',
        coordinates: [userLocation[0] + 0.005, userLocation[1] + 0.005]
      },
      {
        id: '2',
        name: 'Local Cuisine Restaurant',
        type: 'restaurant',
        rating: 4.6,
        distance: '0.3 km',
        estimatedTime: '1-2 hours',
        price: '$$',
        description: 'Authentic local dishes with vegetarian options',
        image: '/api/placeholder/300/200',
        coordinates: [userLocation[0] - 0.003, userLocation[1] + 0.002]
      },
      {
        id: '3',
        name: 'Adventure Park',
        type: 'activity',
        rating: 4.7,
        distance: '1.2 km',
        estimatedTime: '3-4 hours',
        price: '$$$',
        description: 'Zip-lining, rock climbing, and nature trails',
        image: '/api/placeholder/300/200',
        coordinates: [userLocation[0] + 0.01, userLocation[1] - 0.008]
      }
    ];

    return sampleRecommendations.filter(rec => 
      rec.name.toLowerCase().includes(query.toLowerCase()) ||
      rec.type.toLowerCase().includes(query.toLowerCase()) ||
      rec.description.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const recommendations = generateRecommendations(inputMessage);
      const guideResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'guide',
        content: `Based on your request "${inputMessage}", I found some great recommendations for you! Here are the top suggestions in your area:`,
        timestamp: new Date(),
        recommendations: recommendations.length > 0 ? recommendations : undefined,
      };

      if (recommendations.length === 0) {
        guideResponse.content = `I understand you're looking for "${inputMessage}". While I don't have specific recommendations for that right now, I can help you with restaurants, attractions, activities, or shopping in your area. What interests you most?`;
      }

      setMessages(prev => [...prev, guideResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleRecommendationClick = (recommendation: Recommendation) => {
    onLocationSelect(recommendation.coordinates);
    const message: Message = {
      id: Date.now().toString(),
      type: 'guide',
      content: `Great choice! I've marked ${recommendation.name} on your map. It's ${recommendation.distance} away and should take about ${recommendation.estimatedTime} to explore. Have a wonderful time!`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return '🍽️';
      case 'attraction': return '🏛️';
      case 'activity': return '🎯';
      case 'shopping': return '🛍️';
      default: return '📍';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-soft">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
        <Compass className="w-6 h-6 mr-3" />
        <div>
          <h3 className="font-semibold">AI Tour Guide</h3>
          <p className="text-sm text-blue-100">Your personal travel companion</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.type === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="text-sm">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Recommendations */}
        {messages[messages.length - 1]?.recommendations && (
          <div className="space-y-3">
            {messages[messages.length - 1].recommendations!.map((rec) => (
              <div 
                key={rec.id} 
                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleRecommendationClick(rec)}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getTypeIcon(rec.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-800">{rec.name}</h4>
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm ml-1">{rec.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {rec.distance}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {rec.estimatedTime}
                      </div>
                      <div className="flex items-center">
                        <span className="mr-1">💰</span>
                        {rec.price}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about restaurants, attractions, activities..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourGuideChat;
