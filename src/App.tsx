import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './App.css';
import { AuthProvider } from './services/auth/authContext';
import { useAuth } from './services/auth/useAuth';
import { ToastProvider } from './contexts/ToastProvider';
import { ThemeProvider } from './contexts/ThemeContext';
import { Key } from 'lucide-react';
import { SEOHead } from './components/seo/SEOHead';
import { PWAInstallPrompt } from './components/pwa/PWAInstallPrompt';
import { PWAStatus } from './components/pwa/PWAStatus';
import { Layout } from './components/ui/Layout';
import { PageSkeleton } from './components/ui/PageSkeleton';
import { TarifsSkeleton } from './components/ui/TarifsSkeleton';
import { queryClient } from './lib/react-query';

// Lightweight placeholder hook for prefetching to avoid a missing-module error.
// Replace this with the real implementation in src/hooks/usePrefetching.ts when available.
const usePrefetching = (): void => {
  React.useEffect(() => {
    // no-op: kept for compatibility with existing call sites in App.tsx
  }, []);
};

// Lazy-load route pages to match Suspense usage
// Ensure the dynamic import always returns an object with a `default` component so React.lazy's typing is satisfied.
// This handles modules that export the component as a named export or a default export.
const Landing = React.lazy(() =>
  import('./pages/Landing').then((m: Record<string, unknown>) => ({ default: (m as Record<string, unknown>).default ?? (m as Record<string, unknown>).Landing }))
);
const ConfigErrorSimple = React.lazy(() =>
  import('./pages/ConfigErrorSimple').then((m: Record<string, unknown>) => ({ default: (m as Record<string, unknown>).default ?? (m as Record<string, unknown>).ConfigErrorSimple }))
);
const Dashboard = React.lazy(() =>
  import('./pages/Dashboard').then((m: Record<string, unknown>) => ({ default: (m as Record<string, unknown>).default ?? (m as Record<string, unknown>).Dashboard }))
);
const Scenarios = React.lazy(() =>
  import('./pages/Scenarios').then((m: Record<string, unknown>) => ({ default: (m as Record<string, unknown>).default ?? (m as Record<string, unknown>).Scenarios }))
);
const Sessions = React.lazy(() =>
  import('./pages/Sessions').then((m: Record<string, unknown>) => ({ default: (m as Record<string, unknown>).default ?? (m as Record<string, unknown>).Sessions }))
);
const Settings = React.lazy(() =>
  import('./pages/Settings').then((m: Record<string, unknown>) => ({ default: (m as Record<string, unknown>).default ?? (m as Record<string, unknown>).Settings }))
);
const Pricing = React.lazy(() =>
  import('./pages/Pricing').then((m: Record<string, unknown>) => ({ default: (m as Record<string, unknown>).default ?? (m as Record<string, unknown>).Pricing }))
);
const Chat = React.lazy(() =>
  import('./pages/Chat').then((m: Record<string, unknown>) => ({ default: (m as Record<string, unknown>).default ?? (m as Record<string, unknown>).Chat }))
);
const Session = React.lazy(() =>
  import('./pages/Session').then((m: Record<string, unknown>) => ({ default: (m as Record<string, unknown>).default ?? (m as Record<string, unknown>).Session }))
);
const PaymentSuccess = React.lazy(() =>
  import('./pages/PaymentSuccess').then((m: Record<string, unknown>) => ({ default: (m as Record<string, unknown>).default ?? (m as Record<string, unknown>).PaymentSuccess }))
);

// 🎯 Initialisation des services de monitoring
import MonitoringService from './lib/monitoring';
import AnalyticsService from './lib/analytics';
import PerformanceService from './lib/performance';

// 🎯 Composant de chargement pour authentification
const AuthLoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-linear-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
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
        path="/pricing"
        element={
          <PrivateRoute>
            <React.Suspense fallback={<TarifsSkeleton />}>
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

// 🎯 Application avec monitoring et prefetching intelligent
const App: React.FC = () => {
  // 🚀 Initialiser les services de monitoring au démarrage
  React.useEffect(() => {
    // Initialiser monitoring (développement désactivé automatiquement)
    MonitoringService.init()
    AnalyticsService.init()
    PerformanceService.init()

    // Définir l'environnement dans les analytics
    AnalyticsService.setUserProperties({
      environment: import.meta.env.MODE,
      version: import.meta.env.VITE_APP_VERSION || 'unknown',
    })
  }, [])

  // 🚀 Activer le préchargement intelligent
  usePrefetching();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <MonitoringService.ErrorBoundary
              fallback={(errorData) => <ErrorFallback error={errorData.error as Error} reset={errorData.resetError} />}
            >
              <Router>
                <SEOHead />
                <div className="App">
                  <AppRoutes />
                </div>
                <PWAInstallPrompt />
                <PWAStatus />
              </Router>
            </MonitoringService.ErrorBoundary>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
      {/* 🔧 DevTools uniquement en développement */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

// 🔄 Fallback d'erreur avec monitoring
const ErrorFallback: React.FC<{ error: Error; reset: () => void }> = ({ error, reset }) => {
  React.useEffect(() => {
    // Capturer l'erreur dans les services de monitoring
    MonitoringService.captureException(error, { component: 'App', type: 'boundary' })
    AnalyticsService.trackError(error, 'app_boundary')
  }, [error])

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-red-100 border border-red-200 rounded-lg p-6 text-center">
        <div className="mb-4">
          <span className="text-4xl">🚨</span>
        </div>
        <h1 className="text-xl font-semibold text-red-900 mb-2">
          Une erreur critique est survenue
        </h1>
        <p className="text-red-700 mb-4">
          Une erreur inattendue a interrompu le fonctionnement de l'application.
          Nos équipes ont été automatiquement notifiées.
        </p>
        <details className="text-left mb-4">
          <summary className="cursor-pointer text-red-600 hover:text-red-800">
            Détails techniques
          </summary>
          <pre className="mt-2 p-2 bg-red-50 rounded text-xs text-red-800 overflow-auto">
            {error.toString()}
          </pre>
        </details>
        <div className="space-y-2">
          <button
            onClick={reset}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Recharger la page
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
