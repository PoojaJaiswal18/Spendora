export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  category?: string;
  targetAmount?: number;
  targetDays?: number;
  targetCount?: number;
  duration: number;
  startDate: string;
  endDate: string;
  participants: number;
  maxParticipants?: number;
  rewards: ChallengeReward[];
  rules: ChallengeRule[];
  status: ChallengeStatus;
  tags: string[];
  imageUrl?: string;
  createdBy: string;
  isPublic: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type ChallengeType = 
  | 'spending_limit' 
  | 'savings_goal' 
  | 'category_limit' 
  | 'merchant_avoid' 
  | 'streak' 
  | 'budget_challenge'
  | 'no_spend'
  | 'cashback_maximize';

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type ChallengeStatus = 'upcoming' | 'active' | 'completed' | 'cancelled' | 'expired';

export interface ChallengeReward {
  id: string;
  type: 'points' | 'badge' | 'discount' | 'cashback' | 'premium_feature';
  value: number;
  description: string;
  imageUrl?: string;
  condition?: string;
  expiresAt?: string;
}

export interface ChallengeRule {
  id: string;
  type: 'spending_limit' | 'transaction_count' | 'category_restriction' | 'time_restriction' | 'merchant_restriction';
  description: string;
  value: any;
  isRequired: boolean;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  challenge?: Challenge;
  joinedAt: string;
  status: UserChallengeStatus;
  progress: number;
  currentValue: number;
  targetValue: number;
  streak: number;
  bestStreak: number;
  completedAt?: string;
  failedAt?: string;
  abandonedAt?: string;
  achievements: ChallengeAchievement[];
  milestones: ChallengeMilestone[];
  notes: string[];
  rank?: number;
  score: number;
}

export type UserChallengeStatus = 'active' | 'completed' | 'failed' | 'abandoned' | 'paused';

export interface ChallengeAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
  points: number;
  category: string;
}

export interface ChallengeMilestone {
  id: string;
  name: string;
  description: string;
  targetProgress: number;
  achieved: boolean;
  achievedAt?: string;
  reward?: ChallengeReward;
  order: number;
}

export interface ChallengeLeaderboard {
  challengeId: string;
  entries: LeaderboardEntry[];
  totalParticipants: number;
  lastUpdated: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  progress: number;
  achievements: number;
  joinedAt: string;
  isCurrentUser: boolean;
  trend: 'up' | 'down' | 'same';
}

export interface ChallengeStats {
  totalChallenges: number;
  activeChallenges: number;
  completedChallenges: number;
  failedChallenges: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  successRate: number;
  favoriteCategory: string;
  totalSavings: number;
  averageCompletion: number;
  achievements: ChallengeAchievement[];
  recentActivity: ChallengeActivity[];
}

export interface ChallengeActivity {
  id: string;
  type: 'joined' | 'completed' | 'failed' | 'milestone' | 'achievement';
  challengeTitle: string;
  timestamp: string;
  details: string;
  points?: number;
}
 
