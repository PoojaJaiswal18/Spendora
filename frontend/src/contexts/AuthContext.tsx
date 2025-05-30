import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, AuthTokens, LoginRequest, RegisterRequest } from '../types/Auth';

interface AuthContextType {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Export the AuthContext so it can be imported in useAuth
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Validate token and get user data
          const userData: AuthUser = {
            id: '1',
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
            avatar: undefined,
            roles: [],
            permissions: [],
            preferences: {
              language: 'en',
              currency: 'USD',
              timezone: 'UTC',
              dateFormat: 'MM/dd/yyyy',
              timeFormat: '12h',
              theme: 'light',
              notifications: {
                email: true,
                push: true,
                sms: false,
                inApp: true,
                marketing: false,
                security: true,
                updates: true,
                frequency: 'immediate'
              },
              privacy: {
                profileVisibility: 'private',
                showEmail: false,
                showPhone: false,
                showLocation: false,
                allowDataCollection: true,
                allowAnalytics: true,
                allowMarketing: false
              },
              accessibility: {
                fontSize: 'medium',
                highContrast: false,
                reducedMotion: false,
                screenReader: false,
                keyboardNavigation: false
              },
              dashboard: {
                layout: 'grid',
                widgets: [],
                defaultView: 'overview',
                refreshInterval: 30000
              }
            },
            profile: {
              bio: '',
              website: '',
              location: '',
              company: '',
              jobTitle: '',
              phoneNumber: '',
              dateOfBirth: '',
              gender: 'prefer_not_to_say',
              profileVisibility: 'private',
              socialLinks: {},
              interests: [],
              skills: [],
              achievements: []
            },
            subscription: {
              id: '1',
              planId: 'free',
              planName: 'Free Plan',
              planType: 'free',
              status: 'active',
              startDate: new Date().toISOString(),
              autoRenew: false,
              features: [],
              usage: {
                transactions: { used: 0, limit: 100 },
                budgets: { used: 0, limit: 5 },
                reports: { used: 0, limit: 3 },
                storage: { used: 0, limit: 1024 },
                apiCalls: { used: 0, limit: 1000 }
              },
              billing: {
                amount: 0,
                currency: 'USD',
                interval: 'monthly',
                invoices: []
              }
            },
            lastLogin: new Date().toISOString(),
            emailVerified: true,
            phoneVerified: false,
            twoFactorEnabled: false,
            accountStatus: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
        setError('Authentication check failed');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData: AuthUser = {
        id: '1',
        email,
        firstName: 'John',
        lastName: 'Doe',
        avatar: undefined,
        roles: [],
        permissions: [],
        preferences: {
          language: 'en',
          currency: 'USD',
          timezone: 'UTC',
          dateFormat: 'MM/dd/yyyy',
          timeFormat: '12h',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false,
            inApp: true,
            marketing: false,
            security: true,
            updates: true,
            frequency: 'immediate'
          },
          privacy: {
            profileVisibility: 'private',
            showEmail: false,
            showPhone: false,
            showLocation: false,
            allowDataCollection: true,
            allowAnalytics: true,
            allowMarketing: false
          },
          accessibility: {
            fontSize: 'medium',
            highContrast: false,
            reducedMotion: false,
            screenReader: false,
            keyboardNavigation: false
          },
          dashboard: {
            layout: 'grid',
            widgets: [],
            defaultView: 'overview',
            refreshInterval: 30000
          }
        },
        profile: {
          bio: '',
          website: '',
          location: '',
          company: '',
          jobTitle: '',
          phoneNumber: '',
          dateOfBirth: '',
          gender: 'prefer_not_to_say',
          profileVisibility: 'private',
          socialLinks: {},
          interests: [],
          skills: [],
          achievements: []
        },
        subscription: {
          id: '1',
          planId: 'free',
          planName: 'Free Plan',
          planType: 'free',
          status: 'active',
          startDate: new Date().toISOString(),
          autoRenew: false,
          features: [],
          usage: {
            transactions: { used: 0, limit: 100 },
            budgets: { used: 0, limit: 5 },
            reports: { used: 0, limit: 3 },
            storage: { used: 0, limit: 1024 },
            apiCalls: { used: 0, limit: 1000 }
          },
          billing: {
            amount: 0,
            currency: 'USD',
            interval: 'monthly',
            invoices: []
          }
        },
        lastLogin: new Date().toISOString(),
        emailVerified: true,
        phoneVerified: false,
        twoFactorEnabled: false,
        accountStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockTokens: AuthTokens = {
        accessToken: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        scope: ['read', 'write']
      };

      localStorage.setItem('authToken', mockTokens.accessToken);
      setUser(userData);
      setTokens(mockTokens);
    } catch (error) {
      const errorMessage = 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: AuthUser = {
        id: '1',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatar: undefined,
        roles: [],
        permissions: [],
        preferences: {
          language: 'en',
          currency: 'USD',
          timezone: 'UTC',
          dateFormat: 'MM/dd/yyyy',
          timeFormat: '12h',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false,
            inApp: true,
            marketing: false,
            security: true,
            updates: true,
            frequency: 'immediate'
          },
          privacy: {
            profileVisibility: 'private',
            showEmail: false,
            showPhone: false,
            showLocation: false,
            allowDataCollection: true,
            allowAnalytics: true,
            allowMarketing: false
          },
          accessibility: {
            fontSize: 'medium',
            highContrast: false,
            reducedMotion: false,
            screenReader: false,
            keyboardNavigation: false
          },
          dashboard: {
            layout: 'grid',
            widgets: [],
            defaultView: 'overview',
            refreshInterval: 30000
          }
        },
        profile: {
          bio: '',
          website: '',
          location: '',
          company: '',
          jobTitle: '',
          phoneNumber: '',
          dateOfBirth: '',
          gender: 'prefer_not_to_say',
          profileVisibility: 'private',
          socialLinks: {},
          interests: [],
          skills: [],
          achievements: []
        },
        subscription: {
          id: '1',
          planId: 'free',
          planName: 'Free Plan',
          planType: 'free',
          status: 'active',
          startDate: new Date().toISOString(),
          autoRenew: false,
          features: [],
          usage: {
            transactions: { used: 0, limit: 100 },
            budgets: { used: 0, limit: 5 },
            reports: { used: 0, limit: 3 },
            storage: { used: 0, limit: 1024 },
            apiCalls: { used: 0, limit: 1000 }
          },
          billing: {
            amount: 0,
            currency: 'USD',
            interval: 'monthly',
            invoices: []
          }
        },
        lastLogin: new Date().toISOString(),
        emailVerified: false,
        phoneVerified: false,
        twoFactorEnabled: false,
        accountStatus: 'pending_verification',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const mockTokens: AuthTokens = {
        accessToken: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        scope: ['read', 'write']
      };

      localStorage.setItem('authToken', mockTokens.accessToken);
      setUser(newUser);
      setTokens(mockTokens);
    } catch (error) {
      const errorMessage = 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setTokens(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    tokens,
    login,
    logout,
    register,
    isLoading,
    isAuthenticated: !!user,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
