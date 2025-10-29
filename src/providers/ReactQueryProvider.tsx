import React from 'react'
import { QueryClientProvider, QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactQueryErrorBoundary } from '@/components/error-boundaries/ReactQueryErrorBoundary'
import { toast } from '@/lib/toast'

interface ReactQueryProviderProps {
  children: React.ReactNode
  enableDevtools?: boolean
}

// 🎯 Provider React Query avec configuration avancée
export function ReactQueryProvider({
  children,
  enableDevtools = process.env.NODE_ENV === 'development'
}: ReactQueryProviderProps) {
  // Helper functions for safe error property access
  const getErrorStatus = (error: unknown): number | undefined => {
    if (typeof error === 'object' && error && 'status' in error && typeof (error as { status: unknown }).status === 'number') {
      return (error as { status: number }).status;
    }
    return undefined;
  };

  const getErrorCode = (error: unknown): string | undefined => {
    if (typeof error === 'object' && error && 'code' in error && typeof (error as { code: unknown }).code === 'string') {
      return (error as { code: string }).code;
    }
    return undefined;
  };

  const getErrorMessage = (error: unknown): string | undefined => {
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
      return (error as { message: string }).message;
    }
    return undefined;
  };

  // 📊 Configuration du cache pour les erreurs globales
  const queryCache = new QueryCache({
    onError: (error, query) => {
      // Ne pas afficher de toast pour les erreurs silencieuses
      if (query.meta?.silent) return

      // Erreurs réseau
      if (getErrorCode(error) === 'NETWORK_ERROR' || getErrorMessage(error)?.includes('fetch')) {
        toast.error('Erreur de connexion. Vérifiez votre internet.')
        return
      }

      // Erreurs d'authentification
      if (getErrorStatus(error) === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.')
        // Optionnel: rediriger vers la page de connexion
        window.location.href = '/login'
        return
      }

      // Erreurs d'autorisation
      if (getErrorStatus(error) === 403) {
        toast.error('Accès non autorisé.')
        return
      }

      // Erreurs serveur
      const status = getErrorStatus(error)
      if (status && status >= 500) {
        toast.error('Erreur serveur. Veuillez réessayer plus tard.')
        return
      }

      // Erreur générique
      if (query.meta?.showError !== false) {
        const message = getErrorMessage(error) || 'Une erreur est survenue'
        toast.error(message)
      }
    },

    onSuccess: (_data, query) => {
      // Succès silencieux par défaut
      if (typeof query.meta?.showSuccess === 'string') {
        toast.success(query.meta.showSuccess)
      }
    },

    onSettled: (_data, _error, query) => {
      // Log des performances en développement
      if (process.env.NODE_ENV === 'development' && query.meta?.logPerformance) {
        console.log(`Query ${String(query.queryKey[0])} settled in ${Date.now() - query.state.dataUpdatedAt}ms`)
      }
    }
  })

  // 🔄 Configuration du cache pour les mutations
  const mutationCache = new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      // Ne pas afficher de toast pour les mutations silencieuses
      if (mutation.meta?.silent) return

      // Erreurs spécifiques aux mutations
      if (getErrorStatus(error) === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.')
        return
      }

      if (getErrorStatus(error) === 403) {
        toast.error('Action non autorisée.')
        return
      }

      // Erreur générique pour les mutations
      const message = typeof mutation.meta?.errorMessage === 'string' ? mutation.meta.errorMessage : getErrorMessage(error) || 'Une erreur est survenue'
      toast.error(message)
    },

    onSuccess: (_data, _variables, _context, mutation) => {
      // Succès personnalisé pour les mutations
      if (typeof mutation.meta?.successMessage === 'string') {
        toast.success(mutation.meta.successMessage)
      }
    },

    onMutate: (_variables, mutation) => {
      // Optimistic mutations
      if (mutation.meta?.optimistic) {
        console.log('Starting optimistic mutation:', String(mutation.options?.mutationKey))
      }
    },

    onSettled: (_data, _error, _variables, _context) => {
      // Nettoyage des optimistic updates et logging peuvent être ajoutés ici si nécessaire
      // Note: Les informations sur la mutation ne sont pas disponibles dans onSettled
    }
  })

  // 🏭 Créer un client avec les caches configurés
  const enhancedClient = new QueryClient({
    queryCache,
    mutationCache,
    defaultOptions: {
      queries: {
        // Configuration par défaut pour toutes les requêtes
        retry: (failureCount, error) => {
          // Retry personnalisé basé sur l'erreur
          const status = getErrorStatus(error)
          if (status === 404) return false
          if (status && status >= 400 && status < 500) return false
          return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        networkMode: 'online',
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
        networkMode: 'online',
      }
    }
  })

  return (
    <QueryClientProvider client={enhancedClient}>
      <ReactQueryErrorBoundary
        onError={(error, errorInfo) => {
          // Log des erreurs critiques
          console.error('Critical React Query Error:', error, errorInfo)

          // Envoyer à un service de monitoring en production
          if (process.env.NODE_ENV === 'production') {
            // TODO: Intégrer avec Sentry ou autre service
            // Sentry.captureException(error, { extra: errorInfo })
          }
        }}
      >
        {children}

        {/* 📊 Devtools en développement */}
        {enableDevtools && (
          <ReactQueryDevtools
            initialIsOpen={false}
          />
        )}
      </ReactQueryErrorBoundary>
    </QueryClientProvider>
  )
}
