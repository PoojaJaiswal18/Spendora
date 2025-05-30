export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
  preferences?: UserPreferences;
  profile?: UserProfile;
  settings?: UserSettings;
  subscription?: UserSubscription;
  stats?: UserStats;
}

export interface UserPreferences {
  currency: string;
  dateFormat: 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd';
  timeFormat: '12h' | '24h';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  dashboard: DashboardPreferences;
  theme: ThemePreferences;
}

export interface UserProfile {
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  dateOfBirth?: string;
  occupation?: string;
  company?: string;
  socialLinks?: SocialLinks;
}

export interface UserSettings {
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  loginNotifications: boolean;
  dataExportEnabled: boolean;
  accountDeletionRequested?: string;
  lastPasswordChange?: string;
}

export interface UserSubscription {
  plan: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate: string;
  endDate?: string;
  features: string[];
  billingCycle?: 'monthly' | 'yearly';
  autoRenew: boolean;
}

export interface UserStats {
  totalReceipts: number;
  totalSpending: number;
  averageMonthlySpending: number;
  categoriesUsed: number;
  challengesCompleted: number;
  achievementsEarned: number;
  currentStreak: number;
  longestStreak: number;
  joinedDate: string;
  lastActivity: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  budgetAlerts: boolean;
  challengeUpdates: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  securityAlerts: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showInLeaderboards: boolean;
  shareSpendingInsights: boolean;
  allowDataCollection: boolean;
  showOnlineStatus: boolean;
}

export interface DashboardPreferences {
  defaultView: 'overview' | 'analytics' | 'challenges';
  showQuickActions: boolean;
  compactMode: boolean;
  widgetOrder: string[];
  chartsEnabled: boolean;
  animationsEnabled: boolean;
}

export interface ThemePreferences {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  facebook?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'login' | 'logout' | 'receipt_upload' | 'profile_update' | 'challenge_join' | 'achievement_earned';
  description: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}
 
