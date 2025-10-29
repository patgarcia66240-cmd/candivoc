import * as Sentry from '@sentry/react'
import { browserTracingIntegration } from '@sentry/browser'
import React from 'react'

// 🎯 Configuration Sentry pour CandiVoc
export function initSentry() {
  // 🚫 Ne pas initialiser en développement ou test
  if (
    import.meta.env.DEV ||
    import.meta.env.MODE === 'development' ||
    window.location.hostname === 'localhost'
  ) {
    console.log('🚫 Sentry désactivé en développement')
    return
  }

  // 🔧 Configuration Sentry
  Sentry.init({
    // 🎯 DSN depuis les variables d'environnement
    dsn: import.meta.env.VITE_SENTRY_DSN,

    // 🌍 Environnement
    environment: import.meta.env.MODE,

    // 📊 Échantillonnage (10% en production)
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // 🔄 Limiter les breadcrumbs pour éviter les fuites mémoire
    maxBreadcrumbs: 50,

    // 📤 Envoyer les erreurs automatiquement

    // 🔍 Intégration avec React
    integrations: [
      browserTracingIntegration(),
    ],

    // 🚫 Ignorer certaines erreurs
    ignoreErrors: [
      'Network Error',
      'Failed to fetch',
      'ResizeObserver loop limit exceeded',
    ],

    // 🚫 Ignorer certaines URLs
    denyUrls: [
      /extensions\/\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      /localhost/i,
      /^https?:\/\/(dev|staging)\./i,
    ],

    // 📝 Release tracking
    release: import.meta.env.VITE_APP_VERSION || 'unknown',

    })
}

// 📤 Enrichir l'utilisateur Sentry
export function setSentryUser(user: {
  id: string
  email?: string
  username?: string
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  })
}

// 🏷️ Enrichir les tags Sentry
export function setSentryTags(tags: Record<string, string>) {
  Sentry.setTags(tags)
}

// 📥 Enrichir le contexte Sentry
export function setSentryContext(key: string, context: Record<string, unknown>) {
  Sentry.setContext(key, context)
}

// 📤 Capturer les erreurs manuellement
export function captureException(error: Error, context?: Record<string, unknown>) {
  console.error('🚨 Sentry Error:', error)

  if (context) {
    Sentry.withScope(scope => {
      scope.setContext('manual_error', context)
      Sentry.captureException(error)
    })
  } else {
    Sentry.captureException(error)
  }
}

// 📤 Capturer les messages d'erreur
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  console.warn('⚠️ Sentry Message:', message)
  Sentry.captureMessage(message, level)
}

// 🔥 Error Boundary React
export function SentryErrorBoundary({
  children,
  fallback
}: {
  children: React.ReactNode
  fallback: React.ComponentType<{ error: Error; reset: () => void }>
}) {
  // Use React.createElement to avoid requiring .tsx and to bypass strict fallback typing
  return React.createElement(
    Sentry.ErrorBoundary as React.ComponentType<React.PropsWithChildren<{
      fallback?: React.ReactNode | (({error, reset}: {error: Error, reset: () => void}) => React.ReactNode);
      showDialog?: boolean;
      onError?: (error: Error, errorInfo: Record<string, unknown>) => void;
    }>>,
    {
      fallback: ({error, reset}: {error: Error, reset: () => void}) => React.createElement(fallback, {error, reset}),
      showDialog: import.meta.env.DEV,
      onError: (error: Error, errorInfo: Record<string, unknown>) => {
        console.error('🚨 Sentry Error Boundary:', error, errorInfo)
      },
    },
    children
  )
}

// 🔥 Hook pour tracking des transactions (monitoring local uniquement)
export function useSentryTransaction(name: string) {
  return React.useMemo(() => {
    return {
      start: () => console.log(`🎯 Transaction started: ${name}`),
      finish: () => console.log(`✅ Transaction finished: ${name}`),
    }
  }, [name])
}

export default initSentry
