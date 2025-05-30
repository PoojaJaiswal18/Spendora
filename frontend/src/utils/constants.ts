export const COLORS = {
  primary: '#00d4ff',
  secondary: '#ff6b35',
  success: '#00e676',
  warning: '#ffab00',
  error: '#ff5252',
  info: '#2196f3',
} as const;

export const CATEGORIES = [
  { name: 'Food & Dining', icon: '🍽️', color: '#ff6b35' },
  { name: 'Transportation', icon: '🚗', color: '#2196f3' },
  { name: 'Shopping', icon: '🛍️', color: '#9c27b0' },
  { name: 'Entertainment', icon: '🎬', color: '#e91e63' },
  { name: 'Bills & Utilities', icon: '💡', color: '#ff9800' },
  { name: 'Healthcare', icon: '🏥', color: '#f44336' },
  { name: 'Travel', icon: '✈️', color: '#00bcd4' },
  { name: 'Education', icon: '📚', color: '#4caf50' },
  { name: 'Other', icon: '📦', color: '#607d8b' },
] as const;

export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
} as const;

export const DATE_FORMATS = {
  SHORT: 'MM/dd/yyyy',
  LONG: 'MMMM d, yyyy',
  ISO: 'yyyy-MM-dd',
} as const;

export const FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  DOCUMENTS: ['application/pdf'],
  ALL_SUPPORTED: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'],
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ANIMATION_DURATIONS = {
  SHORT: 200,
  MEDIUM: 300,
  LONG: 500,
} as const;

export const BREAKPOINTS = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  RECEIPTS: {
    BASE: '/receipts',
    UPLOAD: '/receipts/upload',
    SEARCH: '/receipts/search',
  },
  ANALYTICS: {
    BASE: '/analytics',
    TRENDS: '/analytics/spending-trends',
    CATEGORIES: '/analytics/category-breakdown',
    INSIGHTS: '/analytics/insights',
  },
  CHALLENGES: {
    BASE: '/challenges',
    JOIN: '/challenges/join',
    PROGRESS: '/challenges/progress',
    LEADERBOARD: '/challenges/leaderboard',
  },
  REPORTS: {
    BASE: '/reports',
    GENERATE: '/reports/generate',
    EXPORT: '/reports/export',
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  THEME_MODE: 'spendora-theme',
  USER_PREFERENCES: 'userPreferences',
  RECENT_SEARCHES: 'recentSearches',
} as const;
 
