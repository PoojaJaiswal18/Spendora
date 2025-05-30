import { 
  format, 
  parseISO, 
  isValid, 
  differenceInDays, 
  differenceInHours, 
  differenceInMinutes, 
  addDays, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  isSameDay, 
  isSameWeek, 
  isSameMonth, 
  isSameYear, 
  isToday, 
  isYesterday, 
  isTomorrow, 
  getWeek, 
  getMonth, 
  getYear,
  type Locale  // Import Locale type from date-fns
} from 'date-fns';

export type DateRange = {
  start: Date;
  end: Date;
};

export type TimeUnit = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

export type DatePreset = 
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'lastYear'
  | 'last7Days'
  | 'last30Days'
  | 'last90Days';

/**
 * Advanced date formatting with locale support
 */
export const formatDate = (
  date: Date | string | null | undefined,
  formatString = 'MMM dd, yyyy',
  locale?: Locale
): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    return format(dateObj, formatString, { locale });
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * Get relative time with smart formatting
 */
export const getRelativeTime = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';

    const now = new Date();
    const diffInMinutes = differenceInMinutes(now, dateObj);
    const diffInHours = differenceInHours(now, dateObj);
    const diffInDays = differenceInDays(now, dateObj);

    if (isToday(dateObj)) {
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      return `${diffInHours}h ago`;
    }

    if (isYesterday(dateObj)) return 'Yesterday';
    if (isTomorrow(dateObj)) return 'Tomorrow';

    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`;
    
    return `${Math.floor(diffInDays / 365)}y ago`;
  } catch (error) {
    console.error('Relative time calculation error:', error);
    return '';
  }
};

/**
 * Get date range for preset periods
 */
export const getDateRangeForPreset = (preset: DatePreset): DateRange => {
  const now = new Date();
  
  switch (preset) {
    case 'today':
      return { start: now, end: now };
    
    case 'yesterday':
      const yesterday = subDays(now, 1);
      return { start: yesterday, end: yesterday };
    
    case 'thisWeek':
      return { start: startOfWeek(now), end: endOfWeek(now) };
    
    case 'lastWeek':
      const lastWeekStart = startOfWeek(subDays(now, 7));
      const lastWeekEnd = endOfWeek(subDays(now, 7));
      return { start: lastWeekStart, end: lastWeekEnd };
    
    case 'thisMonth':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    
    case 'lastMonth':
      const lastMonth = subDays(startOfMonth(now), 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    
    case 'thisYear':
      return { start: startOfYear(now), end: endOfYear(now) };
    
    case 'lastYear':
      const lastYear = new Date(now.getFullYear() - 1, 0, 1);
      return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
    
    case 'last7Days':
      return { start: subDays(now, 7), end: now };
    
    case 'last30Days':
      return { start: subDays(now, 30), end: now };
    
    case 'last90Days':
      return { start: subDays(now, 90), end: now };
    
    default:
      return { start: now, end: now };
  }
};

/**
 * Check if two dates are in the same period
 */
export const isSamePeriod = (date1: Date, date2: Date, unit: TimeUnit): boolean => {
  try {
    switch (unit) {
      case 'day':
        return isSameDay(date1, date2);
      case 'week':
        return isSameWeek(date1, date2);
      case 'month':
        return isSameMonth(date1, date2);
      case 'year':
        return isSameYear(date1, date2);
      default:
        return false;
    }
  } catch (error) {
    console.error('Date comparison error:', error);
    return false;
  }
};

/**
 * Generate date range array
 */
export const generateDateRange = (
  start: Date,
  end: Date,
  unit: TimeUnit = 'day'
): Date[] => {
  try {
    const dates: Date[] = [];
    let current = new Date(start);
    
    while (current <= end) {
      dates.push(new Date(current));
      
      switch (unit) {
        case 'day':
          current = addDays(current, 1);
          break;
        case 'week':
          current = addDays(current, 7);
          break;
        case 'month':
          current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
          break;
        case 'year':
          current = new Date(current.getFullYear() + 1, 0, 1);
          break;
        default:
          current = addDays(current, 1);
      }
    }
    
    return dates;
  } catch (error) {
    console.error('Date range generation error:', error);
    return [];
  }
};

/**
 * Get business days between dates
 */
export const getBusinessDays = (start: Date, end: Date): number => {
  try {
    let count = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  } catch (error) {
    console.error('Business days calculation error:', error);
    return 0;
  }
};

/**
 * Parse flexible date input
 */
export const parseFlexibleDate = (input: string): Date | null => {
  try {
    // Try ISO format first
    let date = parseISO(input);
    if (isValid(date)) return date;
    
    // Try native Date constructor for common formats
    date = new Date(input);
    if (isValid(date)) return date;
    
    // Try manual parsing for specific formats
    const datePatterns = [
      /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
      /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY
      /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/YYYY
    ];
    
    for (const pattern of datePatterns) {
      const match = input.match(pattern);
      if (match) {
        const [, first, second, third] = match;
        // Try different interpretations
        const attempts = [
          new Date(parseInt(third), parseInt(first) - 1, parseInt(second)),
          new Date(parseInt(third), parseInt(second) - 1, parseInt(first)),
        ];
        
        for (const attempt of attempts) {
          if (isValid(attempt)) return attempt;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Date parsing error:', error);
    return null;
  }
};

/**
 * Get fiscal year for a date
 */
export const getFiscalYear = (date: Date, fiscalYearStart = 4): number => {
  try {
    const year = getYear(date);
    const month = getMonth(date) + 1; // getMonth returns 0-11
    
    return month >= fiscalYearStart ? year : year - 1;
  } catch (error) {
    console.error('Fiscal year calculation error:', error);
    return getYear(new Date());
  }
};

/**
 * Get quarter for a date
 */
export const getQuarter = (date: Date): number => {
  try {
    const month = getMonth(date) + 1;
    return Math.ceil(month / 3);
  } catch (error) {
    console.error('Quarter calculation error:', error);
    return 1;
  }
};

/**
 * Format duration in human readable format
 */
export const formatDuration = (milliseconds: number): string => {
  try {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  } catch (error) {
    console.error('Duration formatting error:', error);
    return '0s';
  }
};

/**
 * Check if date is within range
 */
export const isDateInRange = (date: Date, range: DateRange): boolean => {
  try {
    return date >= range.start && date <= range.end;
  } catch (error) {
    console.error('Date range check error:', error);
    return false;
  }
};

/**
 * Get age from birth date
 */
export const getAge = (birthDate: Date): number => {
  try {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Age calculation error:', error);
    return 0;
  }
};

/**
 * Get week number of the year
 */
export const getWeekNumber = (date: Date): number => {
  try {
    return getWeek(date);
  } catch (error) {
    console.error('Week number calculation error:', error);
    return 1;
  }
};

/**
 * Check if a year is a leap year
 */
export const isLeapYear = (year: number): boolean => {
  try {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  } catch (error) {
    console.error('Leap year check error:', error);
    return false;
  }
};

/**
 * Get days in a month
 */
export const getDaysInMonth = (date: Date): number => {
  try {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  } catch (error) {
    console.error('Days in month calculation error:', error);
    return 30;
  }
};

/**
 * Get timezone offset in minutes
 */
export const getTimezoneOffset = (date: Date = new Date()): number => {
  try {
    return date.getTimezoneOffset();
  } catch (error) {
    console.error('Timezone offset calculation error:', error);
    return 0;
  }
};

/**
 * Convert date to UTC
 */
export const toUTC = (date: Date): Date => {
  try {
    return new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
  } catch (error) {
    console.error('UTC conversion error:', error);
    return new Date();
  }
};

/**
 * Convert UTC date to local time
 */
export const fromUTC = (utcDate: Date): Date => {
  try {
    return new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000));
  } catch (error) {
    console.error('Local time conversion error:', error);
    return new Date();
  }
};

/**
 * Get start and end of day
 */
export const getStartOfDay = (date: Date): Date => {
  try {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  } catch (error) {
    console.error('Start of day calculation error:', error);
    return new Date();
  }
};

export const getEndOfDay = (date: Date): Date => {
  try {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  } catch (error) {
    console.error('End of day calculation error:', error);
    return new Date();
  }
};

/**
 * Format date for API (ISO string)
 */
export const formatForAPI = (date: Date): string => {
  try {
    return date.toISOString();
  } catch (error) {
    console.error('API date formatting error:', error);
    return new Date().toISOString();
  }
};

/**
 * Parse date from API (ISO string)
 */
export const parseFromAPI = (dateString: string): Date => {
  try {
    const date = parseISO(dateString);
    return isValid(date) ? date : new Date();
  } catch (error) {
    console.error('API date parsing error:', error);
    return new Date();
  }
};
