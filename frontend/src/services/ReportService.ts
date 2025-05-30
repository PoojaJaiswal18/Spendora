 import { apiUtils } from './api';

export interface ReportConfig {
  title: string;
  description?: string;
  type: 'monthly' | 'yearly' | 'quarterly' | 'custom' | 'tax' | 'category' | 'merchant';
  dateRange: {
    start: string;
    end: string;
  };
  filters?: {
    categories?: string[];
    merchants?: string[];
    minAmount?: number;
    maxAmount?: number;
    tags?: string[];
  };
  groupBy?: 'date' | 'category' | 'merchant' | 'amount';
  sortBy?: 'date' | 'amount' | 'merchant' | 'category';
  sortOrder?: 'asc' | 'desc';
  includeCharts?: boolean;
  includeSummary?: boolean;
  includeDetails?: boolean;
}

export interface ReportData {
  id: string;
  title: string;
  description?: string;
  type: ReportConfig['type'];
  dateRange: {
    start: string;
    end: string;
  };
  summary: {
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
  };
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
    trendPercentage: number;
  }>;
  merchantBreakdown: Array<{
    merchant: string;
    amount: number;
    count: number;
    percentage: number;
    averageAmount: number;
    lastTransaction: string;
  }>;
  timeSeriesData: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  transactions: Array<{
    id: string;
    date: string;
    merchant: string;
    amount: number;
    category: string;
    description?: string;
    tags?: string[];
  }>;
  insights: Array<{
    type: 'spending_spike' | 'budget_alert' | 'savings_opportunity' | 'pattern_change';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    recommendation?: string;
    data?: any;
  }>;
  generatedAt: string;
  generatedBy: string;
  config: ReportConfig;
}

export interface TaxReportData extends ReportData {
  taxCategories: Array<{
    category: string;
    amount: number;
    deductible: boolean;
    taxRate?: number;
    deductionAmount?: number;
  }>;
  totalDeductions: number;
  estimatedTaxSavings: number;
  businessExpenses: number;
  personalExpenses: number;
  uncategorizedExpenses: number;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportConfig['type'];
  isDefault: boolean;
  config: Partial<ReportConfig>;
  previewImage?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeCharts: boolean;
  includeRawData: boolean;
  pageSize?: 'A4' | 'A3' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
  compression?: boolean;
  password?: string;
}

export interface ReportSchedule {
  id: string;
  name: string;
  description?: string;
  reportConfig: ReportConfig;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    dayOfWeek?: number; // 0-6 (Sunday-Saturday)
    dayOfMonth?: number; // 1-31
    time: string; // HH:mm format
    timezone: string;
  };
  recipients: Array<{
    email: string;
    name?: string;
    role?: string;
  }>;
  exportFormat: ExportOptions['format'];
  isActive: boolean;
  lastRun?: string;
  nextRun: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportMetrics {
  totalReports: number;
  reportsThisMonth: number;
  popularReportTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  averageGenerationTime: number;
  totalExports: number;
  storageUsed: number; // in MB
  scheduledReports: number;
  activeSchedules: number;
}

class ReportService {
  private readonly baseUrl = '/reports';

  /**
   * Generate a new report based on configuration
   */
  async generateReport(config: ReportConfig): Promise<ReportData> {
    try {
      return await apiUtils.post<ReportData>(`${this.baseUrl}/generate`, config);
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }

  /**
   * Get all user reports with pagination and filters
   */
  async getReports(
    page = 0,
    size = 20,
    filters?: {
      type?: ReportConfig['type'];
      startDate?: string;
      endDate?: string;
      search?: string;
    }
  ): Promise<{
    reports: ReportData[];
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
        content: ReportData[];
        totalElements: number;
        totalPages: number;
        number: number;
      }>(`${this.baseUrl}`, { params });

      return {
        reports: response.content,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        currentPage: response.number,
      };
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      throw error;
    }
  }

  /**
   * Get report by ID
   */
  async getReportById(id: string): Promise<ReportData> {
    try {
      return await apiUtils.get<ReportData>(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch report ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update report configuration and regenerate
   */
  async updateReport(id: string, config: Partial<ReportConfig>): Promise<ReportData> {
    try {
      return await apiUtils.put<ReportData>(`${this.baseUrl}/${id}`, config);
    } catch (error) {
      console.error(`Failed to update report ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete report
   */
  async deleteReport(id: string): Promise<void> {
    try {
      await apiUtils.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Failed to delete report ${id}:`, error);
      throw error;
    }
  }

  /**
   * Generate tax report with specific tax calculations
   */
  async generateTaxReport(
    taxYear: number,
    config?: Partial<ReportConfig>
  ): Promise<TaxReportData> {
    try {
      const params = {
        taxYear,
        ...config,
      };

      return await apiUtils.post<TaxReportData>(`${this.baseUrl}/tax`, params);
    } catch (error) {
      console.error('Failed to generate tax report:', error);
      throw error;
    }
  }

  /**
   * Export report in various formats
   */
  async exportReport(
    reportId: string,
    options: ExportOptions
  ): Promise<void> {
    try {
      const params = {
        format: options.format,
        includeCharts: options.includeCharts,
        includeRawData: options.includeRawData,
        pageSize: options.pageSize,
        orientation: options.orientation,
        compression: options.compression,
      };

      const filename = `report-${reportId}.${options.format}`;
      await apiUtils.download(`${this.baseUrl}/${reportId}/export`, filename);
    } catch (error) {
      console.error(`Failed to export report ${reportId}:`, error);
      throw error;
    }
  }

  /**
   * Get available report templates
   */
  async getReportTemplates(): Promise<ReportTemplate[]> {
    try {
      return await apiUtils.get<ReportTemplate[]>(`${this.baseUrl}/templates`);
    } catch (error) {
      console.error('Failed to fetch report templates:', error);
      throw error;
    }
  }

  /**
   * Create custom report template
   */
  async createReportTemplate(template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReportTemplate> {
    try {
      return await apiUtils.post<ReportTemplate>(`${this.baseUrl}/templates`, template);
    } catch (error) {
      console.error('Failed to create report template:', error);
      throw error;
    }
  }

  /**
   * Update report template
   */
  async updateReportTemplate(
    id: string,
    template: Partial<ReportTemplate>
  ): Promise<ReportTemplate> {
    try {
      return await apiUtils.put<ReportTemplate>(`${this.baseUrl}/templates/${id}`, template);
    } catch (error) {
      console.error(`Failed to update report template ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete report template
   */
  async deleteReportTemplate(id: string): Promise<void> {
    try {
      await apiUtils.delete(`${this.baseUrl}/templates/${id}`);
    } catch (error) {
      console.error(`Failed to delete report template ${id}:`, error);
      throw error;
    }
  }

  /**
   * Generate report from template
   */
  async generateReportFromTemplate(
    templateId: string,
    overrides?: Partial<ReportConfig>
  ): Promise<ReportData> {
    try {
      const params = {
        templateId,
        overrides,
      };

      return await apiUtils.post<ReportData>(`${this.baseUrl}/generate-from-template`, params);
    } catch (error) {
      console.error(`Failed to generate report from template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Schedule recurring report generation
   */
  async scheduleReport(schedule: Omit<ReportSchedule, 'id' | 'createdAt' | 'updatedAt' | 'nextRun'>): Promise<ReportSchedule> {
    try {
      return await apiUtils.post<ReportSchedule>(`${this.baseUrl}/schedules`, schedule);
    } catch (error) {
      console.error('Failed to schedule report:', error);
      throw error;
    }
  }

  /**
   * Get scheduled reports
   */
  async getScheduledReports(): Promise<ReportSchedule[]> {
    try {
      return await apiUtils.get<ReportSchedule[]>(`${this.baseUrl}/schedules`);
    } catch (error) {
      console.error('Failed to fetch scheduled reports:', error);
      throw error;
    }
  }

  /**
   * Update report schedule
   */
  async updateReportSchedule(
    id: string,
    schedule: Partial<ReportSchedule>
  ): Promise<ReportSchedule> {
    try {
      return await apiUtils.put<ReportSchedule>(`${this.baseUrl}/schedules/${id}`, schedule);
    } catch (error) {
      console.error(`Failed to update report schedule ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete report schedule
   */
  async deleteReportSchedule(id: string): Promise<void> {
    try {
      await apiUtils.delete(`${this.baseUrl}/schedules/${id}`);
    } catch (error) {
      console.error(`Failed to delete report schedule ${id}:`, error);
      throw error;
    }
  }

  /**
   * Toggle report schedule active status
   */
  async toggleReportSchedule(id: string, isActive: boolean): Promise<ReportSchedule> {
    try {
      return await apiUtils.patch<ReportSchedule>(`${this.baseUrl}/schedules/${id}/toggle`, {
        isActive,
      });
    } catch (error) {
      console.error(`Failed to toggle report schedule ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get report generation metrics and statistics
   */
  async getReportMetrics(): Promise<ReportMetrics> {
    try {
      return await apiUtils.get<ReportMetrics>(`${this.baseUrl}/metrics`);
    } catch (error) {
      console.error('Failed to fetch report metrics:', error);
      throw error;
    }
  }

  /**
   * Compare multiple reports
   */
  async compareReports(reportIds: string[]): Promise<{
    reports: ReportData[];
    comparison: {
      totalAmountComparison: Array<{
        reportId: string;
        amount: number;
        change: number;
        changePercentage: number;
      }>;
      categoryComparison: Array<{
        category: string;
        amounts: Array<{
          reportId: string;
          amount: number;
        }>;
      }>;
      timeSeriesComparison: Array<{
        date: string;
        values: Array<{
          reportId: string;
          amount: number;
        }>;
      }>;
    };
  }> {
    try {
      return await apiUtils.post(`${this.baseUrl}/compare`, { reportIds });
    } catch (error) {
      console.error('Failed to compare reports:', error);
      throw error;
    }
  }

  /**
   * Get report sharing settings
   */
  async getReportSharingSettings(reportId: string): Promise<{
    isPublic: boolean;
    shareUrl?: string;
    allowedUsers: Array<{
      email: string;
      permission: 'view' | 'edit';
    }>;
    expiresAt?: string;
  }> {
    try {
      return await apiUtils.get(`${this.baseUrl}/${reportId}/sharing`);
    } catch (error) {
      console.error(`Failed to fetch sharing settings for report ${reportId}:`, error);
      throw error;
    }
  }

  /**
   * Update report sharing settings
   */
  async updateReportSharingSettings(
    reportId: string,
    settings: {
      isPublic?: boolean;
      allowedUsers?: Array<{
        email: string;
        permission: 'view' | 'edit';
      }>;
      expiresAt?: string;
    }
  ): Promise<{
    isPublic: boolean;
    shareUrl?: string;
    allowedUsers: Array<{
      email: string;
      permission: 'view' | 'edit';
    }>;
    expiresAt?: string;
  }> {
    try {
      return await apiUtils.put(`${this.baseUrl}/${reportId}/sharing`, settings);
    } catch (error) {
      console.error(`Failed to update sharing settings for report ${reportId}:`, error);
      throw error;
    }
  }

  /**
   * Duplicate an existing report
   */
  async duplicateReport(reportId: string, newTitle?: string): Promise<ReportData> {
    try {
      return await apiUtils.post<ReportData>(`${this.baseUrl}/${reportId}/duplicate`, {
        newTitle,
      });
    } catch (error) {
      console.error(`Failed to duplicate report ${reportId}:`, error);
      throw error;
    }
  }

  /**
   * Get report generation history
   */
  async getReportHistory(
    page = 0,
    size = 20
  ): Promise<{
    history: Array<{
      id: string;
      reportId: string;
      reportTitle: string;
      action: 'generated' | 'exported' | 'shared' | 'deleted';
      timestamp: string;
      details?: any;
    }>;
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const params = { page, size };
      const response = await apiUtils.get<{
        content: Array<{
          id: string;
          reportId: string;
          reportTitle: string;
          action: 'generated' | 'exported' | 'shared' | 'deleted';
          timestamp: string;
          details?: any;
        }>;
        totalElements: number;
        totalPages: number;
        number: number;
      }>(`${this.baseUrl}/history`, { params });

      return {
        history: response.content,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        currentPage: response.number,
      };
    } catch (error) {
      console.error('Failed to fetch report history:', error);
      throw error;
    }
  }

  /**
   * Validate report configuration before generation
   */
  async validateReportConfig(config: ReportConfig): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    estimatedSize: number; // in MB
    estimatedGenerationTime: number; // in seconds
  }> {
    try {
      return await apiUtils.post(`${this.baseUrl}/validate`, config);
    } catch (error) {
      console.error('Failed to validate report config:', error);
      throw error;
    }
  }

  /**
   * Get report preview data (limited dataset for quick preview)
   */
  async getReportPreview(config: ReportConfig): Promise<{
    summary: ReportData['summary'];
    sampleTransactions: ReportData['transactions'];
    chartData: {
      categoryBreakdown: ReportData['categoryBreakdown'];
      timeSeriesData: ReportData['timeSeriesData'];
    };
  }> {
    try {
      return await apiUtils.post(`${this.baseUrl}/preview`, config);
    } catch (error) {
      console.error('Failed to generate report preview:', error);
      throw error;
    }
  }

  /**
   * Get available export formats and their capabilities
   */
  async getExportFormats(): Promise<Array<{
    format: ExportOptions['format'];
    name: string;
    description: string;
    supportsCharts: boolean;
    supportsPassword: boolean;
    maxFileSize: number; // in MB
    features: string[];
  }>> {
    try {
      return await apiUtils.get(`${this.baseUrl}/export-formats`);
    } catch (error) {
      console.error('Failed to fetch export formats:', error);
      throw error;
    }
  }
}

export const reportService = new ReportService();
export default reportService;
