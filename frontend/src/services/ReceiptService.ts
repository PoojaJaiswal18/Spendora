import { apiUtils } from './api';
import { Receipt, ReceiptItem, OCRData } from '../types';

export interface UploadReceiptRequest {
  file: File;
  merchantName?: string;
  totalAmount?: number;
  date?: string;
  category?: string;
  notes?: string;
}

export interface ReceiptFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  merchantName?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'date' | 'amount' | 'merchant' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export interface ReceiptStats {
  totalReceipts: number;
  totalAmount: number;
  averageAmount: number;
  topCategories: Array<{
    category: string;
    count: number;
    amount: number;
  }>;
  topMerchants: Array<{
    merchant: string;
    count: number;
    amount: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    count: number;
    amount: number;
  }>;
}

export interface BulkOperationResult {
  successful: number;
  failed: number;
  errors: Array<{
    receiptId: string;
    error: string;
  }>;
}

class ReceiptService {
  private readonly baseUrl = '/receipts';

  /**
   * Upload a new receipt with OCR processing
   */
  async uploadReceipt(
    request: UploadReceiptRequest,
    onProgress?: (progress: number) => void
  ): Promise<Receipt> {
    try {
      const additionalData: Record<string, any> = {};
      
      if (request.merchantName) additionalData.merchantName = request.merchantName;
      if (request.totalAmount) additionalData.totalAmount = request.totalAmount;
      if (request.date) additionalData.date = request.date;
      if (request.category) additionalData.category = request.category;
      if (request.notes) additionalData.notes = request.notes;

      return await apiUtils.upload<Receipt>(
        `${this.baseUrl}/upload`,
        request.file,
        onProgress,
        additionalData
      );
    } catch (error) {
      console.error('Failed to upload receipt:', error);
      throw error;
    }
  }

  /**
   * Get paginated list of receipts with filters
   */
  async getReceipts(
    page = 0,
    size = 20,
    filters?: ReceiptFilters
  ): Promise<{
    receipts: Receipt[];
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
        content: Receipt[];
        totalElements: number;
        totalPages: number;
        number: number;
      }>(`${this.baseUrl}`, { params });

      return {
        receipts: response.content,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        currentPage: response.number,
      };
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
      throw error;
    }
  }

  /**
   * Get receipt by ID
   */
  async getReceiptById(id: string): Promise<Receipt> {
    try {
      return await apiUtils.get<Receipt>(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Failed to fetch receipt ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update receipt information
   */
  async updateReceipt(id: string, updates: Partial<Receipt>): Promise<Receipt> {
    try {
      return await apiUtils.put<Receipt>(`${this.baseUrl}/${id}`, updates);
    } catch (error) {
      console.error(`Failed to update receipt ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete receipt
   */
  async deleteReceipt(id: string): Promise<void> {
    try {
      await apiUtils.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Failed to delete receipt ${id}:`, error);
      throw error;
    }
  }

  /**
   * Bulk delete receipts
   */
  async bulkDeleteReceipts(receiptIds: string[]): Promise<BulkOperationResult> {
    try {
      return await apiUtils.post<BulkOperationResult>(`${this.baseUrl}/bulk-delete`, {
        receiptIds,
      });
    } catch (error) {
      console.error('Failed to bulk delete receipts:', error);
      throw error;
    }
  }

  /**
   * Search receipts by text
   */
  async searchReceipts(
    query: string,
    page = 0,
    size = 20
  ): Promise<{
    receipts: Receipt[];
    totalElements: number;
    highlights: Record<string, string[]>;
  }> {
    try {
      const params = {
        q: query,
        page,
        size,
      };

      return await apiUtils.get<{
        receipts: Receipt[];
        totalElements: number;
        highlights: Record<string, string[]>;
      }>(`${this.baseUrl}/search`, { params });
    } catch (error) {
      console.error('Failed to search receipts:', error);
      throw error;
    }
  }

  /**
   * Get receipt statistics
   */
  async getReceiptStats(
    startDate?: string,
    endDate?: string,
    category?: string
  ): Promise<ReceiptStats> {
    try {
      const params: Record<string, any> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (category) params.category = category;

      return await apiUtils.get<ReceiptStats>(`${this.baseUrl}/stats`, { params });
    } catch (error) {
      console.error('Failed to fetch receipt stats:', error);
      throw error;
    }
  }

  /**
   * Reprocess receipt with OCR
   */
  async reprocessReceipt(id: string): Promise<Receipt> {
    try {
      return await apiUtils.post<Receipt>(`${this.baseUrl}/${id}/reprocess`);
    } catch (error) {
      console.error(`Failed to reprocess receipt ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get OCR data for receipt
   */
  async getOCRData(id: string): Promise<OCRData> {
    try {
      return await apiUtils.get<OCRData>(`${this.baseUrl}/${id}/ocr`);
    } catch (error) {
      console.error(`Failed to fetch OCR data for receipt ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update receipt items
   */
  async updateReceiptItems(id: string, items: ReceiptItem[]): Promise<Receipt> {
    try {
      return await apiUtils.put<Receipt>(`${this.baseUrl}/${id}/items`, { items });
    } catch (error) {
      console.error(`Failed to update items for receipt ${id}:`, error);
      throw error;
    }
  }

  /**
   * Categorize receipt automatically
   */
  async categorizeReceipt(id: string): Promise<Receipt> {
    try {
      return await apiUtils.post<Receipt>(`${this.baseUrl}/${id}/categorize`);
    } catch (error) {
      console.error(`Failed to categorize receipt ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get similar receipts
   */
  async getSimilarReceipts(id: string, limit = 5): Promise<Receipt[]> {
    try {
      const params = { limit };
      return await apiUtils.get<Receipt[]>(`${this.baseUrl}/${id}/similar`, { params });
    } catch (error) {
      console.error(`Failed to fetch similar receipts for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Export receipts to various formats
   */
  async exportReceipts(
    format: 'csv' | 'excel' | 'pdf',
    filters?: ReceiptFilters
  ): Promise<void> {
    try {
      const params: Record<string, any> = {
        format,
        ...filters,
      };

      await apiUtils.download(`${this.baseUrl}/export`, `receipts.${format}`);
    } catch (error) {
      console.error('Failed to export receipts:', error);
      throw error;
    }
  }

  /**
   * Get receipt image URL
   */
  getReceiptImageUrl(id: string): string {
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}${this.baseUrl}/${id}/image`;
  }

  /**
   * Get receipt thumbnail URL
   */
  getReceiptThumbnailUrl(id: string): string {
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}${this.baseUrl}/${id}/thumbnail`;
  }
}

export const receiptService = new ReceiptService();
export default receiptService;
