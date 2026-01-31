import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Zap, Snowflake, Eye, Wind, Thermometer, Droplets, AlertTriangle } from 'lucide-react';

interface WeatherData {
  location: {
    latitude: number;
    longitude: number;
  };
  temperature: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  visibility: number;
  wind_speed: number;
  wind_direction: number;
  weather_main: string;
  weather_description: string;
  timestamp: string;
}

interface SafetyRecommendation {
  category: string;
  level: 'low' | 'medium' | 'high' | 'extreme';
  message: string;
  actions: string[];
}

interface WeatherResponse {
  weather: WeatherData;
  safety_recommendations: SafetyRecommendation[];
  alert_level: 'low' | 'medium' | 'high' | 'extreme';
}

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
  className?: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ latitude, longitude, className = '' }) => {
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchWeatherData();
    // Refresh weather data every 10 minutes
    const interval = setInterval(fetchWeatherData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [latitude, longitude]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:8002/weather/${latitude}/${longitude}`);
      if (!response.ok) {
        throw new Error('Weather service unavailable');
      }
      
      const data: WeatherResponse = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'clouds':
        return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'rain':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'thunderstorm':
        return <Zap className="w-8 h-8 text-purple-500" />;
      case 'snow':
        return <Snowflake className="w-8 h-8 text-blue-300" />;
      default:
        return <Cloud className="w-8 h-8 text-gray-500" />;
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'extreme':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'high':
      case 'extreme':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-soft p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-soft p-4 border-l-4 border-red-400 ${className}`}>
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          <div>
            <p className="text-sm font-medium text-red-800">Weather Service Error</p>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchWeatherData}
          className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!weatherData) return null;

  const { weather, safety_recommendations, alert_level } = weatherData;

  return (
    <div className={`bg-white rounded-xl shadow-soft overflow-hidden ${className}`}>
      {/* Main Weather Display */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getWeatherIcon(weather.weather_main)}
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {Math.round(weather.temperature)}°C
                </span>
                {alert_level !== 'low' && getAlertIcon(alert_level)}
              </div>
              <p className="text-sm text-gray-600 capitalize">
                {weather.weather_description}
              </p>
              <p className="text-xs text-gray-500">
                Feels like {Math.round(weather.feels_like)}°C
              </p>
            </div>
          </div>
          
          {/* Alert Badge */}
          {alert_level !== 'low' && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getAlertColor(alert_level)}`}>
              {alert_level.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* Weather Details */}
          <div className="p-4 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Weather Details</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600">Humidity: {weather.humidity}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wind className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Wind: {weather.wind_speed} m/s</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Visibility: {weather.visibility} km</span>
              </div>
              <div className="flex items-center space-x-2">
                <Thermometer className="w-4 h-4 text-red-500" />
                <span className="text-gray-600">Pressure: {weather.pressure} hPa</span>
              </div>
            </div>
          </div>

          {/* Safety Recommendations */}
          {safety_recommendations.length > 0 && (
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Safety Recommendations</h4>
              <div className="space-y-3">
                {safety_recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border ${getAlertColor(rec.level)}`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {getAlertIcon(rec.level)}
                      <span className="font-medium text-sm">{rec.category}</span>
                    </div>
                    <p className="text-xs mb-2">{rec.message}</p>
                    <ul className="text-xs space-y-1">
                      {rec.actions.slice(0, 2).map((action, actionIndex) => (
                        <li key={actionIndex} className="flex items-start space-x-1">
                          <span className="text-gray-400">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                      {rec.actions.length > 2 && (
                        <li className="text-gray-500 italic">
                          +{rec.actions.length - 2} more recommendations
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="px-4 pb-4">
            <p className="text-xs text-gray-500">
              Last updated: {new Date(weather.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
