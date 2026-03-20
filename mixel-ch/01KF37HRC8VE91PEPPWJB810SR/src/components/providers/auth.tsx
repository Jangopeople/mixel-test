import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SessionSecurity, RateLimiter } from "@/lib/security";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name?: string;
  permissions?: string[];
  lastLogin?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  signIn: (credentials?: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  
  // Query current user from Convex
  const currentUser = useQuery(api.users.getCurrentUser);
  
  const isAuthenticated = !!user;
  
  // Initialize session monitoring
  useEffect(() => {
    SessionSecurity.initSessionMonitoring();
    
    // Listen for session expiry
    const handleSessionExpiry = () => {
      setUser(null);
      setError(new Error('Session expired'));
      toast.error('Your session has expired. Please sign in again.');
    };
    
    window.addEventListener('session:expired', handleSessionExpiry);
    
    return () => {
      window.removeEventListener('session:expired', handleSessionExpiry);
    };
  }, []);
  
  // Update user state when Convex data changes
  useEffect(() => {
    if (currentUser !== undefined) {
      setIsLoading(false);
      setSessionChecked(true);
      
      if (currentUser) {
        const userData: User = {
          id: currentUser._id,
          email: currentUser.email,
          name: currentUser.name,
          permissions: currentUser.permissions || ['basic'],
          lastLogin: currentUser.lastLogin
        };
        
        setUser(userData);
        setError(null);
        
        // Update session activity
        SessionSecurity.updateActivity();
        
        // Log successful authentication check
        console.info('User authenticated successfully');
      } else {
        setUser(null);
        
        // Check if session expired
        if (SessionSecurity.isSessionExpired()) {
          setError(new Error('Session expired'));
        }
      }
    }
  }, [currentUser]);
  
  // Periodic session validation
  useEffect(() => {
    if (!sessionChecked) return;
    
    const validateSession = () => {
      if (isAuthenticated && SessionSecurity.isSessionExpired()) {
        console.warn('Session expired during validation');
        signOut();
      }
    };
    
    // Check session every 5 minutes
    const interval = setInterval(validateSession, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, sessionChecked]);
  
  const signIn = async (credentials?: any): Promise<void> => {
    const rateLimitKey = `signin_${credentials?.email || 'unknown'}`;
    
    // Check rate limiting
    if (RateLimiter.isRateLimited(rateLimitKey, 5, 15 * 60 * 1000)) {
      throw new Error('Too many sign-in attempts. Please try again in 15 minutes.');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, you would handle the actual sign-in process here
      // For now, we'll simulate the process
      
      // Validate credentials format
      if (credentials?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
        throw new Error('Invalid email format');
      }
      
      // This would typically redirect to your OIDC provider
      // For now, we'll just update the session
      SessionSecurity.updateActivity();
      
      console.info('Sign-in process initiated');
      
      // Reset rate limiting on successful attempt
      RateLimiter.resetRateLimit(rateLimitKey);
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign-in failed');
      setError(error);
      console.error('Sign-in error:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Clear user state
      setUser(null);
      
      // Clear session data
      SessionSecurity.clearSession();
      
      // Clear any cached data
      localStorage.clear();
      sessionStorage.clear();
      
      console.info('User signed out successfully');
      
      // In a real implementation, you might also call your auth provider's sign-out endpoint
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign-out failed');
      setError(error);
      console.error('Sign-out error:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshSession = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Update session activity
      SessionSecurity.updateActivity();
      
      // In a real implementation, you might refresh the authentication token here
      console.info('Session refreshed');
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Session refresh failed');
      setError(error);
      console.error('Session refresh error:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Security validation on user changes
  useEffect(() => {
    if (user) {
      // Validate user data integrity
      if (!user.id || !user.email) {
        console.error('Invalid user data detected');
        setError(new Error('Invalid user session'));
        signOut();
        return;
      }
      
      // Check for suspicious activity (basic implementation)
      const lastLogin = user.lastLogin ? new Date(user.lastLogin).getTime() : 0;
      const now = Date.now();
      
      if (lastLogin && (now - lastLogin) > 24 * 60 * 60 * 1000) {
        // User hasn't logged in for 24+ hours, might want to re-verify
        console.info('User session is older than 24 hours');
      }
    }
  }, [user]);
  
  const value: AuthState = {
    user,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signOut,
    refreshSession
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}