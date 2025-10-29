// 🎯 Options de requête et mutation pour React Query

// Options par défaut pour les requêtes
export const queryOptions = {
  default: {
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    networkMode: 'online' as const,
  },

  // Options pour les données critiques (fréquentes)
  critical: {
    retry: 5,
    retryDelay: (attemptIndex: number) => Math.min(500 * 2 ** attemptIndex, 15000),
    staleTime: 1000 * 30, // 30 secondes
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    networkMode: 'online' as const,
  },

  // Options pour les données statiques (rares)
  static: {
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(2000 * 2 ** attemptIndex, 60000),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 heure
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    networkMode: 'online' as const,
  },

  // Options pour les données utilisateur (sensibles)
  user: {
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1500 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    networkMode: 'online' as const,
  }
}

// Options de mutation
export const mutationOptions = {
  // Options par défaut pour les mutations
  default: {
    retry: 1,
    retryDelay: 1000,
    networkMode: 'online' as const,
  },

  // Options pour les mutations critiques
  critical: {
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 15000),
    networkMode: 'online' as const,
  },

  // Options pour les mutations optimistes
  optimistic: {
    retry: 1,
    retryDelay: 1000,
    networkMode: 'online' as const,
  }
}

// Hook utilitaire pour les options de requête
export function useQueryOptions() {
  return queryOptions
}

// Hook utilitaire pour les options de mutation
export function useMutationOptions() {
  return mutationOptions
}
