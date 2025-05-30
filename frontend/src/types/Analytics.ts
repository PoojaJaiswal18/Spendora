// Import DateRange from Common types or define it locally
export interface DateRange {
  start: Date | string;
  end: Date | string;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  trends: SpendingTrend[];
  categories: CategoryAnalytics[];
  merchants: MerchantAnalytics[];
  patterns: SpendingPattern;
  insights: AnalyticsInsight[];
  predictions: SpendingPrediction[];
  comparisons: PeriodComparison[];
}

export interface AnalyticsOverview {
  totalSpent: number;
  totalTransactions: number;
  averageTransaction: number;
  topCategory: string;
  topMerchant: string;
  spendingVelocity: number;
  budgetUtilization: number;
  savingsRate: number;
  period: string;
  currency: string;
}

export interface SpendingTrend {
  date: string;
  amount: number;
  count: number;
  category?: string;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  forecast?: number;
  confidence?: number;
}

export interface CategoryAnalytics {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  averageAmount: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  budgetLimit?: number;
  budgetUsed?: number;
  color: string;
  icon: string;
  subcategories?: CategoryAnalytics[];
}

export interface MerchantAnalytics {
  merchant: string;
  amount: number;
  count: number;
  percentage: number;
  averageAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
  lastVisit: string;
  category: string;
  location?: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface SpendingPattern {
  timeOfDay: TimePattern[];
  dayOfWeek: DayPattern[];
  monthlyPattern: MonthlyPattern[];
  seasonalPattern: SeasonalPattern[];
  locationPattern: LocationPattern[];
  paymentMethodPattern: PaymentMethodPattern[];
}

export interface TimePattern {
  hour: number;
  amount: number;
  count: number;
  percentage: number;
  averageAmount: number;
}

export interface DayPattern {
  day: string;
  dayIndex: number;
  amount: number;
  count: number;
  percentage: number;
  averageAmount: number;
}

export interface MonthlyPattern {
  month: string;
  monthIndex: number;
  amount: number;
  count: number;
  percentage: number;
  averageAmount: number;
  year?: number;
}

export interface SeasonalPattern {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  amount: number;
  count: number;
  percentage: number;
  averageAmount: number;
}

export interface LocationPattern {
  location: string;
  amount: number;
  count: number;
  percentage: number;
  averageAmount: number;
}

export interface PaymentMethodPattern {
  method: string;
  amount: number;
  count: number;
  percentage: number;
  averageAmount: number;
}

export interface AnalyticsInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
  value: number;
  change: number;
  changePercentage: number;
  actionable: boolean;
  recommendations: string[];
  data: any;
  createdAt: string;
  expiresAt?: string;
  dismissed: boolean;
}

export type InsightType = 
  | 'spending_spike'
  | 'budget_alert'
  | 'savings_opportunity'
  | 'unusual_pattern'
  | 'goal_achievement'
  | 'category_trend'
  | 'merchant_analysis'
  | 'payment_method_insight'
  | 'seasonal_pattern'
  | 'anomaly_detection';

export interface SpendingPrediction {
  period: string;
  predictedAmount: number;
  confidence: number;
  factors: PredictionFactor[];
  scenarios: PredictionScenario;
  accuracy: number;
  lastUpdated: string;
}

export interface PredictionFactor {
  factor: string;
  impact: number;
  description: string;
  weight: number;
}

export interface PredictionScenario {
  optimistic: number;
  realistic: number;
  pessimistic: number;
}

export interface PeriodComparison {
  currentPeriod: PeriodData;
  previousPeriod: PeriodData;
  change: ComparisonChange;
  insights: string[];
}

export interface PeriodData {
  period: string;
  amount: number;
  count: number;
  averageAmount: number;
  categories: CategorySummary[];
  merchants: MerchantSummary[];
}

export interface CategorySummary {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface MerchantSummary {
  merchant: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface ComparisonChange {
  amount: number;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  significance: 'low' | 'medium' | 'high';
}

export interface AnalyticsFilter {
  dateRange: DateRange;
  categories?: string[];
  merchants?: string[];
  amountRange?: {
    min: number;
    max: number;
  };
  paymentMethods?: string[];
  tags?: string[];
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  includeRefunds?: boolean;
  includePending?: boolean;
}

export interface AnalyticsMetrics {
  totalSpent: number;
  totalTransactions: number;
  averageTransaction: number;
  medianTransaction: number;
  standardDeviation: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  percentiles: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  };
}
