import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from '@tanstack/react-router';
import './App.css';
import { AuthProvider } from './services/auth/authContext';
import { ToastProvider } from './contexts/ToastProvider';
import { ThemeProvider } from './contexts/ThemeContext';
import { PWAInstallPrompt } from './components/pwa/PWAInstallPrompt';
import { PWAStatus } from './components/pwa/PWAStatus';
import { queryClient } from './lib/react-query';
import { router } from './routing/router';

// Lightweight placeholder hook for prefetching to avoid a missing-module error.
// Replace this with the real implementation in src/hooks/usePrefetching.ts when available.
const usePrefetching = (): void => {
  React.useEffect(() => {
    // no-op: kept for compatibility with existing call sites in App.tsx
  }, []);
};

// 🎯 Initialisation des services de monitoring
import MonitoringService from './lib/monitoring';
import AnalyticsService from './lib/analytics';
import PerformanceService from './lib/performance';

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
              <RouterProvider router={router} />
              <PWAInstallPrompt />
              <PWAStatus />
            </MonitoringService.ErrorBoundary>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
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
