import { useState, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useLoading } from '../contexts/LoadingContext';

interface ApiState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

interface UseApiOptions {
  showNotifications?: boolean;
  showLoading?: boolean;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

export const useApi = <T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
) => {
  const {
    showNotifications = true,
    showLoading = false,
    loadingMessage = 'Processing...',
    successMessage,
    errorMessage,
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const { showSuccess, showError } = useNotification();
  const { showLoading: showGlobalLoading, hideLoading } = useLoading();

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      if (showLoading) {
        showGlobalLoading(loadingMessage);
      }

      try {
        const result = await apiFunction(...args);
        setState(prev => ({ ...prev, data: result, isLoading: false }));
        
        if (showNotifications && successMessage) {
          showSuccess(successMessage);
        }
        
        return result;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'An error occurred';
        setState(prev => ({ ...prev, error: errorMsg, isLoading: false }));
        
        if (showNotifications) {
          showError(errorMessage || errorMsg);
        }
        
        return null;
      } finally {
        if (showLoading) {
          hideLoading();
        }
      }
    },
    [apiFunction, showNotifications, showLoading, loadingMessage, successMessage, errorMessage, showSuccess, showError, showGlobalLoading, hideLoading]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};
 
