export type StorageKey = 
  | 'authToken'
  | 'refreshToken'
  | 'userPreferences'
  | 'recentSearches'
  | 'dashboardLayout'
  | 'themeMode'
  | 'language'
  | 'currency'
  | 'dateFormat'
  | 'notifications'
  | 'onboardingCompleted'
  | 'lastSyncTime'
  | 'offlineData'
  | 'tempUploads'
  | 'analyticsTimeRange'; // Added for Analytics component

export interface StorageOptions {
  encrypt?: boolean;
  compress?: boolean;
  ttl?: number; // Time to live in milliseconds
  version?: string;
}

export interface StorageItem<T> {
  value: T;
  timestamp: number;
  ttl?: number;
  version?: string;
  compressed?: boolean;
  encrypted?: boolean;
}

/**
 * Enhanced localStorage utility with encryption, compression, and TTL support
 */
class LocalStorageManager {
  private readonly prefix = 'spendora_';
  private readonly encryptionKey = 'spendora-encryption-key-2024';

  /**
   * Set item in localStorage with advanced options
   */
  setItem<T>(key: StorageKey, value: T, options: StorageOptions = {}): boolean {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        ...(options.ttl && { ttl: options.ttl }),
        ...(options.version && { version: options.version }),
        ...(options.compress && { compressed: true }),
        ...(options.encrypt && { encrypted: true }),
      };

      let serializedValue = JSON.stringify(item);

      // Compress if requested
      if (options.compress) {
        serializedValue = this.compress(serializedValue);
      }

      // Encrypt if requested
      if (options.encrypt) {
        serializedValue = this.encrypt(serializedValue);
      }

      // Use native localStorage directly for internal operations
      window.localStorage.setItem(this.getKey(key), serializedValue);
      return true;
    } catch (error) {
      console.error(`Failed to set localStorage item ${key}:`, error);
      return false;
    }
  }

  /**
   * Get item from localStorage with automatic TTL and version checking
   */
  getItem<T>(key: StorageKey, defaultValue?: T): T | undefined {
    try {
      const rawValue = window.localStorage.getItem(this.getKey(key));
      if (!rawValue) return defaultValue;

      let serializedValue = rawValue;

      // Try to decrypt if it looks encrypted
      if (this.isEncrypted(serializedValue)) {
        serializedValue = this.decrypt(serializedValue);
      }

      // Try to decompress if it looks compressed
      if (this.isCompressed(serializedValue)) {
        serializedValue = this.decompress(serializedValue);
      }

      const item: StorageItem<T> = JSON.parse(serializedValue);

      // Check TTL
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.removeItem(key);
        return defaultValue;
      }

      return item.value;
    } catch (error) {
      console.error(`Failed to get localStorage item ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: StorageKey): boolean {
    try {
      window.localStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.error(`Failed to remove localStorage item ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all app-related localStorage items
   */
  clear(): boolean {
    try {
      const keys = Object.keys(window.localStorage).filter(key => 
        key.startsWith(this.prefix)
      );
      
      keys.forEach(key => window.localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }

  /**
   * Get all app-related localStorage items
   */
  getAllItems(): Record<string, any> {
    try {
      const items: Record<string, any> = {};
      
      Object.keys(window.localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          const appKey = key.replace(this.prefix, '');
          // Only process valid StorageKeys
          if (this.isValidStorageKey(appKey)) {
            items[appKey] = this.getItem(appKey as StorageKey);
          }
        }
      });
      
      return items;
    } catch (error) {
      console.error('Failed to get all localStorage items:', error);
      return {};
    }
  }

  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const testKey = '__localStorage_test__';
      const testValue = 'test';
      window.localStorage.setItem(testKey, testValue);
      const retrieved = window.localStorage.getItem(testKey);
      window.localStorage.removeItem(testKey);
      return retrieved === testValue;
    } catch {
      return false;
    }
  }

  /**
   * Get storage usage information
   */
  getStorageInfo(): {
    used: number;
    available: number;
    total: number;
    percentage: number;
  } {
    try {
      let used = 0;
      let total = 5 * 1024 * 1024; // 5MB default limit

      // Calculate used space
      for (let key in window.localStorage) {
        if (window.localStorage.hasOwnProperty(key)) {
          const value = window.localStorage.getItem(key);
          if (value) {
            used += value.length + key.length;
          }
        }
      }

      // Try to estimate total available space
      try {
        let testKey = 'test';
        let testData = '0'.repeat(1024); // 1KB
        let tempUsed = used;

        while (tempUsed < total) {
          try {
            window.localStorage.setItem(testKey, testData);
            tempUsed += testData.length + testKey.length;
            testKey += '0';
          } catch {
            // Hit the limit
            window.localStorage.removeItem(testKey.slice(0, -1));
            break;
          }
        }
        
        // Clean up test keys
        Object.keys(window.localStorage).forEach(key => {
          if (key.startsWith('test')) {
            window.localStorage.removeItem(key);
          }
        });
      } catch {
        // Hit the limit, total is approximately tempUsed
      }

      const available = Math.max(0, total - used);
      const percentage = total > 0 ? (used / total) * 100 : 0;

      return { used, available, total, percentage };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: 0, total: 0, percentage: 0 };
    }
  }

  /**
   * Batch operations
   */
  setMultiple(items: Partial<Record<StorageKey, any>>, options: StorageOptions = {}): boolean {
    try {
      Object.entries(items).forEach(([key, value]) => {
        if (this.isValidStorageKey(key)) {
          this.setItem(key as StorageKey, value, options);
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to set multiple items:', error);
      return false;
    }
  }


  watch(key: StorageKey, callback: (newValue: any, oldValue: any) => void): () => void {
    let currentValue = this.getItem(key);

    const interval = setInterval(() => {
      const newValue = this.getItem(key);
      if (JSON.stringify(newValue) !== JSON.stringify(currentValue)) {
        const oldValue = currentValue;
        currentValue = newValue;
        callback(newValue, oldValue);
      }
    }, 100);

    return () => clearInterval(interval);
  }

  private getKey(key: StorageKey): string {
    return `${this.prefix}${key}`;
  }

  private isValidStorageKey(key: string): key is StorageKey {
    const validKeys: StorageKey[] = [
      'authToken',
      'refreshToken',
      'userPreferences',
      'recentSearches',
      'dashboardLayout',
      'themeMode',
      'language',
      'currency',
      'dateFormat',
      'notifications',
      'onboardingCompleted',
      'lastSyncTime',
      'offlineData',
      'tempUploads',
      'analyticsTimeRange'
    ];
    return validKeys.includes(key as StorageKey);
  }

  private encrypt(data: string): string {
  
    try {
      let encrypted = '';
      for (let i = 0; i < data.length; i++) {
        encrypted += String.fromCharCode(
          data.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
        );
      }
      return btoa(encrypted);
    } catch {
      return data;
    }
  }

  private decrypt(encryptedData: string): string {
    try {
      const data = atob(encryptedData);
      let decrypted = '';
      for (let i = 0; i < data.length; i++) {
        decrypted += String.fromCharCode(
          data.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
        );
      }
      return decrypted;
    } catch {
      return encryptedData;
    }
  }

  private compress(data: string): string {
   
    try {
      return data
        .replace(/(.)\1{2,}/g, (match, char) => `${char}*${match.length}`)
        .replace(/\s{2,}/g, (match) => ` *${match.length}`);
    } catch {
      return data;
    }
  }

  private decompress(compressedData: string): string {
    try {
      return compressedData
        .replace(/(.)\*(\d+)/g, (match, char, count) => char.repeat(parseInt(count)))
        .replace(/ \*(\d+)/g, (match, count) => ' '.repeat(parseInt(count)));
    } catch {
      return compressedData;
    }
  }

  private isEncrypted(data: string): boolean {
    try {
      atob(data);
      return true;
    } catch {
      return false;
    }
  }

  private isCompressed(data: string): boolean {
    return data.includes('*') && /\*\d+/.test(data);
  }
}

export const localStorage = new LocalStorageManager();


export const setItem = <T>(key: StorageKey, value: T, options?: StorageOptions) => 
  localStorage.setItem(key, value, options);

export const getItem = <T>(key: StorageKey, defaultValue?: T) => 
  localStorage.getItem<T>(key, defaultValue);

export const removeItem = (key: StorageKey) => 
  localStorage.removeItem(key);

export const clearStorage = () => 
  localStorage.clear();


export const authHelpers = {
  setToken: (token: string) => setItem('authToken', token, { encrypt: true }),
  getToken: () => getItem<string>('authToken'),
  removeToken: () => removeItem('authToken'),
  
  setRefreshToken: (token: string) => setItem('refreshToken', token, { encrypt: true }),
  getRefreshToken: () => getItem<string>('refreshToken'),
  removeRefreshToken: () => removeItem('refreshToken'),
  
  clearAuth: () => {
    removeItem('authToken');
    removeItem('refreshToken');
  },
};

export const preferencesHelpers = {
  setPreferences: (prefs: any) => setItem('userPreferences', prefs),
  getPreferences: () => getItem('userPreferences', {}),
  updatePreference: (key: string, value: any) => {
    const prefs = getItem('userPreferences', {}) || {};
    setItem('userPreferences', { ...prefs, [key]: value });
  },
};

export const cacheHelpers = {
  setWithTTL: <T>(key: StorageKey, value: T, ttlMinutes: number) => 
    setItem(key, value, { ttl: ttlMinutes * 60 * 1000 }),
  
  setRecentSearches: (searches: string[]) => 
    setItem('recentSearches', searches.slice(0, 10)),
  
  addRecentSearch: (search: string) => {
    const recent = getItem<string[]>('recentSearches', []) || [];
    const updated = [search, ...recent.filter(s => s !== search)].slice(0, 10);
    setItem('recentSearches', updated);
  },
  
  getRecentSearches: () => getItem<string[]>('recentSearches', []) || [],
};


export default localStorage;
