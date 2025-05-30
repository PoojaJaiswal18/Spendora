export type * from './User';
export type * from './Receipt';
export type * from './Category';
export type * from './Challenge';
export type * from './Report';
export type * from './Analytics';
export type * from './ApiResponse';
export type * from './Common';
export type * from './Auth';
export type * from './Notification';
export type * from './Theme';

export type { DateRange } from './Common';


export type { PaymentMethod } from './Receipt';


export type { 
  UserProfile,
  UserSubscription,
  PrivacySettings,
  SocialLinks
} from './Auth';

export type { NotificationPreferences } from './Notification';


export type { FilterCriteria } from './Notification';

export type { 
  ColorPalette,
  ThemeColors
} from './Theme';

export type { User, UserPreferences } from './User';
export type { Receipt, ReceiptItem, OCRData, BoundingBox } from './Receipt';
export type { Category } from './Category';
export type { Challenge, UserChallenge } from './Challenge';
export type { Report } from './Report';
export type { ApiResponse, PaginatedResponse } from './ApiResponse';

export type { DateRange as ReportDateRange } from './Report';
export type { DateRange as AnalyticsDateRange } from './Analytics';

export type { UserProfile as CommonUserProfile } from './User';
export type { UserSubscription as CommonUserSubscription } from './User';
export type { PrivacySettings as UserPrivacySettings } from './User';
export type { SocialLinks as UserSocialLinks } from './User';
export type { NotificationPreferences as UserNotificationPreferences } from './User';
export type { FilterCriteria as ApiFilterCriteria } from './ApiResponse';
export type { ColorPalette as CommonColorPalette } from './Common';
export type { ThemeColors as CommonThemeColors } from './Common';


export type {
  AnalyticsData,
  AnalyticsOverview,
  SpendingTrend,
  CategoryAnalytics,
  MerchantAnalytics,
  SpendingPattern,
  AnalyticsInsight,
  InsightType,
  SpendingPrediction,
  PeriodComparison,
  AnalyticsFilter,
  AnalyticsMetrics
} from './Analytics';


export type {
  AuthUser,
  AuthTokens,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  AuthState,
  AuthContextType,
  SecuritySettings
} from './Auth';

export type {
  Notification,
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
  NotificationTemplate,
  NotificationCampaign
} from './Notification';


export type {
  ThemeConfig,
  ThemeMode,
  ComponentThemes,
  ButtonTheme,
  InputTheme,
  CardTheme
} from './Theme';
