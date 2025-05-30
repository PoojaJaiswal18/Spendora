// Import DeviceInfo from Auth types
import { DeviceInfo } from './Auth';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  data?: NotificationData;
  priority: NotificationPriority;
  status: NotificationStatus;
  channels: NotificationChannel[];
  scheduledAt?: string;
  sentAt?: string;
  readAt?: string;
  expiresAt?: string;
  actionUrl?: string;
  actionLabel?: string;
  imageUrl?: string;
  iconUrl?: string;
  tags: string[];
  metadata: NotificationMetadata;
  createdAt: string;
  updatedAt?: string;
}

export type NotificationType = 
  | 'budget_alert'
  | 'spending_limit'
  | 'receipt_processed'
  | 'challenge_update'
  | 'achievement_earned'
  | 'report_ready'
  | 'payment_reminder'
  | 'security_alert'
  | 'system_update'
  | 'promotional'
  | 'social'
  | 'reminder';

export type NotificationCategory = 
  | 'financial'
  | 'security'
  | 'social'
  | 'system'
  | 'marketing'
  | 'reminder';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'expired';

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms' | 'webhook';

export interface NotificationData {
  [key: string]: any;
  amount?: number;
  category?: string;
  merchant?: string;
  challengeId?: string;
  reportId?: string;
  receiptId?: string;
  url?: string;
}

export interface NotificationMetadata {
  source: string;
  campaign?: string;
  segment?: string;
  experiment?: string;
  deviceInfo?: DeviceInfo;
  location?: string;
  retryCount?: number;
  lastRetry?: string;
}

export interface NotificationPreferences {
  userId: string;
  channels: ChannelPreferences;
  types: TypePreferences;
  schedule: SchedulePreferences;
  frequency: FrequencyPreferences;
  updatedAt: string;
}

export interface ChannelPreferences {
  inApp: ChannelSetting;
  email: ChannelSetting;
  push: ChannelSetting;
  sms: ChannelSetting;
}

export interface ChannelSetting {
  enabled: boolean;
  types: NotificationType[];
  quietHours?: QuietHours;
  frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

// Fixed: Removed mapped type syntax error
export interface TypePreferences {
  budget_alert: TypePreferenceSetting;
  spending_limit: TypePreferenceSetting;
  receipt_processed: TypePreferenceSetting;
  challenge_update: TypePreferenceSetting;
  achievement_earned: TypePreferenceSetting;
  report_ready: TypePreferenceSetting;
  payment_reminder: TypePreferenceSetting;
  security_alert: TypePreferenceSetting;
  system_update: TypePreferenceSetting;
  promotional: TypePreferenceSetting;
  social: TypePreferenceSetting;
  reminder: TypePreferenceSetting;
}

export interface TypePreferenceSetting {
  enabled: boolean;
  channels: NotificationChannel[];
  priority: NotificationPriority;
}

export interface SchedulePreferences {
  timezone: string;
  quietHours: QuietHours;
  workingDays: number[];
  vacationMode: boolean;
  vacationPeriod?: {
    start: string;
    end: string;
  };
}

export interface QuietHours {
  enabled: boolean;
  start: string; // HH:mm format
  end: string; // HH:mm format
  days: number[]; // 0-6 (Sunday-Saturday)
}

export interface FrequencyPreferences {
  maxPerHour: number;
  maxPerDay: number;
  digestEnabled: boolean;
  digestTime: string; // HH:mm format
  digestDays: number[];
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  variables: TemplateVariable[];
  channels: NotificationChannel[];
  priority: NotificationPriority;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'currency' | 'url';
  required: boolean;
  defaultValue?: any;
  description: string;
}

export interface NotificationCampaign {
  id: string;
  name: string;
  description: string;
  type: 'one_time' | 'recurring' | 'triggered';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  template: NotificationTemplate;
  audience: AudienceFilter;
  schedule: CampaignSchedule;
  metrics: CampaignMetrics;
  createdAt: string;
  updatedAt?: string;
}

export interface AudienceFilter {
  userIds?: string[];
  segments?: string[];
  criteria?: FilterCriteria[];
  excludeUserIds?: string[];
  maxAudience?: number;
}

// Added missing FilterCriteria interface
export interface FilterCriteria {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array';
}

export interface CampaignSchedule {
  startDate: string;
  endDate?: string;
  timezone: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  time?: string; // HH:mm format
  days?: number[]; // 0-6 for weekly, 1-31 for monthly
}

export interface CampaignMetrics {
  audienceSize: number;
  sent: number;
  delivered: number;
  read: number;
  clicked: number;
  failed: number;
  unsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
}

export interface NotificationQueue {
  id: string;
  notification: Notification;
  priority: number;
  attempts: number;
  maxAttempts: number;
  nextAttempt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  error?: string;
  metadata?: any;
}

export interface NotificationAnalytics {
  period: string;
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalClicked: number;
  totalFailed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  failureRate: number;
  channelBreakdown: ChannelAnalytics[];
  typeBreakdown: TypeAnalytics[];
  timeDistribution: TimeDistribution[];
}

export interface ChannelAnalytics {
  channel: NotificationChannel;
  sent: number;
  delivered: number;
  read: number;
  clicked: number;
  failed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

export interface TypeAnalytics {
  type: NotificationType;
  sent: number;
  delivered: number;
  read: number;
  clicked: number;
  failed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

export interface TimeDistribution {
  hour: number;
  sent: number;
  delivered: number;
  read: number;
  clicked: number;
}
