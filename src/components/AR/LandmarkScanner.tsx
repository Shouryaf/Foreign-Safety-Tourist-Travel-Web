import React, { useState, useRef, useEffect } from 'react';
import { Camera, Scan, Info, Star, Clock, MapPin, Volume2, VolumeX, Bookmark, Share2 } from 'lucide-react';

interface Landmark {
  id: string;
  name: string;
  description: string;
  historicalInfo: string;
  rating: number;
  category: string;
  visitDuration: string;
  audioGuideUrl?: string;
  facts: string[];
  nearbyAttractions: string[];
  bestTimeToVisit: string;
  ticketPrice?: string;
  coordinates: [number, number];
}

interface AROverlay {
  landmark: Landmark;
  position: { x: number; y: number };
  distance: string;
  confidence: number;
}

const LandmarkScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [detectedLandmarks, setDetectedLandmarks] = useState<AROverlay[]>([]);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sampleLandmarks: Landmark[] = [
    {
      id: '1',
      name: 'Historic Cathedral',
      description: 'A magnificent 12th-century Gothic cathedral with stunning architecture',
      historicalInfo: 'Built between 1163-1345, this cathedral survived two world wars and remains a symbol of resilience.',
      rating: 4.8,
      category: 'Religious Site',
      visitDuration: '1-2 hours',
      facts: [
        'Contains 13th-century stained glass windows',
        'Houses the tomb of a famous medieval king',
        'Features the largest bell in the region'
      ],
      nearbyAttractions: ['Museum Quarter', 'Royal Gardens', 'Old Market Square'],
      bestTimeToVisit: 'Early morning or late afternoon for best lighting',
      ticketPrice: '€12 (€8 for students)',
      coordinates: [48.8566, 2.3522]
    },
    {
      id: '2',
      name: 'Ancient City Wall',
      description: 'Well-preserved medieval fortifications dating back to the 14th century',
      historicalInfo: 'These walls protected the city during numerous sieges and are among the best-preserved in Europe.',
      rating: 4.6,
      category: 'Historical Site',
      visitDuration: '45 minutes',
      facts: [
        'Originally 3 kilometers long',
        'Features 12 defensive towers',
        'Built using local limestone'
      ],
      nearbyAttractions: ['Castle Ruins', 'Heritage Museum', 'Artisan Quarter'],
      bestTimeToVisit: 'Sunset for spectacular views',
      coordinates: [48.8606, 2.3376]
    }
  ];

  useEffect(() => {
    if (isScanning) {
      startCamera();
      simulateScanning();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isScanning]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Fallback to sample image for demo
      if (videoRef.current) {
        videoRef.current.src = '/api/placeholder/640/480';
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const simulateScanning = () => {
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Simulate landmark detection
          setTimeout(() => {
            const randomLandmark = sampleLandmarks[Math.floor(Math.random() * sampleLandmarks.length)];
            const overlay: AROverlay = {
              landmark: randomLandmark,
              position: { 
                x: Math.random() * 300 + 50, 
                y: Math.random() * 200 + 100 
              },
              distance: `${(Math.random() * 500 + 50).toFixed(0)}m`,
              confidence: Math.random() * 0.3 + 0.7
            };
            setDetectedLandmarks([overlay]);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleStartScanning = () => {
    setIsScanning(true);
    setDetectedLandmarks([]);
    setSelectedLandmark(null);
  };

  const handleStopScanning = () => {
    setIsScanning(false);
    setDetectedLandmarks([]);
    setScanProgress(0);
  };

  const handleLandmarkSelect = (landmark: Landmark) => {
    setSelectedLandmark(landmark);
  };

  const toggleAudio = () => {
    setIsAudioPlaying(!isAudioPlaying);
    // In a real implementation, this would control audio playback
  };

  const renderAROverlay = () => (
    <div className="absolute inset-0 pointer-events-none">
      {/* Scanning Animation */}
      {isScanning && scanProgress < 100 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-64 h-64 border-2 border-blue-500 rounded-lg animate-pulse">
              <div className="absolute inset-0 bg-blue-500 opacity-10 rounded-lg"></div>
              <div 
                className="absolute bottom-0 left-0 bg-blue-500 opacity-30 rounded-b-lg transition-all duration-200"
                style={{ height: `${scanProgress}%`, width: '100%' }}
              ></div>
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white text-sm">
              Scanning... {scanProgress}%
            </div>
          </div>
        </div>
      )}

      {/* Detected Landmarks */}
      {detectedLandmarks.map((overlay, index) => (
        <div
          key={index}
          className="absolute pointer-events-auto cursor-pointer"
          style={{ 
            left: overlay.position.x, 
            top: overlay.position.y,
            transform: 'translate(-50%, -50%)'
          }}
          onClick={() => handleLandmarkSelect(overlay.landmark)}
        >
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-blue-200 max-w-xs">
            <div className="flex items-center space-x-2 mb-2">
              <Scan className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-sm text-gray-800">{overlay.landmark.name}</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{overlay.distance}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span>{overlay.landmark.rating}</span>
              </div>
              <div className="text-xs text-blue-600">
                Confidence: {(overlay.confidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLandmarkDetails = () => {
    if (!selectedLandmark) return null;

    return (
      <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-sm p-6 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{selectedLandmark.name}</h3>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{selectedLandmark.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{selectedLandmark.visitDuration}</span>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                {selectedLandmark.category}
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedLandmark(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-700 mb-4">{selectedLandmark.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Historical Information</h4>
            <p className="text-sm text-gray-600">{selectedLandmark.historicalInfo}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Interesting Facts</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {selectedLandmark.facts.map((fact, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Best Time to Visit</h4>
            <p className="text-sm text-gray-600">{selectedLandmark.bestTimeToVisit}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Nearby Attractions</h4>
            <div className="flex flex-wrap gap-1">
              {selectedLandmark.nearbyAttractions.map((attraction, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {attraction}
                </span>
              ))}
            </div>
          </div>
        </div>

        {selectedLandmark.ticketPrice && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Ticket Price</h4>
            <p className="text-sm text-gray-600">{selectedLandmark.ticketPrice}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={toggleAudio}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isAudioPlaying 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {isAudioPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-sm">{isAudioPlaying ? 'Stop Audio' : 'Audio Guide'}</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <Bookmark className="w-4 h-4" />
            <span className="text-sm">Save</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <Share2 className="w-4 h-4" />
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Camera View */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* AR Overlay */}
      {renderAROverlay()}

      {/* Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
          <div className="flex items-center space-x-2">
            <Camera className="w-4 h-4" />
            <span className="text-sm">AR Landmark Scanner</span>
          </div>
        </div>
        <div className="flex space-x-2">
          {!isScanning ? (
            <button
              onClick={handleStartScanning}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Scan className="w-4 h-4" />
              <span>Start Scanning</span>
            </button>
          ) : (
            <button
              onClick={handleStopScanning}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <span>Stop</span>
            </button>
          )}
        </div>
      </div>

      {/* Instructions */}
      {!isScanning && detectedLandmarks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-70 text-white p-6 rounded-lg text-center max-w-sm">
            <Scan className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <h3 className="text-lg font-semibold mb-2">AR Landmark Recognition</h3>
            <p className="text-sm text-gray-300 mb-4">
              Point your camera at landmarks to get instant information, historical facts, and audio guides.
            </p>
            <button
              onClick={handleStartScanning}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Start Scanning
            </button>
          </div>
        </div>
      )}

      {/* Landmark Details Panel */}
      {renderLandmarkDetails()}
    </div>
  );
};

export default LandmarkScanner;
