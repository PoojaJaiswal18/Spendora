export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ApiError[];
  warnings?: string[];
  timestamp: string;
  requestId: string;
  version: string;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: any;
  severity: 'low' | 'medium' | 'high';
}

export interface ResponseMetadata {
  executionTime: number;
  cacheHit: boolean;
  rateLimit?: RateLimit;
  pagination?: PaginationInfo;
  sorting?: SortingInfo;
  filtering?: FilteringInfo;
}

export interface RateLimit {
  limit: number;
  remaining: number;
  resetTime: string;
  retryAfter?: number;
}

export interface PaginatedResponse<T = any> {
  content: T[];
  pagination: PaginationInfo;
  sorting?: SortingInfo;
  filtering?: FilteringInfo;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isFirst: boolean;
  isLast: boolean;
}

export interface SortingInfo {
  field: string;
  direction: 'asc' | 'desc';
  ignoreCase?: boolean;
  nullHandling?: 'native' | 'nulls_first' | 'nulls_last';
}

export interface FilteringInfo {
  filters: FilterCriteria[];
  totalFiltered: number;
  appliedFilters: number;
}

export interface FilterCriteria {
  field: string;
  operator: FilterOperator;
  value: any;
  type: FilterType;
}

export type FilterOperator = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'greater_than_or_equal'
  | 'less_than'
  | 'less_than_or_equal'
  | 'between'
  | 'in'
  | 'not_in'
  | 'is_null'
  | 'is_not_null';

export type FilterType = 'string' | 'number' | 'date' | 'boolean' | 'array';

export interface ApiRequest<T = any> {
  data?: T;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers: Record<string, string>;
  interceptors: {
    request: RequestInterceptor[];
    response: ResponseInterceptor[];
  };
}

export interface RequestInterceptor {
  onFulfilled: (config: any) => any;
  onRejected?: (error: any) => any;
}

export interface ResponseInterceptor {
  onFulfilled: (response: any) => any;
  onRejected?: (error: any) => any;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
    stack?: string;
  };
  statusCode: number;
  statusText: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  rejectedValue?: any;
}

export interface BusinessError {
  code: string;
  message: string;
  category: 'validation' | 'business_rule' | 'authorization' | 'not_found' | 'conflict';
  details?: any;
}

export interface SystemError {
  code: string;
  message: string;
  category: 'network' | 'server' | 'timeout' | 'unknown';
  retryable: boolean;
  details?: any;
}
 
