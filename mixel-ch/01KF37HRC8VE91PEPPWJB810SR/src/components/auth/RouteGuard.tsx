import { type ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SignIn } from "@/components/ui/signin";
import { AlertTriangle, Shield } from "lucide-react";

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * RouteGuard component provides authentication-based route protection
 * 
 * @param children - Components to render when authenticated
 * @param requireAuth - Whether authentication is required (default: true)
 * @param fallback - Custom component to show when not authenticated
 * @param redirectTo - URL to redirect to after successful authentication
 */
export function RouteGuard({ 
  children, 
  requireAuth = true, 
  fallback, 
  redirectTo 
}: RouteGuardProps) {
  const { isAuthenticated, isLoading, user, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Store the current location for post-login redirect
  useEffect(() => {
    if (requireAuth && !isAuthenticated && !isLoading) {
      // Store the intended destination
      const intendedPath = redirectTo || location.pathname + location.search;
      sessionStorage.setItem('auth_redirect', intendedPath);
    }
  }, [isAuthenticated, isLoading, location, redirectTo, requireAuth]);

  // Handle post-authentication redirect
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const redirectPath = sessionStorage.getItem('auth_redirect');
      if (redirectPath && redirectPath !== location.pathname) {
        sessionStorage.removeItem('auth_redirect');
        navigate(redirectPath, { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Spinner className="mx-auto" />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state if authentication failed
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Authentication error: {error.message || 'Unable to verify your session'}
            </AlertDescription>
          </Alert>
          <div className="text-center">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              size="sm"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If authentication is not required, render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If authenticated, render children
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default authentication required screen
  return (
    <div className="flex items-center justify-center min-h-[500px] p-6">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">Authentication Required</h2>
          <p className="text-muted-foreground">
            You must be signed in to access this page. Please authenticate to continue.
          </p>
        </div>
        
        <div className="space-y-4">
          <SignIn className="w-full" />
          
          <div className="text-xs text-muted-foreground">
            <p>Secure access to protect your data</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Higher-order component for protecting routes
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<RouteGuardProps, 'children'> = {}
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <RouteGuard {...options}>
        <Component {...props} />
      </RouteGuard>
    );
  };
}

/**
 * Hook to check if current user has required permissions
 */
export function usePermissionGuard(requiredPermissions: string[] = []) {
  const { user, isAuthenticated } = useAuth();
  
  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated || !user) return false;
    
    // Check user permissions/roles - this would be customized based on your auth system
    // For now, we assume all authenticated users have basic permissions
    const userPermissions = user.permissions || ['basic'];
    return userPermissions.includes(permission) || userPermissions.includes('admin');
  };
  
  const hasAllPermissions = (): boolean => {
    return requiredPermissions.every(permission => hasPermission(permission));
  };
  
  return {
    hasPermission,
    hasAllPermissions: hasAllPermissions(),
    userPermissions: user?.permissions || []
  };
}