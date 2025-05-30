export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  version?: number;
}

export interface AuditableEntity extends BaseEntity {
  createdBy: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface TimestampedEntity {
  createdAt: string;
  updatedAt?: string;
}

export interface SoftDeletableEntity {
  deletedAt?: string;
  deletedBy?: string;
  isDeleted: boolean;
}

export interface VersionedEntity {
  version: number;
  lastModified: string;
}

export interface TaggableEntity {
  tags: string[];
}

export interface SearchableEntity {
  searchKeywords: string[];
  searchText: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp?: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  formatted?: string;
  coordinates?: GeoLocation;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
  address?: Address;
}

export interface FileInfo {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  metadata?: FileMetadata;
  uploadedAt: string;
  uploadedBy: string;
}

export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  quality?: string;
  compression?: string;
  checksum?: string;
}

export interface Money {
  amount: number;
  currency: string;
  formatted?: string;
}

export interface DateRange {
  start: string;
  end: string;
  timezone?: string;
}

export interface TimeRange {
  start: string;
  end: string;
  duration?: number;
}

export interface Pagination {
  page: number;
  size: number;
  totalElements?: number;
  totalPages?: number;
}

export interface Sorting {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SearchCriteria {
  query?: string;
  filters?: Record<string, any>;
  sorting?: Sorting[];
  pagination?: Pagination;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  icon?: string;
  description?: string;
  group?: string;
}

export interface TreeNode<T = any> {
  id: string;
  label: string;
  value?: T;
  children?: TreeNode<T>[];
  parent?: string;
  level: number;
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  icon?: string;
}

export interface KeyValuePair<T = any> {
  key: string;
  value: T;
}

export interface NameValuePair<T = any> {
  name: string;
  value: T;
}

export interface IdNamePair {
  id: string;
  name: string;
}

export interface LabelValuePair<T = any> {
  label: string;
  value: T;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  error: string;
  warning: string;
  info: string;
  success: string;
}

export interface ThemeColors extends ColorPalette {
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
  };
  divider: string;
  border: string;
  shadow: string;
}

export interface Breakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface Typography {
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
}

export interface AnimationConfig {
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

export type Status = 'idle' | 'loading' | 'success' | 'error';

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

export type Alignment = 'left' | 'center' | 'right' | 'justify';

export type Direction = 'horizontal' | 'vertical';

export type Position = 'top' | 'bottom' | 'left' | 'right' | 'center';

export type Placement = 
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';
