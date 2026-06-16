import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useConvexAuth } from "convex/react";

// Authentication context types
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
  sessionExpiry: number | null;
}

interface User {
  id: string;
  email: string;
  name: string;
  tokenIdentifier: string;
  lastActivity: number;
  sessionId: string;
}

interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  validateSession: () => boolean;
  updateLastActivity: () => void;
}

// Create authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session configuration
const SESSION_CONFIG = {
  // Session timeout in milliseconds (24 hours)
  TIMEOUT: 24 * 60 * 60 * 1000,
  // Activity check interval (5 minutes)
  ACTIVITY_CHECK_INTERVAL: 5 * 60 * 1000,
  // Warning before session expires (5 minutes)
  EXPIRY_WARNING: 5 * 60 * 1000,
  // Storage keys
  STORAGE_KEYS: {
    SESSION_ID: 'auth_session_id',
    LAST_ACTIVITY: 'auth_last_activity',
    SESSION_EXPIRY: 'auth_session_expiry',
  },
};

// Generate session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Secure session storage helpers
class SecureStorage {
  static setItem(key: string, value: string): void {
    try {
      // Encrypt value in production (placeholder for actual encryption)
      const secureValue = btoa(value); // Base64 encoding as placeholder
      localStorage.setItem(key, secureValue);
    } catch (error) {
      console.error('Failed to store secure item:', error);
    }
  }

  static getItem(key: string): string | null {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;
      // Decrypt value in production (placeholder for actual decryption)
      return atob(value); // Base64 decoding as placeholder
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      return null;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove secure item:', error);
    }
  }

  static clear(): void {
    try {
      Object.values(SESSION_CONFIG.STORAGE_KEYS).forEach(key => {
        this.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear secure storage:', error);
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated: convexIsAuthenticated, isLoading: convexIsLoading } = useConvexAuth();
  
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
    sessionExpiry: null,
  });

  // Validate session based on expiry and activity
  const validateSession = useCallback((): boolean => {
    const now = Date.now();
    const lastActivity = SecureStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.LAST_ACTIVITY);
    const sessionExpiry = SecureStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_EXPIRY);

    if (!lastActivity || !sessionExpiry) {
      return false;
    }

    const lastActivityTime = parseInt(lastActivity, 10);
    const expiryTime = parseInt(sessionExpiry, 10);

    // Check if session has expired
    if (now > expiryTime) {
      console.log('Session expired due to timeout');
      return false;
    }

    // Check if user has been inactive too long
    const inactivityTimeout = now - lastActivityTime;
    if (inactivityTimeout > SESSION_CONFIG.TIMEOUT) {
      console.log('Session expired due to inactivity');
      return false;
    }

    return true;
  }, []);

  // Update user's last activity timestamp
  const updateLastActivity = useCallback(() => {
    const now = Date.now();
    SecureStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.LAST_ACTIVITY, now.toString());
  }, []);

  // Refresh session and extend expiry
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      if (!validateSession()) {
        throw new Error('Session validation failed');
      }

      const now = Date.now();
      const newExpiry = now + SESSION_CONFIG.TIMEOUT;
      
      SecureStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_EXPIRY, newExpiry.toString());
      updateLastActivity();

      setAuthState(prev => ({
        ...prev,
        sessionExpiry: newExpiry,
        error: null,
      }));

      console.log('Session refreshed successfully');
    } catch (error) {
      console.error('Session refresh failed:', error);
      await logout();
    }
  }, [validateSession, updateLastActivity]);

  // Handle user login
  const login = useCallback(async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Generate new session
      const sessionId = generateSessionId();
      const now = Date.now();
      const expiry = now + SESSION_CONFIG.TIMEOUT;

      // Store session data securely
      SecureStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_ID, sessionId);
      SecureStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_EXPIRY, expiry.toString());
      SecureStorage.setItem(SESSION_CONFIG.STORAGE_KEYS.LAST_ACTIVITY, now.toString());

      // Create user object (this would typically come from the authentication provider)
      const user: User = {
        id: 'user_' + Date.now(),
        email: 'user@mixel.ch', // This should come from OIDC provider
        name: 'User Name', // This should come from OIDC provider
        tokenIdentifier: 'token_' + sessionId,
        lastActivity: now,
        sessionId,
      };

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
        error: null,
        sessionExpiry: expiry,
      });

      // Log successful authentication
      console.log('User authenticated successfully', {
        userId: user.id,
        sessionId,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Login failed:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
    }
  }, []);

  // Handle user logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      const currentUser = authState.user;
      
      // Clear all session data
      SecureStorage.clear();
      
      // Reset authentication state
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
        sessionExpiry: null,
      });

      // Log successful logout
      console.log('User logged out successfully', {
        userId: currentUser?.id,
        sessionId: currentUser?.sessionId,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear state even if logging fails
      SecureStorage.clear();
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
        sessionExpiry: null,
      });
    }
  }, [authState.user]);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true }));

        // Check if there's a valid session
        const sessionId = SecureStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_ID);
        const sessionExpiry = SecureStorage.getItem(SESSION_CONFIG.STORAGE_KEYS.SESSION_EXPIRY);

        if (sessionId && sessionExpiry && validateSession()) {
          // Restore session
          const user: User = {
            id: 'user_restored',
            email: 'user@mixel.ch',
            name: 'User Name',
            tokenIdentifier: 'token_' + sessionId,
            lastActivity: Date.now(),
            sessionId,
          };

          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user,
            error: null,
            sessionExpiry: parseInt(sessionExpiry, 10),
          });

          updateLastActivity();
        } else {
          // No valid session found
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: false,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: error instanceof Error ? error.message : 'Authentication initialization failed',
          sessionExpiry: null,
        });
      }
    };

    initializeAuth();
  }, [validateSession, updateLastActivity]);

  // Set up session monitoring
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const monitorSession = () => {
      if (!validateSession()) {
        console.log('Session expired, logging out user');
        logout();
        return;
      }

      // Check if session is close to expiry
      const now = Date.now();
      if (authState.sessionExpiry && (authState.sessionExpiry - now) < SESSION_CONFIG.EXPIRY_WARNING) {
        console.log('Session expiring soon, attempting refresh');
        refreshSession();
      }
    };

    const interval = setInterval(monitorSession, SESSION_CONFIG.ACTIVITY_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [authState.isAuthenticated, authState.sessionExpiry, validateSession, logout, refreshSession]);

  // Track user activity
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const handleActivity = () => {
      updateLastActivity();
    };

    // Listen for user activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [authState.isAuthenticated, updateLastActivity]);

  // Create context value
  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshSession,
    validateSession,
    updateLastActivity,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use authentication context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for route protection
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access this page.</p>
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Log In
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Export types for use in other components
export type { User, AuthState, AuthContextType };