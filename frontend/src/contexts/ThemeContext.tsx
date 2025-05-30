import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createTheme, ThemeProvider, Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { COLORS, ANIMATION_DURATIONS } from '../utils/constants';
import { localStorage } from '../utils/localStorage';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  theme: Theme;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  return context;
};

interface ThemeContextProviderProps {
  children: ReactNode;
}

const createCustomTheme = (mode: ThemeMode): Theme => {
  const isDark = mode === 'dark';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: COLORS.primary,
        light: '#5dffff',
        dark: '#00a3cc',
        contrastText: isDark ? '#000000' : '#ffffff',
      },
      secondary: {
        main: COLORS.secondary,
        light: '#ff9d68',
        dark: '#c73a00',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#0a0a0a' : '#fafafa',
        paper: isDark ? '#1a1a1a' : '#ffffff',
      },
      text: {
        primary: isDark ? '#ffffff' : '#000000',
        secondary: isDark ? '#b3b3b3' : '#666666',
      },
      divider: isDark ? '#333333' : '#e0e0e0',
      success: {
        main: COLORS.success,
        light: '#66ffa6',
        dark: '#00b248',
      },
      warning: {
        main: COLORS.warning,
        light: '#ffdd4b',
        dark: '#c67c00',
      },
      error: {
        main: COLORS.error,
        light: '#ff867f',
        dark: '#c50e29',
      },
      info: {
        main: COLORS.info,
        light: '#64b5f6',
        dark: '#1976d2',
      },
    },
    typography: {
      fontFamily: [
        'Inter',
        'Roboto',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontWeight: 700,
        fontSize: '3.5rem',
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 600,
        fontSize: '2.5rem',
        letterSpacing: '-0.01em',
        lineHeight: 1.3,
      },
      h3: {
        fontWeight: 600,
        fontSize: '2rem',
        letterSpacing: '-0.01em',
        lineHeight: 1.4,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        letterSpacing: '0em',
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.25rem',
        letterSpacing: '0em',
        lineHeight: 1.5,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        letterSpacing: '0.01em',
        lineHeight: 1.6,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
        letterSpacing: '0.01em',
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
        letterSpacing: '0.01em',
      },
    },
    shape: {
      borderRadius: 12,
    },
    transitions: {
      duration: {
        shortest: ANIMATION_DURATIONS.SHORT,
        shorter: ANIMATION_DURATIONS.MEDIUM,
        short: ANIMATION_DURATIONS.LONG,
        standard: 500,
        complex: 700,
        enteringScreen: 400,
        leavingScreen: 300,
      },
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? '#333333 #1a1a1a' : '#cccccc #f5f5f5',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: isDark ? '#1a1a1a' : '#f5f5f5',
            },
            '&::-webkit-scrollbar-thumb': {
              background: isDark ? '#333333' : '#cccccc',
              borderRadius: '4px',
              '&:hover': {
                background: isDark ? '#444444' : '#999999',
              },
            },
          },
          '*': {
            boxSizing: 'border-box',
          },
          html: {
            scrollBehavior: 'smooth',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '12px',
            padding: '12px 24px',
            transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${COLORS.primary}30`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            boxShadow: isDark 
              ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
              : '0 4px 20px rgba(0, 0, 0, 0.1)',
            transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: isDark 
                ? '0 8px 30px rgba(0, 0, 0, 0.4)' 
                : '0 8px 30px rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
              '&:hover': {
                transform: 'translateY(-1px)',
              },
              '&.Mui-focused': {
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${COLORS.primary}20`,
              },
            },
          },
        },
      },
    },
  });
};

export const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('themeMode');
    return (savedTheme as ThemeMode) || 'dark';
  });

  const theme = createCustomTheme(mode);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const value = {
    mode,
    toggleTheme,
    setTheme,
    theme,
    isDarkMode: mode === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
 
