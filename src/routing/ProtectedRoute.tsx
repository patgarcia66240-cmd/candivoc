import React from 'react';
import { useAuth } from '../services/auth/useAuth';
import { useNavigate } from '@tanstack/react-router';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = '/'
}) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Afficher un écran de chargement pendant la vérification de l'auth
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-sm">
          <div className="relative flex items-center justify-center">
            <div className="animate-pulse rounded-full h-16 w-16 bg-orange-200 flex items-center justify-center">
              <svg className="h-8 w-8 text-orange-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-2 border-orange-300 animate-ping"></div>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2">
            <p className="text-gray-700 font-medium text-center">Vérification de l'authentification...</p>
            <p className="text-gray-500 text-sm text-center">Chargement de votre session</p>
          </div>
        </div>
      </div>
    );
  }

  // Rediriger vers la page de connexion si non authentifié
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: fallback });
    }
  }, [isAuthenticated, navigate, fallback]);

  // Afficher le contenu si authentifié
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

ProtectedRoute.displayName = 'ProtectedRoute';