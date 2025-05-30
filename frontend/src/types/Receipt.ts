export interface Receipt {
  id: string;
  userId: string;
  merchantName: string;
  totalAmount: number;
  date: string;
  items: ReceiptItem[];
  category: string;
  subcategory?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  ocrData?: OCRData;
  tags: string[];
  notes?: string;
  location?: ReceiptLocation;
  paymentMethod?: PaymentMethod;
  taxInfo?: TaxInfo;
  status: ReceiptStatus;
  confidence: number;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  verifiedAt?: string;
  metadata?: ReceiptMetadata;
}

export interface ReceiptItem {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  unitPrice?: number;
  category?: string;
  taxRate?: number;
  taxAmount?: number;
  discount?: number;
  sku?: string;
  barcode?: string;
}

export interface OCRData {
  confidence: number;
  extractedText: string;
  boundingBoxes: BoundingBox[];
  processingTime: number;
  engine: string;
  version: string;
  language: string;
  errors?: string[];
  warnings?: string[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  confidence: number;
  type: 'text' | 'number' | 'date' | 'currency';
}

export interface ReceiptLocation {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface PaymentMethod {
  type: 'cash' | 'credit_card' | 'debit_card' | 'digital_wallet' | 'bank_transfer' | 'other';
  lastFourDigits?: string;
  cardBrand?: string;
  provider?: string;
}

export interface TaxInfo {
  taxRate: number;
  taxAmount: number;
  taxType: 'sales_tax' | 'vat' | 'gst' | 'other';
  taxNumber?: string;
  deductible: boolean;
}

export type ReceiptStatus = 'processing' | 'processed' | 'verified' | 'failed' | 'pending_review';

export interface ReceiptMetadata {
  fileSize: number;
  fileType: string;
  imageWidth?: number;
  imageHeight?: number;
  processingDuration?: number;
  source: 'upload' | 'email' | 'api' | 'mobile_app';
  deviceInfo?: string;
  appVersion?: string;
}

export interface ReceiptFilter {
  startDate?: string;
  endDate?: string;
  category?: string;
  merchantName?: string;
  minAmount?: number;
  maxAmount?: number;
  status?: ReceiptStatus;
  tags?: string[];
  paymentMethod?: string;
  sortBy?: 'date' | 'amount' | 'merchant' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export interface ReceiptSummary {
  totalReceipts: number;
  totalAmount: number;
  averageAmount: number;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    count: number;
    amount: number;
  }>;
  topMerchants: Array<{
    merchant: string;
    count: number;
    amount: number;
  }>;
}
 
