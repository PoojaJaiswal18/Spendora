export interface Report {
  id: string;
  userId: string;
  type: ReportType;
  title: string;
  description?: string;
  dateRange: DateRange;
  filters?: ReportFilters;
  data: ReportData;
  summary: ReportSummary;
  charts: ReportChart[];
  format: ReportFormat;
  status: ReportStatus;
  generatedAt: string;
  expiresAt?: string;
  downloadUrl?: string;
  shareUrl?: string;
  isPublic: boolean;
  tags: string[];
  metadata: ReportMetadata;
}

export type ReportType = 
  | 'monthly' 
  | 'yearly' 
  | 'quarterly'
  | 'custom' 
  | 'tax' 
  | 'category'
  | 'merchant'
  | 'budget'
  | 'expense_analysis';

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'html';

export type ReportStatus = 'generating' | 'completed' | 'failed' | 'expired';

export interface DateRange {
  start: string;
  end: string;
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface ReportFilters {
  categories?: string[];
  merchants?: string[];
  minAmount?: number;
  maxAmount?: number;
  paymentMethods?: string[];
  tags?: string[];
  locations?: string[];
  includeRefunds?: boolean;
  includePending?: boolean;
}

export interface ReportData {
  transactions: ReportTransaction[];
  aggregations: ReportAggregation[];
  comparisons?: ReportComparison[];
  trends: ReportTrend[];
  insights: ReportInsight[];
}

export interface ReportTransaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  subcategory?: string;
  description?: string;
  paymentMethod?: string;
  tags: string[];
}

export interface ReportAggregation {
  field: string;
  value: string;
  count: number;
  amount: number;
  percentage: number;
  average: number;
}

export interface ReportComparison {
  period: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ReportTrend {
  period: string;
  value: number;
  change: number;
  changePercentage: number;
  forecast?: number;
}

export interface ReportInsight {
  type: 'spending_spike' | 'budget_alert' | 'savings_opportunity' | 'pattern_change' | 'anomaly';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendations: string[];
  data: any;
}

export interface ReportSummary {
  totalTransactions: number;
  totalAmount: number;
  averageAmount: number;
  topCategory: string;
  topMerchant: string;
  largestTransaction: {
    amount: number;
    merchant: string;
    date: string;
  };
  smallestTransaction: {
    amount: number;
    merchant: string;
    date: string;
  };
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
}

export interface ReportChart {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
  title: string;
  data: ChartData;
  options: ChartOptions;
  order: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: any;
  scales?: any;
}

export interface ReportMetadata {
  generationTime: number;
  fileSize?: number;
  pageCount?: number;
  version: string;
  template: string;
  parameters: Record<string, any>;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  isDefault: boolean;
  config: ReportConfig;
  previewImage?: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface ReportConfig {
  sections: ReportSection[];
  styling: ReportStyling;
  options: ReportOptions;
}

export interface ReportSection {
  id: string;
  type: 'summary' | 'chart' | 'table' | 'text' | 'image';
  title: string;
  order: number;
  visible: boolean;
  config: any;
}

export interface ReportStyling {
  theme: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: number;
  logo?: string;
}

export interface ReportOptions {
  includeCharts: boolean;
  includeRawData: boolean;
  includeInsights: boolean;
  includeComparisons: boolean;
  pageSize: 'A4' | 'A3' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  compression: boolean;
}
