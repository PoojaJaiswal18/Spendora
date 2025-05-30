import { apiUtils } from './api';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'spending_limit' | 'savings_goal' | 'category_limit' | 'merchant_avoid' | 'streak';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in days
  targetAmount?: number;
  targetDays?: number;
  category?: string;
  merchant?: string;
  startDate: string;
  endDate: string;
  participants: number;
  maxParticipants?: number;
  rewards: ChallengeReward[];
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
  isPublic: boolean;
  tags: string[];
  rules: ChallengeRule[];
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeReward {
  type: 'points' | 'badge' | 'discount' | 'cashback';
  value: number;
  description: string;
  condition?: string;
}

export interface ChallengeRule {
  type: 'spending_limit' | 'transaction_count' | 'category_restriction' | 'time_restriction';
  value: any;
  description: string;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  challenge: Challenge;
  joinedAt: string;
  status: 'active' | 'completed' | 'failed' | 'abandoned';
  progress: number; // 0-100
  currentValue: number;
  targetValue: number;
  streak: number;
  bestStreak: number;
  completedAt?: string;
  failedAt?: string;
  achievements: ChallengeAchievement[];
  milestones: ChallengeMilestone[];
  notes: string[];
}

export interface ChallengeAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  points: number;
}

export interface ChallengeMilestone {
  id: string;
  name: string;
  description: string;
  targetProgress: number;
  achieved: boolean;
  achievedAt?: string;
  reward?: ChallengeReward;
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
}

export interface ChallengeStats {
  totalChallenges: number;
  activeChallenges: number;
  completedChallenges: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  successRate: number;
  favoriteCategory: string;
  totalSavings: number;
  achievements: ChallengeAchievement[];
  recentActivity: Array<{
    type: 'joined' | 'completed' | 'failed' | 'milestone';
    challengeTitle: string;
    timestamp: string;
    details: string;
  }>;
}

export interface CreateChallengeRequest {
  title: string;
  description: string;
  type: Challenge['type'];
  difficulty: Challenge['difficulty'];
  duration: number;
  targetAmount?: number;
  targetDays?: number;
  category?: string;
  merchant?: string;
  isPublic: boolean;
  maxParticipants?: number;
  rewards: ChallengeReward[];
  rules: ChallengeRule[];
  tags: string[];
}

class ChallengeService {
  private readonly baseUrl = '/challenges';

  /**
   * Get available challenges with filters
   */
  async getChallenges(
    filters?: {
      status?: Challenge['status'];
      difficulty?: Challenge['difficulty'];
      type?: Challenge['type'];
      category?: string;
      isJoined?: boolean;
      search?: string;
    },
    page = 0,
    size = 20
  ): Promise<{
    challenges: Challenge[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const params: Record<string, any> = {
        page,
        size,
        ...filters,
      };

      const response = await apiUtils.get<{
        content: Challenge[];
        totalElements: number;
        totalPages: number;
        number: number;
      }>(`${this.baseUrl}`, { params });

      return {
        challenges: response.content,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        currentPage: response.number,
      };
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
      throw error;
    }
  }

  /**
   * Get challenge by ID
   */
  async getChallengeById(id: string): Promise<Challenge> {
    try {
      return await apiUtils.get<Challenge>(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch challenge ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new challenge
   */
  async createChallenge(request: CreateChallengeRequest): Promise<Challenge> {
    try {
      return await apiUtils.post<Challenge>(`${this.baseUrl}`, request);
    } catch (error) {
      console.error('Failed to create challenge:', error);
      throw error;
    }
  }

  /**
   * Join a challenge
   */
  async joinChallenge(challengeId: string): Promise<UserChallenge> {
    try {
      return await apiUtils.post<UserChallenge>(`${this.baseUrl}/${challengeId}/join`);
    } catch (error) {
      console.error(`Failed to join challenge ${challengeId}:`, error);
      throw error;
    }
  }

  /**
   * Leave a challenge
   */
  async leaveChallenge(challengeId: string): Promise<void> {
    try {
      await apiUtils.post(`${this.baseUrl}/${challengeId}/leave`);
    } catch (error) {
      console.error(`Failed to leave challenge ${challengeId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's challenges
   */
  async getUserChallenges(
    status?: UserChallenge['status'],
    page = 0,
    size = 20
  ): Promise<{
    userChallenges: UserChallenge[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const params: Record<string, any> = { page, size };
      if (status) params.status = status;

      const response = await apiUtils.get<{
        content: UserChallenge[];
        totalElements: number;
        totalPages: number;
        number: number;
      }>(`${this.baseUrl}/my-challenges`, { params });

      return {
        userChallenges: response.content,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        currentPage: response.number,
      };
    } catch (error) {
      console.error('Failed to fetch user challenges:', error);
      throw error;
    }
  }

  /**
   * Get challenge progress
   */
  async getChallengeProgress(challengeId: string): Promise<UserChallenge> {
    try {
      return await apiUtils.get<UserChallenge>(`${this.baseUrl}/${challengeId}/progress`);
    } catch (error) {
      console.error(`Failed to fetch progress for challenge ${challengeId}:`, error);
      throw error;
    }
  }

  /**
   * Update challenge progress manually
   */
  async updateChallengeProgress(
    challengeId: string,
    progress: {
      currentValue: number;
      notes?: string;
    }
  ): Promise<UserChallenge> {
    try {
      return await apiUtils.post<UserChallenge>(`${this.baseUrl}/${challengeId}/update-progress`, progress);
    } catch (error) {
      console.error(`Failed to update progress for challenge ${challengeId}:`, error);
      throw error;
    }
  }

  /**
   * Get challenge leaderboard
   */
  async getChallengeLeaderboard(
    challengeId: string,
    limit = 50
  ): Promise<LeaderboardEntry[]> {
    try {
      const params = { limit };
      return await apiUtils.get<LeaderboardEntry[]>(`${this.baseUrl}/${challengeId}/leaderboard`, { params });
    } catch (error) {
      console.error(`Failed to fetch leaderboard for challenge ${challengeId}:`, error);
      throw error;
    }
  }

  /**
   * Get global leaderboard
   */
  async getGlobalLeaderboard(
    period: 'week' | 'month' | 'year' | 'all' = 'month',
    limit = 50
  ): Promise<LeaderboardEntry[]> {
    try {
      const params = { period, limit };
      return await apiUtils.get<LeaderboardEntry[]>(`${this.baseUrl}/leaderboard`, { params });
    } catch (error) {
      console.error('Failed to fetch global leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get user challenge statistics
   */
  async getChallengeStats(): Promise<ChallengeStats> {
    try {
      return await apiUtils.get<ChallengeStats>(`${this.baseUrl}/stats`);
    } catch (error) {
      console.error('Failed to fetch challenge stats:', error);
      throw error;
    }
  }

  /**
   * Get challenge recommendations
   */
  async getChallengeRecommendations(limit = 5): Promise<Challenge[]> {
    try {
      const params = { limit };
      return await apiUtils.get<Challenge[]>(`${this.baseUrl}/recommendations`, { params });
    } catch (error) {
      console.error('Failed to fetch challenge recommendations:', error);
      throw error;
    }
  }

  /**
   * Share challenge
   */
  async shareChallenge(challengeId: string, platform: 'twitter' | 'facebook' | 'linkedin' | 'copy'): Promise<{
    shareUrl: string;
    message: string;
  }> {
    try {
      const params = { platform };
      return await apiUtils.post<{
        shareUrl: string;
        message: string;
      }>(`${this.baseUrl}/${challengeId}/share`, {}, { params });
    } catch (error) {
      console.error(`Failed to share challenge ${challengeId}:`, error);
      throw error;
    }
  }

  /**
   * Report challenge
   */
  async reportChallenge(
    challengeId: string,
    reason: string,
    details?: string
  ): Promise<void> {
    try {
      await apiUtils.post(`${this.baseUrl}/${challengeId}/report`, {
        reason,
        details,
      });
    } catch (error) {
      console.error(`Failed to report challenge ${challengeId}:`, error);
      throw error;
    }
  }

  /**
   * Get challenge templates
   */
  async getChallengeTemplates(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    type: Challenge['type'];
    difficulty: Challenge['difficulty'];
    estimatedDuration: number;
    template: Partial<CreateChallengeRequest>;
  }>> {
    try {
      return await apiUtils.get(`${this.baseUrl}/templates`);
    } catch (error) {
      console.error('Failed to fetch challenge templates:', error);
      throw error;
    }
  }

  /**
   * Get achievement details
   */
  async getAchievement(achievementId: string): Promise<ChallengeAchievement & {
    criteria: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    earnedBy: number;
    totalUsers: number;
  }> {
    try {
      return await apiUtils.get(`${this.baseUrl}/achievements/${achievementId}`);
    } catch (error) {
      console.error(`Failed to fetch achievement ${achievementId}:`, error);
      throw error;
    }
  }

  /**
   * Get all available achievements
   */
  async getAllAchievements(): Promise<Array<ChallengeAchievement & {
    criteria: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    earnedBy: number;
    totalUsers: number;
    earned: boolean;
  }>> {
    try {
      return await apiUtils.get(`${this.baseUrl}/achievements`);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      throw error;
    }
  }
}

export const challengeService = new ChallengeService();
export default challengeService;
 
