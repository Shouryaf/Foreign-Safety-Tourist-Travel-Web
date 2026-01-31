import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Railway Assistant. I can help you with booking tickets, checking PNR status, finding stations, and answering questions about railway services. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Railway booking related responses
    if (message.includes('book') || message.includes('ticket')) {
      return 'To book tickets, you can visit our Book Tickets page. You\'ll need to select your departure and destination stations, choose travel date, and select the number of passengers. Would you like me to guide you through the booking process?';
    }
    
    if (message.includes('pnr') || message.includes('status')) {
      return 'You can check your PNR status on our PNR Status page. Just enter your 10-digit PNR number to get real-time updates about your booking confirmation, seat numbers, and journey details.';
    }
    
    if (message.includes('station') || message.includes('find')) {
      return 'Our Find Stations feature helps you search for railway stations across India. You can get detailed information about stations including facilities, contact details, and directions. What station are you looking for?';
    }
    
    if (message.includes('schedule') || message.includes('train')) {
      return 'You can check train schedules on our Train Schedule page. Search by train number, name, or route to get departure/arrival times, stops, and other details. Do you need information about a specific train?';
    }
    
    if (message.includes('fare') || message.includes('price') || message.includes('cost')) {
      return 'Check train fares using our Fare Enquiry system. Enter your source and destination stations to get fare details for different classes like Sleeper, AC 3-Tier, AC 2-Tier, and AC 1st Class.';
    }
    
    if (message.includes('cancel') || message.includes('refund')) {
      return 'For cancellation and refund information, please check our Refund Rules page. Refund amounts depend on when you cancel - earlier cancellation means higher refund. Tatkal tickets have different rules.';
    }
    
    if (message.includes('help') || message.includes('support')) {
      return 'You can find answers to common questions in our Help Center, or contact our support team through the Contact Us page. For emergencies, call Railway Helpline: 139. How else can I help?';
    }
    
    if (message.includes('payment') || message.includes('pay')) {
      return 'We accept various payment methods including Credit/Debit cards, Net Banking, UPI (Google Pay, PhonePe, Paytm), and Digital Wallets. All transactions are secured with 256-bit SSL encryption.';
    }
    
    if (message.includes('id') || message.includes('document')) {
      return 'For train travel, you need to carry a valid photo ID like Aadhaar Card, Passport, Driving License, Voter ID, or PAN Card. The ID should match the name on your ticket.';
    }
    
    if (message.includes('time') || message.includes('early') || message.includes('reach')) {
      return 'We recommend reaching the station at least 30 minutes before departure for regular trains and 45 minutes for premium trains like Rajdhani, Shatabdi, and Duronto.';
    }
    
    // Greetings
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return 'Hello! I\'m here to help you with all your railway booking needs. You can ask me about booking tickets, checking PNR status, train schedules, fares, or any other railway-related questions.';
    }
    
    if (message.includes('thank') || message.includes('thanks')) {
      return 'You\'re welcome! I\'m always here to help with your railway queries. Is there anything else you\'d like to know about our services?';
    }
    
    // Default response
    return 'I\'m here to help with railway-related queries. You can ask me about:\n\n• Booking train tickets\n• Checking PNR status\n• Finding railway stations\n• Train schedules and timings\n• Fare information\n• Cancellation and refunds\n• Travel guidelines\n\nWhat would you like to know?';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 z-50 hover:scale-110"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-neutral-200 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-primary-600 text-white rounded-t-2xl">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5" />
          <span className="font-semibold">Railway Assistant</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-primary-700 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-primary-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-80">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div className={`px-3 py-2 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-800'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-primary-200' : 'text-neutral-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-neutral-100 px-3 py-2 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-neutral-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about railway services..."
                className="flex-1 px-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;
