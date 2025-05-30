// Base user interfaces
export interface UserPreferences {
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
  dashboard: DashboardSettings;
}

export interface UserProfile {
  bio?: string;
  website?: string;
  location?: string;
  company?: string;
  jobTitle?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  profileVisibility: 'public' | 'private' | 'friends_only';
  socialLinks: SocialLinks;
  interests: string[];
  skills: string[];
  achievements: Achievement[];
}

export interface UserSubscription {
  id: string;
  planId: string;
  planName: string;
  planType: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  endDate?: string;
  trialEndDate?: string;
  autoRenew: boolean;
  features: SubscriptionFeature[];
  usage: UsageMetrics;
  billing: BillingInfo;
  paymentMethod?: PaymentMethod;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  marketing: boolean;
  security: boolean;
  updates: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends_only';
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  allowDataCollection: boolean;
  allowAnalytics: boolean;
  allowMarketing: boolean;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra_large';
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}

export interface DashboardSettings {
  layout: 'grid' | 'list' | 'compact';
  widgets: DashboardWidget[];
  defaultView: 'overview' | 'analytics' | 'transactions' | 'budgets';
  refreshInterval: number;
}

export interface DashboardWidget {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  settings: Record<string, any>;
  isVisible: boolean;
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: string;
  points: number;
}

export interface SubscriptionFeature {
  name: string;
  description: string;
  included: boolean;
  limit?: number;
  unlimited: boolean;
}

export interface UsageMetrics {
  transactions: { used: number; limit: number };
  budgets: { used: number; limit: number };
  reports: { used: number; limit: number };
  storage: { used: number; limit: number };
  apiCalls: { used: number; limit: number };
}

export interface BillingInfo {
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  nextBillingDate?: string;
  lastBillingDate?: string;
  invoices: Invoice[];
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  date: string;
  downloadUrl?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal' | 'stripe';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  operatingSystem: string;
  browser: string;
  userAgent: string;
  screenResolution?: string;
  timezone: string;
  language: string;
}

// Main Auth interfaces
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  roles: UserRole[];
  permissions: Permission[];
  preferences: UserPreferences;
  profile: UserProfile;
  subscription: UserSubscription;
  lastLogin?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isDefault: boolean;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  scope?: PermissionScope;
}

export type PermissionScope = 'own' | 'team' | 'organization' | 'global';

export type AccountStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification' | 'locked';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
  captchaToken?: string;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
  sessionInfo: SessionInfo;
  requiresTwoFactor?: boolean;
  twoFactorMethods?: TwoFactorMethod[];
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  marketingOptIn?: boolean;
  referralCode?: string;
  deviceInfo?: DeviceInfo;
  captchaToken?: string;
}

export interface RegisterResponse {
  user: AuthUser;
  tokens: AuthTokens;
  sessionInfo: SessionInfo;
  verificationRequired: boolean;
  verificationMethods: VerificationMethod[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: string;
  scope: string[];
}

export interface SessionInfo {
  sessionId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface TwoFactorMethod {
  type: 'sms' | 'email' | 'authenticator' | 'backup_codes';
  identifier: string;
  isEnabled: boolean;
  isPrimary: boolean;
  createdAt: string;
}

export interface TwoFactorRequest {
  sessionId: string;
  method: string;
  code: string;
}

export interface TwoFactorResponse {
  success: boolean;
  tokens?: AuthTokens;
  remainingAttempts?: number;
  lockoutTime?: string;
}

export interface VerificationMethod {
  type: 'email' | 'sms' | 'phone_call';
  identifier: string;
  expiresAt: string;
}

export interface PasswordResetRequest {
  email: string;
  captchaToken?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  resetToken?: string;
  expiresAt?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface PhoneVerificationRequest {
  phoneNumber: string;
  code: string;
}

export interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionInfo: SessionInfo | null;
  lastActivity: string | null;
}

export interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  register: (userData: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<AuthTokens>;
  verifyTwoFactor: (request: TwoFactorRequest) => Promise<TwoFactorResponse>;
  resetPassword: (request: PasswordResetRequest) => Promise<PasswordResetResponse>;
  changePassword: (request: PasswordChangeRequest) => Promise<void>;
  verifyEmail: (request: EmailVerificationRequest) => Promise<void>;
  verifyPhone: (request: PhoneVerificationRequest) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<AuthUser>;
  checkPermission: (permission: string, resource?: string) => boolean;
  hasRole: (role: string) => boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethods: TwoFactorMethod[];
  trustedDevices: TrustedDevice[];
  activeSessions: SessionInfo[];
  loginHistory: LoginAttempt[];
  securityQuestions: SecurityQuestion[];
  backupCodes: BackupCode[];
  passwordPolicy: PasswordPolicy;
}

export interface TrustedDevice {
  id: string;
  name: string;
  deviceInfo: DeviceInfo;
  addedAt: string;
  lastUsed: string;
  isActive: boolean;
}

export interface LoginAttempt {
  id: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  success: boolean;
  failureReason?: string;
  deviceInfo?: DeviceInfo;
}

export interface SecurityQuestion {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

export interface BackupCode {
  id: string;
  code: string;
  used: boolean;
  usedAt?: string;
  createdAt: string;
}

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number;
  expirationDays: number;
  warningDays: number;
}
