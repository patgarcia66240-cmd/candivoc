// 📱 Hook pour les scénarios avec support hors ligne
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { offlineSyncService } from '@/services/offline/offlineSyncService'
import type { Scenario } from '@/types/scenarios'

interface UseOfflineScenariosOptions {
  category?: string
  difficulty?: string
  enableOffline?: boolean
}

// 🔄 Clés de requête pour React Query
export const OFFLINE_SCENARIOS_KEYS = {
  all: ['offline-scenarios'] as const,
  lists: () => [...OFFLINE_SCENARIOS_KEYS.all, 'list'] as const,
  list: (filters: { category?: string; difficulty?: string }) =>
    [...OFFLINE_SCENARIOS_KEYS.lists(), filters] as const,
  details: () => [...OFFLINE_SCENARIOS_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...OFFLINE_SCENARIOS_KEYS.details(), id] as const,
  category: (category: string) => [...OFFLINE_SCENARIOS_KEYS.all, 'category', category] as const,
  difficulty: (difficulty: string) => [...OFFLINE_SCENARIOS_KEYS.all, 'difficulty', difficulty] as const,
}

// 📝 Hook principal pour les scénarios hors ligne
export function useOfflineScenarios(options: UseOfflineScenariosOptions = {}) {
  const { category, difficulty, enableOffline = true } = options
  const queryClient = useQueryClient()

  // 🔄 Récupérer les scénarios (priorité: online → offline)
  const {
    data: onlineScenarios,
    isLoading: isLoadingOnline,
    error: onlineError,
    refetch: refetchOnline
  } = useQuery({
    queryKey: OFFLINE_SCENARIOS_KEYS.list({ category, difficulty }),
    queryFn: async () => {
      // Cette fonction serait remplacée par le vrai appel API
      // Pour l'instant, nous simulons un appel API
      const response = await fetch('/api/scenarios')
      if (!response.ok) throw new Error('Failed to fetch scenarios')
      return response.json()
    },
    enabled: navigator.onLine, // Uniquement si en ligne
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error) => {
      // Ne pas réessayer les erreurs 404/401
      if (error?.status === 404 || error?.status === 401) return false
      return failureCount < 3
    }
  })

  // 📱 Récupérer les scénarios hors ligne
  const {
    data: offlineScenarios,
    isLoading: isLoadingOffline
  } = useQuery({
    queryKey: ['offline-scenarios-local', { category, difficulty }],
    queryFn: () => offlineSyncService.getOfflineScenarios({ category, difficulty }),
    enabled: enableOffline,
    staleTime: 0, // Toujours frais pour les données locales
    gcTime: Infinity // Ne jamais jeter les données locales
  })

  // 🎯 Déterminer les données à utiliser
  const scenarios = navigator.onLine && onlineScenarios ? onlineScenarios : offlineScenarios
  const isLoading = navigator.onLine ? isLoadingOnline : isLoadingOffline
  const error = navigator.onLine ? onlineError : null

  // 🔄 Mutation pour sauvegarder un scénario
  const saveScenarioMutation = useMutation({
    mutationFn: async (scenario: Partial<Scenario>) => {
      // Si en ligne, sauvegarder sur le serveur
      if (navigator.onLine) {
        const response = await fetch('/api/scenarios', {
          method: scenario.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scenario)
        })
        if (!response.ok) throw new Error('Failed to save scenario')
        return response.json()
      }

      // Si hors ligne, sauvegarder localement
      await offlineSyncService.saveScenarioOffline(scenario)
      return scenario
    },
    onSuccess: () => {
      // Invalider le cache
      queryClient.invalidateQueries({ queryKey: OFFLINE_SCENARIOS_KEYS.lists() })

      // Si on était hors ligne, synchroniser quand on revient en ligne
      if (!navigator.onLine) {
        window.addEventListener('online', () => {
          offlineSyncService.syncWithServer()
        }, { once: true })
      }
    },
    onError: (error) => {
      console.error('❌ Erreur lors de la sauvegarde du scénario:', error)
    }
  })

  // 🔄 Mutation pour supprimer un scénario
  const deleteScenarioMutation = useMutation({
    mutationFn: async (id: string) => {
      if (navigator.onLine) {
        const response = await fetch(`/api/scenarios/${id}`, {
          method: 'DELETE'
        })
        if (!response.ok) throw new Error('Failed to delete scenario')
        return id
      }

      // Hors ligne: marquer pour suppression différée
      // Note: implémenter la logique de suppression différée
      throw new Error('Suppression hors ligne non encore implémentée')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OFFLINE_SCENARIOS_KEYS.lists() })
    }
  })

  // 🔄 Fonction pour forcer la synchronisation
  const forceSync = async () => {
    try {
      await offlineSyncService.forceSync()
      // Rafraîchir les données
      await refetchOnline()
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation forcée:', error)
    }
  }

  // 📊 Obtenir les statistiques hors ligne
  const offlineStats = useQuery({
    queryKey: ['offline-stats'],
    queryFn: () => offlineSyncService.getOfflineStats(),
    enabled: enableOffline,
    staleTime: 0,
    refetchInterval: 30000 // Rafraîchir toutes les 30 secondes
  })

  return {
    // Données
    scenarios: scenarios || [],
    isLoading,
    error,

    // Métadonnées
    isOnline: navigator.onLine,
    offlineStats: offlineStats.data,

    // Actions
    saveScenario: saveScenarioMutation.mutate,
    saveScenarioAsync: saveScenarioMutation.mutateAsync,
    deleteScenario: deleteScenarioMutation.mutate,
    deleteScenarioAsync: deleteScenarioMutation.mutateAsync,
    forceSync,
    refetch: refetchOnline,

    // États des mutations
    isSaving: saveScenarioMutation.isPending,
    isDeleting: deleteScenarioMutation.isPending,
    saveError: saveScenarioMutation.error,
    deleteError: deleteScenarioMutation.error
  }
}

// 📝 Hook pour un scénario spécifique avec support hors ligne
export function useOfflineScenario(id: string, enableOffline = true) {
  const queryClient = useQueryClient()

  // 🔄 Récupérer un scénario spécifique
  const {
    data: scenario,
    isLoading,
    error
  } = useQuery({
    queryKey: OFFLINE_SCENARIOS_KEYS.detail(id),
    queryFn: async () => {
      // D'abord essayer hors ligne
      if (enableOffline) {
        const offlineScenarios = await offlineSyncService.getOfflineScenarios()
        const offlineScenario = offlineScenarios.find(s => s.id === id)
        if (offlineScenario) return offlineScenario
      }

      // Si hors ligne et pas trouvé localement
      if (!navigator.onLine) {
        throw new Error('Scénario non disponible hors ligne')
      }

      // Si en ligne, essayer l'API
      const response = await fetch(`/api/scenarios/${id}`)
      if (!response.ok) throw new Error('Scenario not found')
      return response.json()
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10 // 10 minutes
  })

  // 🔄 Mutation pour mettre à jour le scénario
  const updateScenarioMutation = useMutation({
    mutationFn: async (updates: Partial<Scenario>) => {
      const updatedScenario = { ...scenario, ...updates }

      if (navigator.onLine) {
        const response = await fetch(`/api/scenarios/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedScenario)
        })
        if (!response.ok) throw new Error('Failed to update scenario')
        return response.json()
      }

      // Hors ligne: sauvegarder localement
      await offlineSyncService.saveScenarioOffline(updatedScenario)
      return updatedScenario
    },
    onSuccess: (data) => {
      queryClient.setQueryData(OFFLINE_SCENARIOS_KEYS.detail(id), data)
      queryClient.invalidateQueries({ queryKey: OFFLINE_SCENARIOS_KEYS.lists() })
    }
  })

  return {
    scenario,
    isLoading,
    error,
    updateScenario: updateScenarioMutation.mutate,
    updateScenarioAsync: updateScenarioMutation.mutateAsync,
    isUpdating: updateScenarioMutation.isPending,
    updateError: updateScenarioMutation.error
  }
}

// 📊 Hook pour les statistiques de synchronisation
export function useSyncStats() {
  const {
    data: stats,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['sync-stats'],
    queryFn: () => offlineSyncService.getOfflineStats(),
    staleTime: 0,
    refetchInterval: 15000 // Rafraîchir toutes les 15 secondes
  })

  const {
    mutate: forceSync,
    isPending: isSyncing
  } = useMutation({
    mutationFn: () => offlineSyncService.forceSync(),
    onSuccess: () => {
      refetch()
    }
  })

  return {
    stats,
    isLoading,
    error,
    forceSync,
    isSyncing,
    refetch
  }
}