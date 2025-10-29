import React from 'react'
import {
  QueryErrorResetBoundary
} from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

interface ReactQueryErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

// 🎯 Composant de fallback personnalisé
const DefaultErrorFallback = ({ error, resetErrorBoundary }: {
  error: Error;
  resetErrorBoundary: () => void;
}) => (
  <div className="min-h-[200px] flex items-center justify-center p-4">
    <div className="text-center max-w-md">
      <div className="mb-4">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Erreur de chargement
      </h2>

      <p className="text-gray-600 mb-4">
        {error.message || 'Une erreur est survenue lors du chargement des données.'}
      </p>

      <div className="space-y-2">
        <button
          onClick={resetErrorBoundary}
          className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Réessayer
        </button>

        <button
          onClick={() => window.location.reload()}
          className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Actualiser la page
        </button>
      </div>

      {import.meta.env.DEV && (
        <details className="mt-4 text-left">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
            Détails techniques (dev)
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
)

// 🎯 Error Boundary pour React Query
export function ReactQueryErrorBoundary({
  children,
  fallback: FallbackComponent = DefaultErrorFallback,
  onError
}: ReactQueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          FallbackComponent={FallbackComponent}
          onError={onError}
          onReset={() => {
            reset()
            window.location.reload()
          }}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}



// 🎯 Composant wrapper pour les requêtes individuelles
export function QueryBoundary({
  children,
  fallback,
  errorComponent: ErrorComponent = DefaultErrorFallback,
  loadingComponent: LoadingComponent
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorComponent?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  loadingComponent?: React.ComponentType;
}) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          FallbackComponent={ErrorComponent}
          onReset={reset}
          onError={(error) => {
            console.error('React Query Error:', error)
          }}
        >
          <React.Suspense fallback={LoadingComponent ? <LoadingComponent /> : fallback || null}>
            {children}
          </React.Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
