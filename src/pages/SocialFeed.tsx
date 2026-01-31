import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface SocialFeedProps {
  user: any;
}

interface Post {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  images: string[];
  location?: { lat: number; lng: number };
  transport_mode?: string;
  journey_details?: any;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at: string;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ user }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedTransportMode, setSelectedTransportMode] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchFeed();
    requestLocationPermission();
  }, []);

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location permission denied:', error);
        }
      );
    }
  };

  const fetchFeed = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8002/api/social/feed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feed:', error);
      toast.error('Failed to load social feed');
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.trim()) {
      toast.error('Please enter some content');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const postData = {
        content: newPost,
        location: userLocation,
        transport_mode: selectedTransportMode || undefined,
        journey_details: selectedTransportMode ? { mode: selectedTransportMode } : undefined
      };

      await axios.post('http://localhost:8002/api/social/posts', postData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Post created successfully!');
      setNewPost('');
      setSelectedTransportMode('');
      setShowCreatePost(false);
      fetchFeed();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:8002/api/social/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the post in the local state
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, is_liked: response.data.is_liked, likes_count: response.data.likes_count }
          : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Social Feed</h1>
          
          {/* Create Post Button */}
          <button
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Share your travel experience
          </button>
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Post</h2>
            
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's happening on your journey?"
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Transport Mode (Optional)</label>
              <select
                value={selectedTransportMode}
                onChange={(e) => setSelectedTransportMode(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select transport mode</option>
                <option value="train">🚂 Train</option>
                <option value="bus">🚌 Bus</option>
                <option value="flight">✈️ Flight</option>
                <option value="taxi">🚕 Taxi</option>
                <option value="metro">🚇 Metro</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowCreatePost(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createPost}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-lg p-6">
                {/* Post Header */}
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {post.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">{post.user_name}</p>
                    <p className="text-sm text-gray-500">{formatTimeAgo(post.created_at)}</p>
                  </div>
                  {post.transport_mode && (
                    <div className="ml-auto">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {post.transport_mode === 'train' && '🚂'} 
                        {post.transport_mode === 'bus' && '🚌'} 
                        {post.transport_mode === 'flight' && '✈️'} 
                        {post.transport_mode === 'taxi' && '🚕'} 
                        {post.transport_mode === 'metro' && '🚇'} 
                        {post.transport_mode}
                      </span>
                    </div>
                  )}
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Location */}
                {post.location && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Location: {post.location.lat.toFixed(4)}, {post.location.lng.toFixed(4)}
                    </div>
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      post.is_liked 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <svg className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {post.likes_count} {post.likes_count === 1 ? 'Like' : 'Likes'}
                  </button>

                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {post.comments_count} {post.comments_count === 1 ? 'Comment' : 'Comments'}
                  </button>

                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-4">Be the first to share your travel experience!</p>
              <button
                onClick={() => setShowCreatePost(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Post
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialFeed;
