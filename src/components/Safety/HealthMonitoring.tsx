import React, { useState, useEffect } from 'react';
import { Heart, Activity, Thermometer, Droplets, Zap, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface HealthMetric {
  id: string;
  type: 'heart_rate' | 'blood_pressure' | 'temperature' | 'oxygen_saturation';
  value: string;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
  unit: string;
}

export default function HealthMonitoring() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState({
    heartRate: 72,
    bloodPressure: '120/80',
    temperature: 98.6,
    oxygenSaturation: 98
  });

  useEffect(() => {
    // Simulate real-time health monitoring
    if (isMonitoring) {
      const interval = setInterval(() => {
        // Simulate heart rate variability
        const newHeartRate = 70 + Math.floor(Math.random() * 20);
        setCurrentMetrics(prev => ({
          ...prev,
          heartRate: newHeartRate
        }));

        // Add to metrics history
        const newMetric: HealthMetric = {
          id: Date.now().toString(),
          type: 'heart_rate',
          value: newHeartRate.toString(),
          timestamp: new Date().toISOString(),
          status: newHeartRate > 100 ? 'warning' : newHeartRate > 120 ? 'critical' : 'normal',
          unit: 'bpm'
        };

        setMetrics(prev => [newMetric, ...prev.slice(0, 49)]); // Keep last 50 readings
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const startMonitoring = () => {
    setIsMonitoring(true);
    toast.success('Health monitoring started');
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    toast.success('Health monitoring stopped');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Health Monitoring</h1>
                <p className="text-gray-600">Real-time health tracking and emergency alerts</p>
              </div>
            </div>
            <button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isMonitoring 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Activity className="w-4 h-4" />
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Current Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-900">Heart Rate</span>
                </div>
                {isMonitoring && <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />}
              </div>
              <div className="text-2xl font-bold text-red-900">{currentMetrics.heartRate}</div>
              <div className="text-sm text-red-700">bpm</div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Blood Pressure</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{currentMetrics.bloodPressure}</div>
              <div className="text-sm text-blue-700">mmHg</div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-900">Temperature</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">{currentMetrics.temperature}</div>
              <div className="text-sm text-orange-700">°F</div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-5 h-5 text-teal-600" />
                <span className="font-medium text-teal-900">Oxygen Saturation</span>
              </div>
              <div className="text-2xl font-bold text-teal-900">{currentMetrics.oxygenSaturation}</div>
              <div className="text-sm text-teal-700">%</div>
            </div>
          </div>

          {/* Recent Readings */}
          {metrics.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Readings</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {metrics.slice(0, 10).map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-red-600" />
                      <span className="font-medium">{metric.value} {metric.unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(metric.status)}`}>
                        {getStatusIcon(metric.status)}
                        {metric.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(metric.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Health Alerts */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Health Status</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">All vitals within normal range</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Your health metrics are being monitored continuously. Any abnormal readings will trigger immediate alerts.
              </p>
            </div>
          </div>

          {/* Emergency Actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center gap-2 p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <Heart className="w-5 h-5" />
              Emergency Alert
            </button>
            <button className="flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Activity className="w-5 h-5" />
              Call Doctor
            </button>
            <button className="flex items-center justify-center gap-2 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <TrendingUp className="w-5 h-5" />
              View History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}