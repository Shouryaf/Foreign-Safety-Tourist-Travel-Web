import React, { useState } from 'react';
import { Trophy, Star, Medal, Gift, Target, Clock, Crown, TrendingUp, CheckCircle } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'exploration' | 'social' | 'cultural' | 'adventure' | 'safety';
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
  unlockedDate?: Date;
  progress: number;
  maxProgress: number;
  reward?: string;
}


interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit?: string;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  rewards: string[];
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  level: number;
  badges: number;
  achievements: number;
}

const TouristGameHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'quests' | 'leaderboard' | 'rewards'>('overview');
  const [userStats, setUserStats] = useState({
    level: 12,
    totalPoints: 2450,
    pointsToNextLevel: 550,
    totalAchievements: 23,
    totalBadges: 8,
    streak: 7,
    rank: 156
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first tourist activity',
      icon: '👣',
      category: 'exploration',
      points: 50,
      rarity: 'common',
      isUnlocked: true,
      unlockedDate: new Date('2024-08-15'),
      progress: 1,
      maxProgress: 1,
      reward: 'Welcome Badge'
    },
    {
      id: '2',
      title: 'Social Butterfly',
      description: 'Connect with 10 fellow tourists',
      icon: '🦋',
      category: 'social',
      points: 200,
      rarity: 'rare',
      isUnlocked: true,
      unlockedDate: new Date('2024-08-20'),
      progress: 10,
      maxProgress: 10,
      reward: 'Social Network Badge'
    },
    {
      id: '3',
      title: 'Culture Enthusiast',
      description: 'Visit 5 museums or cultural sites',
      icon: '🏛️',
      category: 'cultural',
      points: 300,
      rarity: 'epic',
      isUnlocked: false,
      progress: 3,
      maxProgress: 5,
      reward: 'Cultural Explorer Badge'
    },
    {
      id: '4',
      title: 'Safety Champion',
      description: 'Complete 20 safety check-ins',
      icon: '🛡️',
      category: 'safety',
      points: 400,
      rarity: 'epic',
      isUnlocked: false,
      progress: 15,
      maxProgress: 20,
      reward: 'Safety Guardian Badge'
    },
    {
      id: '5',
      title: 'Legendary Explorer',
      description: 'Discover 50 unique landmarks',
      icon: '🗺️',
      category: 'exploration',
      points: 1000,
      rarity: 'legendary',
      isUnlocked: false,
      progress: 32,
      maxProgress: 50,
      reward: 'Master Explorer Title + Premium Features'
    }
  ]);

  const [quests, setQuests] = useState<Quest[]>([
    {
      id: 'q1',
      title: 'Weekend Explorer',
      description: 'Visit 3 new locations this weekend',
      category: 'exploration',
      difficulty: 'easy',
      points: 150,
      timeLimit: '2 days',
      progress: 1,
      maxProgress: 3,
      isCompleted: false,
      rewards: ['150 XP', 'Explorer Badge Progress']
    },
    {
      id: 'q2',
      title: 'Photo Challenge',
      description: 'Take photos at 5 different landmarks',
      category: 'cultural',
      difficulty: 'medium',
      points: 250,
      timeLimit: '1 week',
      progress: 2,
      maxProgress: 5,
      isCompleted: false,
      rewards: ['250 XP', 'Photography Badge', 'Camera Filter Pack']
    },
    {
      id: 'q3',
      title: 'Safety First',
      description: 'Complete daily safety check-ins for 7 days',
      category: 'safety',
      difficulty: 'medium',
      points: 300,
      progress: 4,
      maxProgress: 7,
      isCompleted: false,
      rewards: ['300 XP', 'Safety Streak Badge', 'Emergency Kit Discount']
    }
  ]);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, name: 'Alex Chen', avatar: '/api/placeholder/40/40', points: 5420, level: 18, badges: 15, achievements: 42 },
    { rank: 2, name: 'Maria Garcia', avatar: '/api/placeholder/40/40', points: 4890, level: 16, badges: 12, achievements: 38 },
    { rank: 3, name: 'James Wilson', avatar: '/api/placeholder/40/40', points: 4650, level: 15, badges: 11, achievements: 35 },
    { rank: 4, name: 'Sophie Martin', avatar: '/api/placeholder/40/40', points: 4200, level: 14, badges: 10, achievements: 32 },
    { rank: 5, name: 'David Kim', avatar: '/api/placeholder/40/40', points: 3980, level: 13, badges: 9, achievements: 30 }
  ]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Level {userStats.level}</h2>
              <p className="text-blue-100">Tourist Explorer</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{userStats.totalPoints.toLocaleString()}</div>
            <div className="text-sm text-blue-100">Total Points</div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress to Level {userStats.level + 1}</span>
            <span>{userStats.pointsToNextLevel} XP needed</span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${((3000 - userStats.pointsToNextLevel) / 3000) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{userStats.totalAchievements}</div>
            <div className="text-xs text-blue-100">Achievements</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{userStats.totalBadges}</div>
            <div className="text-xs text-blue-100">Badges</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{userStats.streak}</div>
            <div className="text-xs text-blue-100">Day Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold">#{userStats.rank}</div>
            <div className="text-xs text-blue-100">Global Rank</div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Achievements</h3>
        <div className="space-y-3">
          {achievements.filter(a => a.isUnlocked).slice(0, 3).map((achievement) => (
            <div key={achievement.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl">{achievement.icon}</div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{achievement.title}</h4>
                <p className="text-sm text-gray-600">{achievement.description}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">+{achievement.points}</div>
                <div className="text-xs text-gray-500">XP</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Quests */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Quests</h3>
        <div className="space-y-4">
          {quests.filter(q => !q.isCompleted).slice(0, 2).map((quest) => (
            <div key={quest.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-800">{quest.title}</h4>
                  <p className="text-sm text-gray-600">{quest.description}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(quest.difficulty)}`}>
                  {quest.difficulty}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{quest.progress}/{quest.maxProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(quest.progress / quest.maxProgress) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">{quest.points} XP</div>
                  {quest.timeLimit && (
                    <div className="text-xs text-gray-500">{quest.timeLimit} left</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Achievements</h3>
        <div className="flex space-x-2">
          {['all', 'exploration', 'social', 'cultural', 'adventure', 'safety'].map((category) => (
            <button
              key={category}
              className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 capitalize"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`border-2 rounded-xl p-4 transition-all ${
              achievement.isUnlocked 
                ? `${getRarityColor(achievement.rarity)} border-opacity-50` 
                : 'border-gray-200 bg-gray-50 opacity-60'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{achievement.icon}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-gray-800">{achievement.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-700' :
                    achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                    achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {achievement.rarity}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                
                {!achievement.isUnlocked && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{achievement.points} XP</span>
                  </div>
                  {achievement.isUnlocked && achievement.unlockedDate && (
                    <span className="text-xs text-gray-500">
                      Unlocked {achievement.unlockedDate.toLocaleDateString()}
                    </span>
                  )}
                </div>

                {achievement.reward && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <strong>Reward:</strong> {achievement.reward}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderQuests = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Daily & Weekly Quests</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Target className="w-4 h-4" />
          <span>Refresh Quests</span>
        </button>
      </div>

      <div className="space-y-4">
        {quests.map((quest) => (
          <div key={quest.id} className="bg-white rounded-xl shadow-soft p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">{quest.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(quest.difficulty)}`}>
                    {quest.difficulty}
                  </span>
                  {quest.timeLimit && (
                    <div className="flex items-center space-x-1 text-orange-600">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{quest.timeLimit}</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{quest.description}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{quest.progress}/{quest.maxProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${(quest.progress / quest.maxProgress) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Rewards:</h5>
                  <div className="flex flex-wrap gap-2">
                    {quest.rewards.map((reward, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        {reward}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-blue-600">{quest.points}</div>
                <div className="text-sm text-gray-500">XP</div>
                {quest.isCompleted && (
                  <div className="mt-2">
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <Trophy className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Global Leaderboard</h2>
            <p className="text-yellow-100">Compete with tourists worldwide</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="space-y-4">
          {leaderboard.map((entry) => (
            <div key={entry.rank} className={`flex items-center space-x-4 p-4 rounded-lg ${
              entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                entry.rank === 1 ? 'bg-yellow-500 text-white' :
                entry.rank === 2 ? 'bg-gray-400 text-white' :
                entry.rank === 3 ? 'bg-orange-600 text-white' :
                'bg-gray-200 text-gray-700'
              }`}>
                {entry.rank <= 3 ? (
                  entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'
                ) : (
                  entry.rank
                )}
              </div>
              
              <img src={entry.avatar} alt={entry.name} className="w-10 h-10 rounded-full" />
              
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{entry.name}</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Level {entry.level}</span>
                  <span>{entry.badges} badges</span>
                  <span>{entry.achievements} achievements</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{entry.points.toLocaleString()}</div>
                <div className="text-sm text-gray-500">points</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRewards = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Rewards Store</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { id: 1, name: 'Premium Map Themes', cost: 500, type: 'digital', icon: '🗺️' },
          { id: 2, name: 'AR Filter Pack', cost: 750, type: 'digital', icon: '📱' },
          { id: 3, name: 'Local Restaurant Discount', cost: 1000, type: 'voucher', icon: '🍽️' },
          { id: 4, name: 'Museum Pass', cost: 1200, type: 'voucher', icon: '🏛️' },
          { id: 5, name: 'Exclusive Badge Collection', cost: 1500, type: 'digital', icon: '🏆' },
          { id: 6, name: 'VIP Tour Guide Access', cost: 2000, type: 'service', icon: '👨‍🏫' }
        ].map((reward) => (
          <div key={reward.id} className="bg-white rounded-xl shadow-soft p-4 hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{reward.icon}</div>
              <h4 className="font-semibold text-gray-800">{reward.name}</h4>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-bold text-blue-600">{reward.cost}</span>
              </div>
              <button className={`px-3 py-1 rounded text-sm font-medium ${
                userStats.totalPoints >= reward.cost
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}>
                {userStats.totalPoints >= reward.cost ? 'Redeem' : 'Locked'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Navigation */}
      <div className="bg-white rounded-xl shadow-soft mb-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview', icon: TrendingUp },
            { key: 'achievements', label: 'Achievements', icon: Trophy },
            { key: 'quests', label: 'Quests', icon: Target },
            { key: 'leaderboard', label: 'Leaderboard', icon: Medal },
            { key: 'rewards', label: 'Rewards', icon: Gift }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
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

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'achievements' && renderAchievements()}
      {activeTab === 'quests' && renderQuests()}
      {activeTab === 'leaderboard' && renderLeaderboard()}
      {activeTab === 'rewards' && renderRewards()}
    </div>
  );
};

export default TouristGameHub;
