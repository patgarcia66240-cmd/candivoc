import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ⏰ Cache de 5 minutes par défaut
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,

      // 🔄 Retry intelligent
      retry: (failureCount, error) => {
        // Pas de retry pour les erreurs 4xx
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number
          if (status >= 400 && status < 500) return false
        }
        return failureCount < 3
      },

      // 📊 Background updates
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,

      // 🎯 Amélioration UX
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // 📱 Optimisations mobiles
      networkMode: 'online'
    },
    mutations: {
      // 🔄 Retry pour mutations
      retry: 1,
      networkMode: 'online'
    }
  },

  // 🔧 Configuration avancée
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    }
  }
})