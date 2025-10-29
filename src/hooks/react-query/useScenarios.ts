import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { ScenariosService } from '@/services/supabase/scenarios'
import { toast } from '@/contexts/ToastProvider'

// Types
interface Scenario {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  duration: number
  language: string
  created_at: string
  is_public: boolean
}

interface CreateScenarioData {
  title: string
  description: string
  category: string
  difficulty: string
  duration: number
  language: string
  criteria?: Record<string, unknown>[]
  is_public?: boolean
}

// 📊 Cache keys constants
export const SCENARIO_KEYS = {
  all: ['scenarios'] as const,
  lists: () => [...SCENARIO_KEYS.all, 'list'] as const,
  list: (filters: { category?: string; difficulty?: string; is_public?: boolean }) =>
    [...SCENARIO_KEYS.lists(), filters] as const,
  details: () => [...SCENARIO_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SCENARIO_KEYS.details(), id] as const,
  user: () => [...SCENARIO_KEYS.all, 'user'] as const,
}

// 📊 Hook pour récupérer les scénarios avec cache intelligent
export function useScenarios(filters: {
  category?: string;
  difficulty?: string;
  is_public?: boolean
} = {}) {
  return useQuery({
    queryKey: SCENARIO_KEYS.list(filters),
    queryFn: () => ScenariosService.getScenarios(filters.category, filters.difficulty, filters.is_public),

    // ⏰ Cache stratégique par type de filtre
    staleTime: filters.is_public ? 1000 * 60 * 10 : 1000 * 60 * 2, // 10min public, 2min privé
    gcTime: 1000 * 60 * 20, // 20 minutes garbage collection

    // 🔄 Configuration retry optimisée
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error) {
        const status = error.status as number
        if (status >= 400 && status < 500) return false
      }
      return failureCount < 2
    },

    // 📊 Transformation de données
    select: (data) => {
      if (!data) return []
      // Trier par date de création décroissante
      return data.sort((a: Scenario, b: Scenario) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    },

    // 🔄 Background updates limités
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })
}

// 📊 Hook pour scénarios paginés (infinite scroll)
export function useInfiniteScenarios(filters: {
  category?: string;
  difficulty?: string;
  is_public?: boolean;
  limit?: number;
} = {}) {
  const limit = filters.limit || 20

  return useInfiniteQuery({
    queryKey: [...SCENARIO_KEYS.list(filters), 'infinite'],
    queryFn: ({ pageParam = 0 }) =>
      ScenariosService.getScenariosPaginated({
        ...filters,
        offset: pageParam,
        limit
      }),

    // ⏰ Cache plus long pour infinite scroll
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,

    // 🔄 Gestion pagination
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage && lastPage.length < limit) return undefined
      return allPages.length * limit
    },

    // 📊 Transformation
    select: (data) => ({
      pages: data.pages.flat(),
      pageParams: data.pageParams
    })
  })
}

// 📊 Hook pour récupérer un scénario spécifique
export function useScenario(id: string) {
  return useQuery({
    queryKey: SCENARIO_KEYS.detail(id),
    queryFn: () => ScenariosService.getScenarioById(id),

    // ⏰ Cache plus long pour scénarios individuels
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,

    // 🔄 Pas de retry pour 404
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error) {
        const status = error.status as number
        if (status === 404) return false
      }
      return failureCount < 2
    },

    // 📊 Activation conditionnelle
    enabled: !!id
  })
}

// 🔄 Hook pour créer un scénario
export function useCreateScenario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateScenarioData) => ScenariosService.createScenario(data),

    // 🔄 Optimistic updates
    onMutate: async (newScenario) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: SCENARIO_KEYS.lists() })

      // Snapshot précédent
      const previousScenarios = queryClient.getQueryData(SCENARIO_KEYS.lists())

      // Optimistic update
      queryClient.setQueryData(SCENARIO_KEYS.lists(), (old: Scenario[] | undefined) =>
        old ? [newScenario, ...old] : [newScenario]
      )

      return { previousScenarios }
    },

    // ✅ Succès
    onSuccess: (newScenario) => {
      toast.success('Scénario créé avec succès!')

      // Invalider les requêtes pertinentes
      queryClient.invalidateQueries({ queryKey: SCENARIO_KEYS.lists() })

      // Ajouter au cache
      queryClient.setQueryData(SCENARIO_KEYS.detail(newScenario.id), newScenario)
    },

    // ❌ Erreur
    onError: (error, variables, context) => {
      toast.error(`Erreur création scénario: ${error.message}`)

      // Rollback
      if (context?.previousScenarios) {
        queryClient.setQueryData(SCENARIO_KEYS.lists(), context.previousScenarios)
      }
    },

    // 🔄 Settlement
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SCENARIO_KEYS.lists() })
    }
  })
}

// 🔄 Hook pour mettre à jour un scénario
export function useUpdateScenario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Scenario> }) =>
      ScenariosService.updateScenario(id, data),

    // 🔄 Optimistic updates
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: SCENARIO_KEYS.detail(id) })

      const previousScenario = queryClient.getQueryData(SCENARIO_KEYS.detail(id))

      // Mise à jour optimiste
      queryClient.setQueryData(SCENARIO_KEYS.detail(id), (old: Scenario | undefined) =>
        old ? { ...old, ...data } : undefined
      )

      return { previousScenario }
    },

    onSuccess: () => {
      toast.success('Scénario mis à jour!')
      queryClient.invalidateQueries({ queryKey: SCENARIO_KEYS.lists() })
    },

    onError: (error, variables, context) => {
      toast.error(`Erreur mise à jour: ${error.message}`)
      if (context?.previousScenario) {
        queryClient.setQueryData(SCENARIO_KEYS.detail(variables.id), context.previousScenario)
      }
    },

    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: SCENARIO_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: SCENARIO_KEYS.lists() })
    }
  })
}

// 🔄 Hook pour supprimer un scénario
export function useDeleteScenario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ScenariosService.deleteScenario(id),

    // 🔄 Optimistic updates
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: SCENARIO_KEYS.lists() })

      const previousScenarios = queryClient.getQueryData(SCENARIO_KEYS.lists())

      // Suppression optimiste
      queryClient.setQueryData(SCENARIO_KEYS.lists(), (old: Scenario[] | undefined) =>
        old ? old.filter(scenario => scenario.id !== id) : []
      )

      return { previousScenarios }
    },

    onSuccess: () => {
      toast.success('Scénario supprimé!')
    },

    onError: (error, id, context) => {
      toast.error(`Erreur suppression: ${error.message}`)
      if (context?.previousScenarios) {
        queryClient.setQueryData(SCENARIO_KEYS.lists(), context.previousScenarios)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SCENARIO_KEYS.lists() })
    }
  })
}