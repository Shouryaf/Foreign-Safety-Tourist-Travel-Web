import React, { useState, useEffect } from 'react';
import { Radio, Volume2, VolumeX, Mic, MicOff, Signal, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface RadioChannel {
  id: string;
  name: string;
  frequency: string;
  type: 'emergency' | 'police' | 'medical' | 'fire' | 'transport';
  isActive: boolean;
  userCount: number;
}

export default function EmergencyRadio() {
  const [channels, setChannels] = useState<RadioChannel[]>([
    {
      id: '1',
      name: 'Emergency Services',
      frequency: '156.800',
      type: 'emergency',
      isActive: true,
      userCount: 45
    },
    {
      id: '2',
      name: 'Police Control',
      frequency: '460.250',
      type: 'police',
      isActive: true,
      userCount: 23
    },
    {
      id: '3',
      name: 'Medical Emergency',
      frequency: '463.000',
      type: 'medical',
      isActive: true,
      userCount: 12
    },
    {
      id: '4',
      name: 'Fire Department',
      frequency: '154.280',
      type: 'fire',
      isActive: true,
      userCount: 8
    }
  ]);

  const [selectedChannel, setSelectedChannel] = useState<string>('1');
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [signalStrength, setSignalStrength] = useState(4);

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
    const channel = channels.find(c => c.id === channelId);
    toast.success(`Tuned to ${channel?.name}`);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    toast.success(isListening ? 'Radio stopped' : 'Radio started');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? 'Audio unmuted' : 'Audio muted');
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    toast.success(isMicOn ? 'Microphone off' : 'Microphone on');
  };

  const getChannelTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'text-red-600 bg-red-100';
      case 'police': return 'text-blue-600 bg-blue-100';
      case 'medical': return 'text-green-600 bg-green-100';
      case 'fire': return 'text-orange-600 bg-orange-100';
      case 'transport': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const selectedChannelData = channels.find(c => c.id === selectedChannel);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Radio className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Emergency Radio</h1>
              <p className="text-gray-600">Real-time emergency communication channels</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Radio Control Panel */}
          <div className="bg-gray-900 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white">
                <div className="text-lg font-semibold">
                  {selectedChannelData?.name || 'No Channel Selected'}
                </div>
                <div className="text-sm opacity-75">
                  {selectedChannelData?.frequency} MHz
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Signal className="w-5 h-5 text-green-400" />
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <div
                      key={bar}
                      className={`w-1 h-4 rounded ${
                        bar <= signalStrength ? 'bg-green-400' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleListening}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  isListening
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Radio className="w-5 h-5" />
                {isListening ? 'Stop' : 'Listen'}
              </button>

              <button
                onClick={toggleMute}
                className={`p-3 rounded-lg transition-colors ${
                  isMuted
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleMic}
                className={`p-3 rounded-lg transition-colors ${
                  isMicOn
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
            </div>

            {isListening && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm">LIVE</span>
                </div>
              </div>
            )}
          </div>

          {/* Channel List */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Channels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => handleChannelSelect(channel.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedChannel === channel.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold text-gray-900">{channel.name}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChannelTypeColor(channel.type)}`}>
                      {channel.type.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{channel.frequency} MHz</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{channel.userCount} active</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-2">
                    <div className={`w-2 h-2 rounded-full ${channel.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-gray-500">
                      {channel.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Notice */}
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <Radio className="w-5 h-5" />
              <span className="font-medium">Emergency Communication Protocol</span>
            </div>
            <p className="text-red-700 text-sm">
              This emergency radio system is for crisis communication only. 
              Misuse may result in legal consequences. Always follow proper radio etiquette 
              and emergency procedures when using these channels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}