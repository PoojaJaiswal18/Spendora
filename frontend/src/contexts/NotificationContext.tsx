import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor, Slide, SlideProps } from '@mui/material';
import { ANIMATION_DURATIONS } from '../utils/constants';

interface Notification {
  id: string;
  message: string;
  severity: AlertColor;
  duration?: number;
  action?: React.ReactNode;
}

interface NotificationContextType {
  showNotification: (message: string, severity?: AlertColor, duration?: number, action?: React.ReactNode) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  hideNotification: (id?: string) => void;
  notifications: Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const showNotification = useCallback((
    message: string,
    severity: AlertColor = 'info',
    duration: number = 6000,
    action?: React.ReactNode
  ) => {
    const id = generateId();
    const notification: Notification = {
      id,
      message,
      severity,
      duration,
      action,
    };

    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        hideNotification(id);
      }, duration);
    }
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    showNotification(message, 'success', duration);
  }, [showNotification]);

  const showError = useCallback((message: string, duration?: number) => {
    showNotification(message, 'error', duration);
  }, [showNotification]);

  const showWarning = useCallback((message: string, duration?: number) => {
    showNotification(message, 'warning', duration);
  }, [showNotification]);

  const showInfo = useCallback((message: string, duration?: number) => {
    showNotification(message, 'info', duration);
  }, [showNotification]);

  const hideNotification = useCallback((id?: string) => {
    if (id) {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } else {
      setNotifications([]);
    }
  }, []);

  const value = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification,
    notifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.duration}
          onClose={() => hideNotification(notification.id)}
          TransitionComponent={SlideTransition}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            mt: index * 7,
            '& .MuiSnackbar-root': {
              position: 'relative',
            },
          }}
        >
          <Alert
            onClose={() => hideNotification(notification.id)}
            severity={notification.severity}
            variant="filled"
            action={notification.action}
            sx={{
              width: '100%',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(10px)',
              animation: `slideInRight ${ANIMATION_DURATIONS.MEDIUM}ms ease-out`,
              '@keyframes slideInRight': {
                from: {
                  transform: 'translateX(100%)',
                  opacity: 0,
                },
                to: {
                  transform: 'translateX(0)',
                  opacity: 1,
                },
              },
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
};
