import React, { useEffect } from 'react';
import { useLocation, useNavigationType, createRoutesFromChildren, matchRoutes } from 'react-router-dom';
import * as Sentry from '@sentry/react';

// 🎯 Service de monitoring unifié pour CandiVoc

interface User {
  id: string
  email?: string
  username?: string
}

interface MonitoringContext {
  [key: string]: any
}

export class MonitoringService {
  private static isInitialized = false

  // 🚀 Initialisation du monitoring
  static init() {
    if (this.isInitialized) return

    // 🚫 Désactiver en développement
    if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
      console.log('🚫 Monitoring désactivé en développement')
      return
    }

    // 🔧 Initialiser Sentry
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE,
        tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
        maxBreadcrumbs: 50,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.reactRouterV6BrowserTracingIntegration({
            useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes,
          }),
        ],
        ignoreErrors: [
          'Network Error',
          'Failed to fetch',
          'ResizeObserver loop limit exceeded',
        ],
        denyUrls: [
          /extensions\//i,
          /^chrome:\/\//i,
          /^chrome-extension:\/\//i,
          /localhost/i,
        ],
        release: import.meta.env.VITE_APP_VERSION || 'unknown',
      })

      this.isInitialized = true
      console.log('✅ Sentry monitoring activé')
    }
  }

  // 👤 Définir l'utilisateur
  static setUser(user: User | null) {
    if (!this.isInitialized) return

    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
      })
    } else {
      Sentry.setUser(null)
    }
  }

  // 🏷️ Définir des tags
  static setTags(tags: Record<string, string>) {
    if (!this.isInitialized) return

    Sentry.setTags({
      ...tags,
      app: 'candivoc',
      platform: 'web',
    })
  }

  // 📝 Définir un contexte
  static setContext(key: string, context: MonitoringContext) {
    if (!this.isInitialized) return

    Sentry.setContext(key, context)
  }

  // 🚨 Capturer une exception
  static captureException(error: Error | string, context?: MonitoringContext) {
    console.error('🚨 Monitoring Error:', error)

    if (!this.isInitialized) {
      console.warn('⚠️ Monitoring non initialisé, erreur non envoyée')
      return
    }

    if (context) {
      Sentry.withScope(scope => {
        scope.setContext('error_context', context)
        Sentry.captureException(error)
      })
    } else {
      Sentry.captureException(error)
    }
  }

  // 📤 Capturer un message
  static captureMessage(
    message: string,
    level: 'debug' | 'info' | 'warning' | 'error' = 'info',
    context?: MonitoringContext
  ) {
    console.warn(`⚠️ Monitoring Message [${level}]:`, message)

    if (!this.isInitialized) {
      console.warn('⚠️ Monitoring non initialisé, message non envoyé')
      return
    }

    if (context) {
      Sentry.withScope(scope => {
        scope.setContext('message_context', context)
        Sentry.captureMessage(message, level)
      })
    } else {
      Sentry.captureMessage(message, level)
    }
  }

  // 📊 Capturer une métrique personnalisée
  static captureMetric(name: string, value: number, unit?: string) {
    if (!this.isInitialized) return

    Sentry.addBreadcrumb({
      message: `Metric: ${name} = ${value}${unit || ''}`,
      category: 'custom',
      level: 'info',
      data: { name, value, unit },
    })

    Sentry.setTags({
      [`metric_${name}`]: String(value),
    })
  }

  // 🎯 Error Boundary
  static ErrorBoundary: React.FC<{
    children: React.ReactNode
    fallback?: (errorData: { error: unknown; componentStack: string; eventId: string; resetError: () => void }) => React.ReactElement
  }> = ({ children, fallback: Fallback }) => {
    return (
      <Sentry.ErrorBoundary
        fallback={Fallback || DefaultErrorFallback}
        onError={(error, errorInfo) => {
          console.error('🚨 Error Boundary:', error, errorInfo)
          if (error instanceof Error) {
            this.captureException(error, { errorInfo } as MonitoringContext)
          } else {
            this.captureException(String(error), { errorInfo } as MonitoringContext)
          }
        }}
      >
        {children}
      </Sentry.ErrorBoundary>
    )
  }

  // 🪝 Hook pour tracking des transactions
  static useTransaction(name: string, operation: string) {
    return React.useMemo(() => {
      if (!this.isInitialized) return null

      return {
        start: () => console.log(`🎯 Transaction started: ${name}`),
        finish: () => console.log(`✅ Transaction finished: ${name}`),
      }
    }, [name, operation])
  }
}

// 🔄 Fallback par défaut pour Error Boundary
const DefaultErrorFallback = (errorData: { error: unknown; componentStack: string; eventId: string; resetError: () => void }) => {
  const error = errorData.error as Error;
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-red-100 border border-red-200 rounded-lg p-6 text-center">
        <div className="mb-4">
          <span className="text-4xl">🚨</span>
        </div>
        <h1 className="text-xl font-semibold text-red-900 mb-2">
          Une erreur est survenue
        </h1>
        <p className="text-red-700 mb-4">
          Nous sommes désolés, une erreur inattendue s'est produite.
          L'équipe technique a été notifiée.
        </p>
        <details className="text-left mb-4">
          <summary className="cursor-pointer text-red-600 hover:text-red-800">
            Détails techniques
          </summary>
          <pre className="mt-2 p-2 bg-red-50 rounded text-xs text-red-800 overflow-auto">
            {error.toString()}
          </pre>
        </details>
        <button
          onClick={errorData.resetError}
          className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
};

export default MonitoringService
