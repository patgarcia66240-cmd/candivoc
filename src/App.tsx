import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './services/auth/authContext';
import { useAuth } from './services/auth/useAuth';
import { ToastProvider } from './contexts/ToastProvider';
import { ThemeProvider } from './contexts/ThemeContext';
import { Key } from 'lucide-react';
import { SEOHead } from './components/seo/SEOHead';
import { PWAInstallPrompt } from './components/pwa/PWAInstallPrompt';
import { PWAStatus } from './components/pwa/PWAStatus';

// 🚀 Import lazy routes optimisées
import {
  Landing,
  Dashboard,
  Scenarios,
  Sessions,
  Session,
  Settings,
  Chat,
  ConfigErrorSimple,
  Pricing,
  PaymentSuccess,
  usePrefetching
} from './routes/LazyRoutes';
import { PageSkeleton } from './components/ui/PageSkeleton';
import { Layout } from './components/ui/Layout';

// 🎯 Composant de chargement pour authentification
const AuthLoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
    <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-sm">
      <div className="relative flex items-center justify-center">
        <div className="animate-pulse rounded-full h-16 w-16 bg-orange-200 flex items-center justify-center">
          <Key className="h-8 w-8 text-orange-600 animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-full h-16 w-16 border-2 border-orange-300 animate-ping"></div>
      </div>
      <div className="flex flex-col items-center justify-center space-y-2">
        <p className="text-gray-700 font-medium text-center">En attente d'authentification...</p>
        <p className="text-gray-500 text-sm text-center">Vérification de votre session</p>
      </div>
    </div>
  </div>
);

// 🛡️ Route privée optimisée
const PrivateRoute: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Layout>{children}</Layout>;
  } else {
    return <Navigate to="/" replace />;
  }
});

PrivateRoute.displayName = 'PrivateRoute';

// 🚀 Routes optimisées avec lazy loading
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route
        path="/"
        element={
          <React.Suspense fallback={<PageSkeleton />}>
            <Landing />
          </React.Suspense>
        }
      />

      
      <Route
        path="/config-error"
        element={
          <React.Suspense fallback={<PageSkeleton />}>
            <ConfigErrorSimple />
          </React.Suspense>
        }
      />

      {/* Routes protégées avec lazy loading */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <React.Suspense fallback={<PageSkeleton />}>
              <Dashboard />
            </React.Suspense>
          </PrivateRoute>
        }
      />

      <Route
        path="/scenarios"
        element={
          <PrivateRoute>
            <React.Suspense fallback={<PageSkeleton />}>
              <Scenarios />
            </React.Suspense>
          </PrivateRoute>
        }
      />

      <Route
        path="/sessions"
        element={
          <PrivateRoute>
            <React.Suspense fallback={<PageSkeleton />}>
              <Sessions />
            </React.Suspense>
          </PrivateRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <React.Suspense fallback={<PageSkeleton />}>
              <Settings />
            </React.Suspense>
          </PrivateRoute>
        }
      />

      <Route
        path="/tarifs"
        element={
          <PrivateRoute>
            <React.Suspense fallback={<PageSkeleton />}>
              <Pricing />
            </React.Suspense>
          </PrivateRoute>
        }
      />

      <Route
        path="/chat/:sessionId"
        element={
          <PrivateRoute>
            <React.Suspense fallback={<PageSkeleton />}>
              <Chat />
            </React.Suspense>
          </PrivateRoute>
        }
      />

      <Route
        path="/session/:sessionId"
        element={
          <PrivateRoute>
            <React.Suspense fallback={<PageSkeleton />}>
              <Session />
            </React.Suspense>
          </PrivateRoute>
        }
      />

      <Route
        path="/success"
        element={
          <PrivateRoute>
            <React.Suspense fallback={<PageSkeleton />}>
              <PaymentSuccess />
            </React.Suspense>
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

// 🎯 Application avec prefetching intelligent
const App: React.FC = () => {
  // 🚀 Activer le préchargement intelligent
  usePrefetching();

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <SEOHead />
            <div className="App">
              <AppRoutes />
            </div>
            <PWAInstallPrompt />
            <PWAStatus />
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;