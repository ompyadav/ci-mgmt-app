import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required roles
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = user?.roles?.some((role) => {
      // Check both with and without ROLE_ prefix
      const roleWithoutPrefix = role.replace('ROLE_', '');
      return requiredRoles.includes(role) || requiredRoles.includes(roleWithoutPrefix);
    });

    if (!hasRequiredRole) {
      // Redirect to unauthorized page or dashboard
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// Made with Bob
