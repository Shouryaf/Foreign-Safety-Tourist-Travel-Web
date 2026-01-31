import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, MapPin, Calendar, Heart, Share2, Camera, Plus, Send, X } from 'lucide-react';

interface Tourist {
  id: string;
  name: string;
  avatar: string;
  location: string;
  interests: string[];
  isOnline: boolean;
  distance: string;
  mutualConnections: number;
  joinedDate: string;
}

interface Comment {
  id: string;
  author: Tourist;
  content: string;
  timestamp: Date;
  likes: number;
}

interface Post {
  id: string;
  author: Tourist;
  content: string;
  images: string[];
  location: string;
  timestamp: Date;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
  tags: string[];
}

interface Meetup {
  id: string;
  title: string;
  organizer: Tourist;
  location: string;
  date: Date;
  attendees: Tourist[];
  maxAttendees: number;
  description: string;
  category: string;
  isJoined: boolean;
}

const TouristSocialHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'nearby' | 'meetups' | 'chat'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [nearbyTourists, setNearbyTourists] = useState<Tourist[]>([]);
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [newPost, setNewPost] = useState('');
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showShareModal, setShowShareModal] = useState<string | null>(null);

  useEffect(() => {
    // Initialize sample data
    const sampleTourists: Tourist[] = [
      {
        id: '1',
        name: 'Sarah Chen',
        avatar: '/api/placeholder/40/40',
        location: 'Historic District',
        interests: ['Photography', 'Food', 'History'],
        isOnline: true,
        distance: '0.2 km',
        mutualConnections: 3,
        joinedDate: '2024-01-15'
      },
      {
        id: '2',
        name: 'Marco Rodriguez',
        avatar: '/api/placeholder/40/40',
        location: 'Art Quarter',
        interests: ['Art', 'Music', 'Culture'],
        isOnline: false,
        distance: '0.5 km',
        mutualConnections: 1,
        joinedDate: '2024-02-20'
      },
      {
        id: '3',
        name: 'Aisha Patel',
        avatar: '/api/placeholder/40/40',
        location: 'Beach Area',
        interests: ['Adventure', 'Nature', 'Yoga'],
        isOnline: true,
        distance: '1.1 km',
        mutualConnections: 2,
        joinedDate: '2024-03-10'
      }
    ];

    const sampleComments: Comment[] = [
      {
        id: 'c1',
        author: sampleTourists[1],
        content: 'This looks amazing! What time do they open?',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        likes: 2
      },
      {
        id: 'c2',
        author: sampleTourists[2],
        content: 'I was there yesterday! The croissants are the best in the city 🥐',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        likes: 5
      }
    ];

    const samplePosts: Post[] = [
      {
        id: '1',
        author: sampleTourists[0],
        content: 'Just discovered this amazing hidden café in the old town! The local pastries are incredible 🥐✨ #LocalFinds #Foodie',
        images: ['/api/placeholder/400/300'],
        location: 'Old Town Café',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: 24,
        comments: sampleComments,
        isLiked: false,
        tags: ['food', 'local', 'café']
      },
      {
        id: '2',
        author: sampleTourists[1],
        content: 'Street art tour was mind-blowing! Met some incredible local artists. Anyone interested in joining tomorrow\'s workshop? 🎨',
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        location: 'Art District',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        likes: 31,
        comments: [],
        isLiked: true,
        tags: ['art', 'culture', 'workshop']
      }
    ];

    const sampleMeetups: Meetup[] = [
      {
        id: '1',
        title: 'Photography Walk - Golden Hour',
        organizer: sampleTourists[0],
        location: 'City Center',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        attendees: [sampleTourists[0], sampleTourists[2]],
        maxAttendees: 8,
        description: 'Join us for a magical golden hour photography session around the historic city center!',
        category: 'Photography',
        isJoined: false
      },
      {
        id: '2',
        title: 'Local Food Tasting Tour',
        organizer: sampleTourists[1],
        location: 'Market District',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        attendees: [sampleTourists[1]],
        maxAttendees: 6,
        description: 'Explore authentic local cuisine with a native guide. Vegetarian options available!',
        category: 'Food',
        isJoined: true
      }
    ];

    setNearbyTourists(sampleTourists);
    setPosts(samplePosts);
    setMeetups(sampleMeetups);
  }, []);

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleJoinMeetup = (meetupId: string) => {
    setMeetups(prev => prev.map(meetup => 
      meetup.id === meetupId 
        ? { ...meetup, isJoined: !meetup.isJoined }
        : meetup
    ));
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      author: {
        id: 'current-user',
        name: 'You',
        avatar: '/api/placeholder/40/40',
        location: 'Current Location',
        interests: [],
        isOnline: true,
        distance: '0 km',
        mutualConnections: 0,
        joinedDate: '2024-01-01'
      },
      content: newPost,
      images: [],
      location: 'Your Location',
      timestamp: new Date(),
      likes: 0,
      comments: [],
      isLiked: false,
      tags: []
    };

    setPosts(prev => [post, ...prev]);
    setNewPost('');
  };

  const renderFeed = () => (
    <div className="space-y-6">
      {/* Create Post */}
      <div className="bg-white rounded-xl shadow-soft p-4">
        <div className="flex space-x-3">
          <img src="/api/placeholder/40/40" alt="Your avatar" className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your travel experience..."
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-2">
                <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                  <Camera className="w-4 h-4" />
                  <span className="text-sm">Photo</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Location</span>
                </button>
              </div>
              <button
                onClick={handleCreatePost}
                disabled={!newPost.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center space-x-3 mb-4">
            <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{post.author.name}</h4>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                <span>{post.location}</span>
                <span className="mx-2">•</span>
                <span>{post.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-800 mb-4">{post.content}</p>
          
          {post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {post.images.map((image, index) => (
                <img key={index} src={image} alt="Post image" className="rounded-lg w-full h-48 object-cover" />
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              onClick={() => handleLikePost(post.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                post.isLiked ? 'text-red-600 bg-red-50' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{post.likes}</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{post.comments.length}</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50">
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderNearbyTourists = () => (
    <div className="space-y-4">
      {nearbyTourists.map((tourist) => (
        <div key={tourist.id} className="bg-white rounded-xl shadow-soft p-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img src={tourist.avatar} alt={tourist.name} className="w-12 h-12 rounded-full" />
              {tourist.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{tourist.name}</h4>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                <span>{tourist.location} • {tourist.distance}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {tourist.interests.map((interest) => (
                  <span key={interest} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                Connect
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                Message
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMeetups = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Upcoming Meetups</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          <span>Create Meetup</span>
        </button>
      </div>
      
      {meetups.map((meetup) => (
        <div key={meetup.id} className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-800">{meetup.title}</h4>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <span>Organized by {meetup.organizer.name}</span>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
              {meetup.category}
            </span>
          </div>
          
          <p className="text-gray-600 mb-4">{meetup.description}</p>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{meetup.date.toLocaleDateString()} at {meetup.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{meetup.location}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>{meetup.attendees.length}/{meetup.maxAttendees} attending</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {meetup.attendees.slice(0, 3).map((attendee) => (
                <img
                  key={attendee.id}
                  src={attendee.avatar}
                  alt={attendee.name}
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
              ))}
              {meetup.attendees.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                  +{meetup.attendees.length - 3}
                </div>
              )}
            </div>
            <button
              onClick={() => handleJoinMeetup(meetup.id)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                meetup.isJoined
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {meetup.isJoined ? 'Joined' : 'Join Meetup'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-soft mb-6">
        <div className="flex border-b border-gray-200">
          {[
            { key: 'feed', label: 'Feed', icon: MessageCircle },
            { key: 'nearby', label: 'Nearby', icon: Users },
            { key: 'meetups', label: 'Meetups', icon: Calendar },
            { key: 'chat', label: 'Messages', icon: MessageCircle }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'feed' && renderFeed()}
      {activeTab === 'nearby' && renderNearbyTourists()}
      {activeTab === 'meetups' && renderMeetups()}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-xl shadow-soft p-8 text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Messages Coming Soon</h3>
          <p className="text-gray-600">Real-time chat functionality will be available soon!</p>
        </div>
      )}
    </div>
  );
};

export default TouristSocialHub;
