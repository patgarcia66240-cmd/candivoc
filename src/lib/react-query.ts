import { QueryClient } from '@tanstack/react-query'

// 🎯 Configuration React Query optimisée pour CandiVoc
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ⏰ Cache intelligent par type de données
      staleTime: 1000 * 60 * 5, // 5 minutes par défaut
      gcTime: 1000 * 60 * 15, // 15 minutes garbage collection

      // 🔄 Retry intelligent avec logique métier
      retry: (failureCount, error) => {
        // Pas de retry pour les erreurs 4xx (client errors)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number

          // Erreurs à ne pas retry
          if (status >= 400 && status < 500) return false

          // Retry limité pour erreurs serveur
          if (status >= 500 && status < 600) return failureCount < 2
        }

        // Erreurs réseau : jusqu'à 3 tentatives
        return failureCount < 3
      },

      // 📊 Background updates optimisés
      refetchOnWindowFocus: false, // Éviter les requêtes inutiles
      refetchOnReconnect: true,   // Synchroniser si reconnexion
      refetchOnMount: true,       // Rafraîchir au montage

      // 🎯 Amélioration UX avec délai exponentiel
      retryDelay: (attemptIndex: number) => {
        // Délai exponentiel : 1s, 2s, 4s, 8s, max 30s
        return Math.min(1000 * 2 ** attemptIndex, 30000)
      },

      // 📱 Optimisations mobiles et performance
      networkMode: 'online',      // Seulement en ligne

      // 📊 Gestion des erreurs
      throwOnError: false,       // Ne pas throw par défaut
    },

    mutations: {
      // 🔄 Configuration mutations optimisée
      retry: 1,                  // Une seule tentative pour mutations
      retryDelay: 1000,         // 1 seconde entre tentatives
      networkMode: 'online',     // Seulement en ligne

      // 🎯 Gestion erreurs mutations
      throwOnError: false,       // Gérer erreurs dans onSettled
    }
  },

  // 🏭 Configuration du client
  logger: process.env.NODE_ENV === 'development' ? console : undefined,
})