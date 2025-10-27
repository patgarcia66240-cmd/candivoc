import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { scenariosService } from '@/services/api/scenarios'
import type {
  Scenario,
  ScenarioWithCriteria,
  CreateScenarioInput,
  UpdateScenarioInput,
  ScenarioCategory,
  ScenarioDifficulty
} from '@/types/scenarios'

// 📊 Cache keys constants
export const SCENARIO_KEYS = {
  all: ['scenarios'] as const,
  lists: () => [...SCENARIO_KEYS.all, 'list'] as const,
  list: (filters: { category?: string; difficulty?: string; is_public?: boolean }) =>
    [...SCENARIO_KEYS.lists(), filters] as const,
  details: () => [...SCENARIO_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SCENARIO_KEYS.details(), id] as const,
  category: (category: string) => [...SCENARIO_KEYS.all, 'category', category] as const,
  difficulty: (difficulty: string) => [...SCENARIO_KEYS.all, 'difficulty', difficulty] as const,
}

// 📊 Récupérer tous les scénarios avec filtres
export function useScenarios(filters?: {
  category?: string;
  difficulty?: string;
  is_public?: boolean
}) {
  return useQuery({
    queryKey: SCENARIO_KEYS.list(filters || {}),
    queryFn: () => scenariosService.getAllScenarios(filters),
    staleTime: 1000 * 60 * 10, // 10 minutes
    select: (response) => response.data?.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) || [],
    enabled: true
  })
}

// 📊 Récupérer un scénario par ID
export function useScenario(id: string) {
  return useQuery({
    queryKey: SCENARIO_KEYS.detail(id),
    queryFn: () => scenariosService.getScenarioById(id),
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!id,
    select: (response) => response.data
  })
}

// 📊 Récupérer les scénarios par catégorie
export function useScenariosByCategory(category: string) {
  return useQuery({
    queryKey: SCENARIO_KEYS.category(category),
    queryFn: () => scenariosService.getScenariosByCategory(category),
    staleTime: 1000 * 60 * 15, // 15 minutes
    select: (response) => response.data || []
  })
}

// 📊 Récupérer les scénarios par difficulté
export function useScenariosByDifficulty(difficulty: string) {
  return useQuery({
    queryKey: SCENARIO_KEYS.difficulty(difficulty),
    queryFn: () => scenariosService.getScenariosByDifficulty(difficulty),
    staleTime: 1000 * 60 * 15, // 15 minutes
    select: (response) => response.data || []
  })
}

// 📊 Pagination infinie pour les scénarios
export function useScenariosInfinite(filters?: {
  category?: string;
  difficulty?: string;
  is_public?: boolean
}) {
  return useInfiniteQuery({
    queryKey: SCENARIO_KEYS.list(filters || {}),
    queryFn: ({ pageParam = 0 }) =>
      scenariosService.getAllScenarios({
        ...filters,
        limit: 20,
        offset: pageParam * 20
      }),
    staleTime: 1000 * 60 * 10, // 10 minutes
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data && lastPage.data.length >= 20) {
        return allPages.length
      }
      return undefined
    },
    select: (data) => ({
      pages: data.pages.map(page => page.data || []),
      pageParams: data.pageParams
    })
  })
}

// 🔄 Mutation créer un scénario
export function useCreateScenario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (scenario: CreateScenarioInput) => scenariosService.createScenario(scenario),
    onSuccess: (response) => {
      // 🔄 Invalider tous les caches de scénarios
      queryClient.invalidateQueries({ queryKey: SCENARIO_KEYS.all })

      // 🎯 Ajouter le nouveau scénario au cache
      if (response.data) {
        queryClient.setQueryData(
          SCENARIO_KEYS.detail(response.data.id),
          response
        )
      }
    },
    onError: (error) => {
      console.error('Erreur création scénario:', error)
    }
  })
}

// 🔄 Mutation mettre à jour un scénario
export function useUpdateScenario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, scenario }: { id: string; scenario: UpdateScenarioInput }) =>
      scenariosService.updateScenario(id, scenario),
    onSuccess: (response, { id }) => {
      // 🔄 Mettre à jour le cache du scénario spécifique
      if (response.data) {
        queryClient.setQueryData(
          SCENARIO_KEYS.detail(id),
          response
        )
      }

      // 🔄 Invalider les listes
      queryClient.invalidateQueries({ queryKey: SCENARIO_KEYS.lists() })
    },
    onError: (error) => {
      console.error('Erreur mise à jour scénario:', error)
    }
  })
}

// 🔄 Mutation supprimer un scénario
export function useDeleteScenario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => scenariosService.deleteScenario(id),
    onSuccess: (_, id) => {
      // 🔄 Supprimer du cache
      queryClient.removeQueries({ queryKey: SCENARIO_KEYS.detail(id) })

      // 🔄 Invalider les listes
      queryClient.invalidateQueries({ queryKey: SCENARIO_KEYS.lists() })
    },
    onError: (error) => {
      console.error('Erreur suppression scénario:', error)
    }
  })
}

// 🔄 Précharger les scénarios populaires
export function usePrefetchScenarios() {
  const queryClient = useQueryClient()

  return () => {
    // Précharger les scénarios publics
    queryClient.prefetchQuery({
      queryKey: SCENARIO_KEYS.list({ is_public: true }),
      queryFn: () => scenariosService.getAllScenarios({ is_public: true }),
      staleTime: 1000 * 60 * 5
    })

    // Précharger par catégories populaires
    const popularCategories = ['technical', 'behavioral', 'leadership']
    popularCategories.forEach(category => {
      queryClient.prefetchQuery({
        queryKey: SCENARIO_KEYS.category(category),
        queryFn: () => scenariosService.getScenariosByCategory(category),
        staleTime: 1000 * 60 * 5
      })
    })
  }
}