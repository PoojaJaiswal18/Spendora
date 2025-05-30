import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Backdrop, CircularProgress, Box, Typography, Fade } from '@mui/material';
import { useThemeContext } from './ThemeContext';
import { COLORS } from '../utils/constants';

interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

interface LoadingContextType {
  loading: LoadingState;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  updateProgress: (progress: number) => void;
  updateMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    message: undefined,
    progress: undefined,
  });
  
  const { theme } = useThemeContext();

  const showLoading = useCallback((message?: string) => {
    setLoading({
      isLoading: true,
      message,
      progress: undefined,
    });
  }, []);

  const hideLoading = useCallback(() => {
    setLoading({
      isLoading: false,
      message: undefined,
      progress: undefined,
    });
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setLoading(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
    }));
  }, []);

  const updateMessage = useCallback((message: string) => {
    setLoading(prev => ({
      ...prev,
      message,
    }));
  }, []);

  const value = {
    loading,
    showLoading,
    hideLoading,
    updateProgress,
    updateMessage,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: theme.zIndex.modal + 1,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
        }}
        open={loading.isLoading}
      >
        <Fade in={loading.isLoading}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              p: 4,
              borderRadius: '20px',
              background: `linear-gradient(135deg, ${theme.palette.background.paper}95, ${COLORS.primary}10)`,
              border: `1px solid ${COLORS.primary}30`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              minWidth: 300,
              textAlign: 'center',
            }}
          >
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                size={60}
                thickness={4}
                sx={{
                  color: COLORS.primary,
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                    '50%': {
                      transform: 'scale(1.1)',
                      opacity: 0.7,
                    },
                    '100%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                  },
                }}
              />
              {loading.progress !== undefined && (
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    component="div"
                    color="text.secondary"
                    sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
                  >
                    {`${Math.round(loading.progress)}%`}
                  </Typography>
                </Box>
              )}
            </Box>
            
            {loading.message && (
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  color: theme.palette.text.primary,
                  animation: 'fadeInUp 0.5s ease-out',
                  '@keyframes fadeInUp': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(20px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }}
              >
                {loading.message}
              </Typography>
            )}
          </Box>
        </Fade>
      </Backdrop>
    </LoadingContext.Provider>
  );
};
