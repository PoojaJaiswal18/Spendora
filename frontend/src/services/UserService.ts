import { apiUtils } from './api';
import { User } from '../types';

// Create a simple auth utility class since authUtils is not available
class AuthUtils {
  private readonly TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

const authUtils = new AuthUtils();

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  marketingOptIn?: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  avatar?: File;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  currency: string;
  dateFormat: string;
  timeZone: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
    budgetAlerts: boolean;
    challengeUpdates: boolean;
    weeklyReports: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showInLeaderboards: boolean;
    shareSpendingInsights: boolean;
  };
  dashboard: {
    defaultView: 'overview' | 'analytics' | 'challenges';
    showQuickActions: boolean;
    compactMode: boolean;
  };
  budgets: {
    defaultCategories: string[];
    autoCreateBudgets: boolean;
    budgetPeriod: 'weekly' | 'monthly' | 'yearly';
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserStats {
  totalReceipts: number;
  totalSpending: number;
  joinedDate: string;
  challengesCompleted: number;
  achievementsEarned: number;
  currentStreak: number;
  longestStreak: number;
  favoriteCategory: string;
  averageMonthlySpending: number;
  savingsThisYear: number;
  rank: number;
  level: number;
  experiencePoints: number;
  nextLevelPoints: number;
}

export interface ActivityLog {
  id: string;
  type: 'login' | 'logout' | 'receipt_upload' | 'profile_update' | 'challenge_join' | 'achievement_earned';
  description: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  sessionTimeout: number;
  trustedDevices: Array<{
    id: string;
    name: string;
    lastUsed: string;
    location: string;
    isCurrent: boolean;
  }>;
  recentLogins: Array<{
    timestamp: string;
    ipAddress: string;
    location: string;
    userAgent: string;
    success: boolean;
  }>;
}

class UserService {
  private readonly baseUrl = '/users';
  private readonly authUrl = '/auth';

  /**
   * Login user
   */
  async login(request: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiUtils.post<AuthResponse>(`${this.authUrl}/login`, request);
      // Store tokens
      authUtils.setToken(response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(request: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiUtils.post<AuthResponse>(`${this.authUrl}/register`, request);
      // Store tokens
      authUtils.setToken(response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiUtils.post(`${this.authUrl}/logout`, { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if server logout fails
    } finally {
      authUtils.removeToken();
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiUtils.post<AuthResponse>(`${this.authUrl}/refresh`, {
        refreshToken,
      });

      // Update stored tokens
      authUtils.setToken(response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }

      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      authUtils.removeToken();
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      return await apiUtils.get<User>(`${this.baseUrl}/me`);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(request: UpdateProfileRequest): Promise<User> {
    try {
      let updatedRequest = { ...request };
      
      if (request.avatar) {
        // Upload avatar separately
        const avatarUrl = await this.uploadAvatar(request.avatar);
        updatedRequest = { ...request, avatar: undefined };
        // Add avatar URL to request
        (updatedRequest as any).avatarUrl = avatarUrl;
      }

      return await apiUtils.put<User>(`${this.baseUrl}/me`, updatedRequest);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File): Promise<string> {
    try {
      const response = await apiUtils.upload<{ avatarUrl: string }>(
        `${this.baseUrl}/me/avatar`,
        file
      );
      return response.avatarUrl;
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(request: ChangePasswordRequest): Promise<void> {
    try {
      await apiUtils.post(`${this.baseUrl}/me/change-password`, request);
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    try {
      await apiUtils.post(`${this.authUrl}/forgot-password`, request);
    } catch (error) {
      console.error('Failed to request password reset:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    try {
      await apiUtils.post(`${this.authUrl}/reset-password`, request);
    } catch (error) {
      console.error('Failed to reset password:', error);
      throw error;
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    try {
      return await apiUtils.get<UserPreferences>(`${this.baseUrl}/me/preferences`);
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      return await apiUtils.put<UserPreferences>(`${this.baseUrl}/me/preferences`, preferences);
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    try {
      return await apiUtils.get<UserStats>(`${this.baseUrl}/me/stats`);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      throw error;
    }
  }

  /**
   * Get activity log
   */
  async getActivityLog(
    page = 0,
    size = 20,
    type?: ActivityLog['type']
  ): Promise<{
    activities: ActivityLog[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const params: Record<string, any> = { page, size };
      if (type) params.type = type;

      const response = await apiUtils.get<{
        content: ActivityLog[];
        totalElements: number;
        totalPages: number;
        number: number;
      }>(`${this.baseUrl}/me/activity`, { params });

      return {
        activities: response.content,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        currentPage: response.number,
      };
    } catch (error) {
      console.error('Failed to fetch activity log:', error);
      throw error;
    }
  }

  /**
   * Get security settings
   */
  async getSecuritySettings(): Promise<SecuritySettings> {
    try {
      return await apiUtils.get<SecuritySettings>(`${this.baseUrl}/me/security`);
    } catch (error) {
      console.error('Failed to fetch security settings:', error);
      throw error;
    }
  }

  /**
   * Enable two-factor authentication
   */
  async enableTwoFactor(): Promise<{
    qrCode: string;
    secret: string;
    backupCodes: string[];
  }> {
    try {
      return await apiUtils.post<{
        qrCode: string;
        secret: string;
        backupCodes: string[];
      }>(`${this.baseUrl}/me/security/2fa/enable`);
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      throw error;
    }
  }

  /**
   * Verify and confirm two-factor authentication
   */
  async confirmTwoFactor(code: string): Promise<void> {
    try {
      await apiUtils.post(`${this.baseUrl}/me/security/2fa/confirm`, { code });
    } catch (error) {
      console.error('Failed to confirm 2FA:', error);
      throw error;
    }
  }

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(password: string): Promise<void> {
    try {
      await apiUtils.post(`${this.baseUrl}/me/security/2fa/disable`, { password });
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      throw error;
    }
  }

  /**
   * Remove trusted device
   */
  async removeTrustedDevice(deviceId: string): Promise<void> {
    try {
      await apiUtils.delete(`${this.baseUrl}/me/security/devices/${deviceId}`);
    } catch (error) {
      console.error(`Failed to remove trusted device ${deviceId}:`, error);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(password: string, reason?: string): Promise<void> {
    try {
      await apiUtils.post(`${this.baseUrl}/me/delete`, {
        password,
        reason,
      });
      // Clear local storage
      authUtils.removeToken();
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  }

  /**
   * Export user data
   */
  async exportUserData(format: 'json' | 'csv' = 'json'): Promise<void> {
    try {
      await apiUtils.download(`${this.baseUrl}/me/export?format=${format}`, `user-data.${format}`);
    } catch (error) {
      console.error('Failed to export user data:', error);
      throw error;
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      await apiUtils.post(`${this.authUrl}/verify-email`, { token });
    } catch (error) {
      console.error('Failed to verify email:', error);
      throw error;
    }
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<void> {
    try {
      await apiUtils.post(`${this.authUrl}/resend-verification`);
    } catch (error) {
      console.error('Failed to resend email verification:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
export default userService;
