import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute component - protects admin-only pages
 * Requires authentication AND admin role
 * Redirects to home if user is not authenticated or not an admin
 */
export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) {
      return;
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Redirect if authenticated but not admin
    if (user && user.role !== 'ADMIN') {
      console.warn('Access denied: Admin role required');
      navigate('/');
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated || (user && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-black" />
    );
  }

  // If authenticated and admin, render the children
  return <>{children}</>;
};
