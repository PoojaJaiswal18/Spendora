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
