import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, Eye, Calendar, MapPin, Clock, Star } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
  humidity: number;
  windSpeed: number;
  visibility: number;
  uvIndex: number;
  precipitation: number;
  forecast: DayForecast[];
}

interface DayForecast {
  date: string;
  condition: string;
  high: number;
  low: number;
  precipitation: number;
}

interface Activity {
  id: string;
  name: string;
  category: 'outdoor' | 'indoor' | 'cultural' | 'adventure' | 'relaxation';
  description: string;
  duration: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  bestWeather: string[];
  location: string;
  rating: number;
  price: string;
  equipment?: string[];
  tips: string[];
  weatherScore: number;
}

const WeatherActivityRecommendations: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [recommendations, setRecommendations] = useState<Activity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<number>(0);

  const activities: Activity[] = [
    {
      id: '1',
      name: 'Historic Walking Tour',
      category: 'cultural',
      description: 'Explore the city\'s rich history with a guided walking tour through ancient streets',
      duration: '2-3 hours',
      difficulty: 'easy',
      bestWeather: ['sunny', 'cloudy'],
      location: 'Old Town District',
      rating: 4.7,
      price: '€15',
      tips: ['Wear comfortable shoes', 'Bring water', 'Start early to avoid crowds'],
      weatherScore: 0
    },
    {
      id: '2',
      name: 'Museum of Natural History',
      category: 'indoor',
      description: 'Discover fascinating exhibits about local wildlife, geology, and ancient civilizations',
      duration: '2-4 hours',
      difficulty: 'easy',
      bestWeather: ['rainy', 'snowy', 'windy'],
      location: 'Museum Quarter',
      rating: 4.5,
      price: '€12',
      tips: ['Audio guide recommended', 'Photography allowed in most areas', 'Café on-site'],
      weatherScore: 0
    },
    {
      id: '3',
      name: 'Mountain Hiking Trail',
      category: 'adventure',
      description: 'Challenging hike with breathtaking panoramic views of the valley',
      duration: '4-6 hours',
      difficulty: 'challenging',
      bestWeather: ['sunny', 'cloudy'],
      location: 'Mountain Ridge',
      rating: 4.9,
      price: 'Free',
      equipment: ['Hiking boots', 'Water bottle', 'Weather-appropriate clothing'],
      tips: ['Check weather conditions', 'Start early', 'Inform someone of your route'],
      weatherScore: 0
    },
    {
      id: '4',
      name: 'Thermal Spa Experience',
      category: 'relaxation',
      description: 'Rejuvenating thermal baths with mineral-rich waters and wellness treatments',
      duration: '3-5 hours',
      difficulty: 'easy',
      bestWeather: ['rainy', 'snowy', 'windy', 'cloudy'],
      location: 'Spa District',
      rating: 4.6,
      price: '€35',
      tips: ['Book in advance', 'Bring swimwear', 'Stay hydrated'],
      weatherScore: 0
    },
    {
      id: '5',
      name: 'River Kayaking',
      category: 'adventure',
      description: 'Paddle through scenic waterways with opportunities to spot local wildlife',
      duration: '2-3 hours',
      difficulty: 'moderate',
      bestWeather: ['sunny', 'cloudy'],
      location: 'River Valley',
      rating: 4.4,
      price: '€25',
      equipment: ['Provided: Kayak, paddle, life jacket'],
      tips: ['Swimming ability required', 'Waterproof bag for belongings', 'Sun protection'],
      weatherScore: 0
    },
    {
      id: '6',
      name: 'Local Cooking Class',
      category: 'indoor',
      description: 'Learn to prepare traditional dishes with local ingredients and techniques',
      duration: '3-4 hours',
      difficulty: 'easy',
      bestWeather: ['rainy', 'snowy', 'windy'],
      location: 'Culinary School',
      rating: 4.8,
      price: '€45',
      tips: ['Vegetarian options available', 'Take recipes home', 'Apron provided'],
      weatherScore: 0
    },
    {
      id: '7',
      name: 'Botanical Garden Visit',
      category: 'outdoor',
      description: 'Stroll through beautiful themed gardens featuring exotic plants and peaceful paths',
      duration: '1-2 hours',
      difficulty: 'easy',
      bestWeather: ['sunny', 'cloudy'],
      location: 'Botanical Gardens',
      rating: 4.3,
      price: '€8',
      tips: ['Best in spring/summer', 'Photography paradise', 'Guided tours available'],
      weatherScore: 0
    },
    {
      id: '8',
      name: 'Underground Cave Tour',
      category: 'adventure',
      description: 'Explore fascinating limestone caves with stunning rock formations',
      duration: '1.5-2 hours',
      difficulty: 'moderate',
      bestWeather: ['rainy', 'snowy', 'windy', 'sunny', 'cloudy'],
      location: 'Cave System',
      rating: 4.7,
      price: '€18',
      equipment: ['Helmet and headlamp provided'],
      tips: ['Constant 12°C temperature', 'Wear sturdy shoes', 'Not suitable for claustrophobia'],
      weatherScore: 0
    }
  ];

  useEffect(() => {
    // Simulate weather API call
    const mockWeatherData: WeatherData = {
      temperature: 22,
      condition: 'sunny',
      humidity: 65,
      windSpeed: 12,
      visibility: 10,
      uvIndex: 6,
      precipitation: 0,
      forecast: [
        { date: 'Today', condition: 'Sunny', high: 24, low: 18, precipitation: 0 },
        { date: 'Tomorrow', condition: 'Partly Cloudy', high: 21, low: 16, precipitation: 10 },
        { date: 'Tuesday', condition: 'Rainy', high: 19, low: 14, precipitation: 80 },
        { date: 'Wednesday', condition: 'Cloudy', high: 20, low: 15, precipitation: 20 },
        { date: 'Thursday', condition: 'Sunny', high: 25, low: 19, precipitation: 0 }
      ]
    };

    setWeatherData(mockWeatherData);
    calculateRecommendations(mockWeatherData);
  }, []);

  const calculateRecommendations = (weather: WeatherData) => {
    const scoredActivities = activities.map(activity => {
      let score = 0;
      
      // Weather condition match
      if (activity.bestWeather.includes(weather.condition)) {
        score += 40;
      }
      
      // Temperature considerations
      if (weather.temperature >= 20 && weather.temperature <= 25) {
        if (activity.category === 'outdoor' || activity.category === 'adventure') {
          score += 20;
        }
      } else if (weather.temperature < 15 || weather.temperature > 30) {
        if (activity.category === 'indoor' || activity.category === 'relaxation') {
          score += 20;
        }
      }
      
      // Precipitation considerations
      if (weather.precipitation > 50) {
        if (activity.category === 'indoor') {
          score += 30;
        } else if (activity.category === 'outdoor') {
          score -= 20;
        }
      }
      
      // Wind considerations
      if (weather.windSpeed > 20) {
        if (activity.category === 'indoor') {
          score += 15;
        } else if (activity.category === 'adventure') {
          score -= 10;
        }
      }
      
      // UV Index considerations
      if (weather.uvIndex > 7) {
        if (activity.category === 'indoor') {
          score += 10;
        }
      }
      
      return { ...activity, weatherScore: Math.max(0, Math.min(100, score)) };
    });

    const sortedActivities = scoredActivities.sort((a, b) => b.weatherScore - a.weatherScore);
    setRecommendations(sortedActivities);
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'cloudy': case 'partly cloudy': return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-6 h-6 text-blue-500" />;
      case 'snowy': return <Cloud className="w-6 h-6 text-blue-300" />;
      default: return <Sun className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-yellow-100 text-yellow-700';
      case 'challenging': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'outdoor': return '🌳';
      case 'indoor': return '🏛️';
      case 'cultural': return '🎭';
      case 'adventure': return '⛰️';
      case 'relaxation': return '🧘';
      default: return '📍';
    }
  };

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(activity => activity.category === selectedCategory);

  if (!weatherData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Current Weather */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getWeatherIcon(weatherData.condition)}
            <div>
              <h2 className="text-2xl font-bold">{weatherData.temperature}°C</h2>
              <p className="text-blue-100 capitalize">{weatherData.condition}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Droplets className="w-4 h-4" />
              <span>{weatherData.humidity}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wind className="w-4 h-4" />
              <span>{weatherData.windSpeed} km/h</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>{weatherData.visibility} km</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="w-4 h-4" />
              <span>UV {weatherData.uvIndex}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">5-Day Forecast</h3>
        <div className="grid grid-cols-5 gap-4">
          {weatherData.forecast.map((day, index) => (
            <div 
              key={index}
              className={`text-center p-3 rounded-lg cursor-pointer transition-colors ${
                selectedDay === index ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedDay(index)}
            >
              <p className="font-medium text-gray-800 text-sm">{day.date}</p>
              <div className="my-2 flex justify-center">
                {getWeatherIcon(day.condition)}
              </div>
              <div className="text-xs text-gray-600">
                <p>{day.high}° / {day.low}°</p>
                <p>{day.precipitation}% rain</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Categories</h3>
        <div className="flex flex-wrap gap-2">
          {['all', 'outdoor', 'indoor', 'cultural', 'adventure', 'relaxation'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Activities' : `${getCategoryIcon(category)} ${category}`}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Weather-Based Recommendations
          <span className="text-sm font-normal text-gray-600 ml-2">
            (Sorted by weather compatibility)
          </span>
        </h3>
        
        {filteredRecommendations.map((activity, index) => (
          <div key={activity.id} className="bg-white rounded-xl shadow-soft p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{getCategoryIcon(activity.category)}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-800">{activity.name}</h4>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">{activity.rating}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                      {activity.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{activity.description}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{activity.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{activity.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>💰</span>
                      <span>{activity.price}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{activity.weatherScore}%</div>
                <div className="text-xs text-gray-500">Weather Match</div>
              </div>
            </div>

            {activity.equipment && (
              <div className="mb-3">
                <h5 className="font-medium text-gray-800 mb-1">Equipment:</h5>
                <div className="flex flex-wrap gap-1">
                  {activity.equipment.map((item, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h5 className="font-medium text-gray-800 mb-1">Tips:</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {activity.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherActivityRecommendations;
