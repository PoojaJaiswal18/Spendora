import { apiUtils } from './api';

export interface SpendingTrend {
  date: string;
  amount: number;
  count: number;
  category?: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  color: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface MerchantAnalysis {
  merchant: string;
  amount: number;
  count: number;
  averageAmount: number;
  lastVisit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
}

export interface SpendingPattern {
  timeOfDay: Array<{
    hour: number;
    amount: number;
    count: number;
  }>;
  dayOfWeek: Array<{
    day: string;
    amount: number;
    count: number;
  }>;
  monthlyPattern: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
}

export interface BudgetAnalysis {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  budgetUtilization: number;
  categoryBudgets: Array<{
    category: string;
    budget: number;
    spent: number;
    remaining: number;
    utilization: number;
    status: 'under' | 'near' | 'over';
  }>;
  projectedSpending: number;
  savingsOpportunities: Array<{
    category: string;
    potentialSavings: number;
    recommendation: string;
  }>;
}

export interface Insight {
  id: string;
  type: 'spending_spike' | 'budget_alert' | 'savings_opportunity' | 'unusual_pattern' | 'goal_achievement';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendations: string[];
  data: any;
  createdAt: string;
  dismissed: boolean;
}

export interface ComparisonData {
  currentPeriod: {
    amount: number;
    count: number;
    categories: CategoryBreakdown[];
  };
  previousPeriod: {
    amount: number;
    count: number;
    categories: CategoryBreakdown[];
  };
  change: {
    amount: number;
    count: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export interface ForecastData {
  period: string;
  predictedAmount: number;
  confidence: number;
  factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}

class AnalyticsService {
  private readonly baseUrl = '/analytics';

  /**
   * Get spending trends over time
   */
  async getSpendingTrends(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly',
    startDate?: string,
    endDate?: string,
    category?: string
  ): Promise<SpendingTrend[]> {
    try {
      const params: Record<string, any> = { period };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (category) params.category = category;

      return await apiUtils.get<SpendingTrend[]>(`${this.baseUrl}/spending-trends`, { params });
    } catch (error) {
      console.error('Failed to fetch spending trends:', error);
      throw error;
    }
  }

  /**
   * Get category breakdown analysis
   */
  async getCategoryBreakdown(
    period: 'week' | 'month' | 'quarter' | 'year' = 'month',
    startDate?: string,
    endDate?: string
  ): Promise<CategoryBreakdown[]> {
    try {
      const params: Record<string, any> = { period };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      return await apiUtils.get<CategoryBreakdown[]>(`${this.baseUrl}/category-breakdown`, { params });
    } catch (error) {
      console.error('Failed to fetch category breakdown:', error);
      throw error;
    }
  }

  /**
   * Get merchant analysis
   */
  async getMerchantAnalysis(
    limit = 10,
    startDate?: string,
    endDate?: string
  ): Promise<MerchantAnalysis[]> {
    try {
      const params: Record<string, any> = { limit };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      return await apiUtils.get<MerchantAnalysis[]>(`${this.baseUrl}/merchant-analysis`, { params });
    } catch (error) {
      console.error('Failed to fetch merchant analysis:', error);
      throw error;
    }
  }

  /**
   * Get spending patterns
   */
  async getSpendingPatterns(
    startDate?: string,
    endDate?: string
  ): Promise<SpendingPattern> {
    try {
      const params: Record<string, any> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      return await apiUtils.get<SpendingPattern>(`${this.baseUrl}/spending-patterns`, { params });
    } catch (error) {
      console.error('Failed to fetch spending patterns:', error);
      throw error;
    }
  }

  /**
   * Get budget analysis
   */
  async getBudgetAnalysis(
    period: 'month' | 'quarter' | 'year' = 'month'
  ): Promise<BudgetAnalysis> {
    try {
      const params = { period };
      return await apiUtils.get<BudgetAnalysis>(`${this.baseUrl}/budget-analysis`, { params });
    } catch (error) {
      console.error('Failed to fetch budget analysis:', error);
      throw error;
    }
  }

  /**
   * Get AI-generated insights
   */
  async getInsights(
    includeHistorical = false,
    limit = 10
  ): Promise<Insight[]> {
    try {
      const params = {
        includeHistorical,
        limit,
      };

      return await apiUtils.get<Insight[]>(`${this.baseUrl}/insights`, { params });
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      throw error;
    }
  }

  /**
   * Dismiss an insight
   */
  async dismissInsight(insightId: string): Promise<void> {
    try {
      await apiUtils.post(`${this.baseUrl}/insights/${insightId}/dismiss`);
    } catch (error) {
      console.error(`Failed to dismiss insight ${insightId}:`, error);
      throw error;
    }
  }

  /**
   * Get comparison data between periods
   */
  async getComparisonData(
    currentStart: string,
    currentEnd: string,
    previousStart: string,
    previousEnd: string
  ): Promise<ComparisonData> {
    try {
      const params = {
        currentStart,
        currentEnd,
        previousStart,
        previousEnd,
      };

      return await apiUtils.get<ComparisonData>(`${this.baseUrl}/comparison`, { params });
    } catch (error) {
      console.error('Failed to fetch comparison data:', error);
      throw error;
    }
  }

  /**
   * Get spending forecast
   */
  async getSpendingForecast(
    period: 'week' | 'month' | 'quarter' = 'month',
    category?: string
  ): Promise<ForecastData> {
    try {
      const params: Record<string, any> = { period };
      if (category) params.category = category;

      return await apiUtils.get<ForecastData>(`${this.baseUrl}/forecast`, { params });
    } catch (error) {
      console.error('Failed to fetch spending forecast:', error);
      throw error;
    }
  }

  /**
   * Get dashboard summary statistics
   */
  async getDashboardStats(): Promise<{
    totalSpent: number;
    totalReceipts: number;
    averagePerTransaction: number;
    topCategory: string;
    monthlyChange: number;
    weeklyChange: number;
    budgetUtilization: number;
    savingsThisMonth: number;
  }> {
    try {
      return await apiUtils.get(`${this.baseUrl}/dashboard-stats`);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get expense heatmap data
   */
  async getExpenseHeatmap(
    year: number,
    category?: string
  ): Promise<Array<{
    date: string;
    amount: number;
    level: number; // 0-4 intensity level
  }>> {
    try {
      const params: Record<string, any> = { year };
      if (category) params.category = category;

      return await apiUtils.get(`${this.baseUrl}/expense-heatmap`, { params });
    } catch (error) {
      console.error('Failed to fetch expense heatmap:', error);
      throw error;
    }
  }

  /**
   * Get goal progress tracking
   */
  async getGoalProgress(): Promise<Array<{
    goalId: string;
    goalName: string;
    targetAmount: number;
    currentAmount: number;
    progress: number;
    deadline: string;
    status: 'on_track' | 'behind' | 'ahead' | 'completed';
    projectedCompletion: string;
  }>> {
    try {
      return await apiUtils.get(`${this.baseUrl}/goal-progress`);
    } catch (error) {
      console.error('Failed to fetch goal progress:', error);
      throw error;
    }
  }

  /**
   * Generate custom analytics report
   */
  async generateCustomReport(config: {
    metrics: string[];
    groupBy: string[];
    filters: Record<string, any>;
    dateRange: {
      start: string;
      end: string;
    };
  }): Promise<{
    reportId: string;
    data: any;
    generatedAt: string;
    config: any;
  }> {
    try {
      return await apiUtils.post(`${this.baseUrl}/custom-report`, config);
    } catch (error) {
      console.error('Failed to generate custom report:', error);
      throw error;
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(
    type: 'trends' | 'categories' | 'merchants' | 'patterns' | 'insights',
    format: 'csv' | 'excel' | 'pdf',
    filters?: Record<string, any>
  ): Promise<void> {
    try {
      const params: Record<string, any> = {
        type,
        format,
        ...filters,
      };

      await apiUtils.download(`${this.baseUrl}/export`, `analytics-${type}.${format}`);
    } catch (error) {
      console.error('Failed to export analytics:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
