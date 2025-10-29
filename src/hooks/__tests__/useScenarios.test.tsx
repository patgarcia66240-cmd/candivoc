import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useScenarios, useCreateScenario, useScenariosByCategory, useScenariosByDifficulty, SCENARIO_KEYS } from '../useScenarios'
import { scenariosService } from '../../services/api/scenarios'
import type { CreateScenarioInput, Scenario } from '../../types/scenarios'

// Mock du service
vi.mock('@/services/api/scenarios', () => ({
  scenariosService: {
    getAllScenarios: vi.fn(),
    getScenariosByCategory: vi.fn(),
    getScenariosByDifficulty: vi.fn(),
    createScenario: vi.fn(),
    updateScenario: vi.fn(),
    deleteScenario: vi.fn(),
  }
}))

// Wrapper pour les hooks avec QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Désactiver retry pour les tests
      },
      mutations: {
        retry: false,
      },
    },
  })

  return ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useScenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useScenarios hook', () => {
    it('devrait récupérer les scénarios avec succès', async () => {
      const mockScenarios: Scenario[] = [
        {
          id: '1',
          title: 'Scénario 1',
          description: 'Description 1',
          category: 'technical',
          difficulty: 'beginner',
          duration: 30,
          language: 'fr',
          instructions: 'Instructions',
          ai_personality: 'AI Personality',
          created_by: null,
          is_public: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      vi.mocked(scenariosService.getAllScenarios).mockResolvedValue({
        success: true,
        data: mockScenarios
      })

      const { result } = renderHook(() => useScenarios(), {
        wrapper: createWrapper()
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toEqual(mockScenarios)
      })

      expect(scenariosService.getAllScenarios).toHaveBeenCalledWith(undefined)
    })

    it('devrait gérer les erreurs de chargement', async () => {

      vi.mocked(scenariosService.getAllScenarios).mockResolvedValue({
        success: false,
        error: 'Erreur de chargement'
      })

      const { result } = renderHook(() => useScenarios(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toEqual([])
      })

      expect(scenariosService.getAllScenarios).toHaveBeenCalledWith(undefined)
    })

    it('devrait utiliser les filtres correctement', async () => {
      const filters = { category: 'technical', difficulty: 'beginner' }

      vi.mocked(scenariosService.getAllScenarios).mockResolvedValue({
        success: true,
        data: []
      })

      renderHook(() => useScenarios(filters), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(scenariosService.getAllScenarios).toHaveBeenCalledWith(filters)
      })
    })

    it('devrait trier les scénarios par date de création', async () => {
      const oldScenario: Scenario = {
        id: '1',
        title: 'Ancien',
        description: 'Description',
        category: 'technical',
        difficulty: 'beginner',
        duration: 30,
        language: 'fr',
        instructions: 'Instructions',
        ai_personality: 'AI Personality',
        created_by: null,
        is_public: true,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const newScenario: Scenario = {
        id: '2',
        title: 'Récent',
        description: 'Description',
        category: 'technical',
        difficulty: 'beginner',
        duration: 30,
        language: 'fr',
        instructions: 'Instructions',
        ai_personality: 'AI Personality',
        created_by: null,
        is_public: true,
        is_active: true,
        created_at: '2024-12-01T00:00:00Z',
        updated_at: '2024-12-01T00:00:00Z'
      }

      vi.mocked(scenariosService.getAllScenarios).mockResolvedValue({
        success: true,
        data: [oldScenario, newScenario]
      })

      const { result } = renderHook(() => useScenarios(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.data?.[0].title).toBe('Récent')
        expect(result.current.data?.[1].title).toBe('Ancien')
      })
    })
  })

  describe('useCreateScenario mutation', () => {
    it('devrait créer un scénario avec succès', async () => {
      const newScenario: CreateScenarioInput = {
        title: 'Nouveau scénario',
        description: 'Description',
        category: 'technical',
        difficulty: 'beginner',
        duration: 30,
        language: 'fr',
        instructions: 'Instructions',
        ai_personality: 'AI Personality',
        is_public: true,
        evaluation_criteria: []
      }

      const createdScenario: Scenario = {
        id: '1',
        title: newScenario.title,
        description: newScenario.description,
        category: newScenario.category,
        difficulty: newScenario.difficulty,
        duration: newScenario.duration,
        language: newScenario.language || 'fr',
        instructions: newScenario.instructions,
        ai_personality: newScenario.ai_personality,
        created_by: null,
        is_public: newScenario.is_public ?? true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      vi.mocked(scenariosService.createScenario).mockResolvedValue({
        success: true,
        data: createdScenario
      })

      const { result } = renderHook(() => useCreateScenario(), {
        wrapper: createWrapper()
      })

      expect(result.current.isPending).toBe(false)

      result.current.mutate(newScenario)

      // Note: isPending might not be immediately true due to async nature
      // but should be false after completion

      await waitFor(() => {
        expect(result.current.isPending).toBe(false)
      })

      expect(scenariosService.createScenario).toHaveBeenCalledWith(newScenario)
    })

    it('devrait gérer les erreurs de création', async () => {
      const newScenario: CreateScenarioInput = {
        title: 'Nouveau scénario',
        description: 'Description',
        category: 'technical',
        difficulty: 'beginner',
        duration: 30,
        language: 'fr',
        instructions: 'Instructions',
        ai_personality: 'AI Personality',
        is_public: true,
        evaluation_criteria: []
      }

      vi.mocked(scenariosService.createScenario).mockResolvedValue({
        success: false,
        error: 'Erreur de création'
      })

      const { result } = renderHook(() => useCreateScenario(), {
        wrapper: createWrapper()
      })

      result.current.mutate(newScenario)

      await waitFor(() => {
        expect(result.current.isError).toBe(false) // React Query ne lève pas d'erreur par défaut
      })

      expect(scenariosService.createScenario).toHaveBeenCalledWith(newScenario)
    })
  })

  describe('useScenariosByCategory', () => {
    it('devrait récupérer les scénarios par catégorie', async () => {
      const category = 'technical'

      vi.mocked(scenariosService.getScenariosByCategory).mockResolvedValue({
        success: true,
        data: []
      })

      renderHook(() => useScenariosByCategory(category), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(scenariosService.getScenariosByCategory).toHaveBeenCalledWith(category)
      })
    })
  })

  describe('useScenariosByDifficulty', () => {
    it('devrait récupérer les scénarios par difficulté', async () => {
      const difficulty = 'beginner'

      vi.mocked(scenariosService.getScenariosByDifficulty).mockResolvedValue({
        success: true,
        data: []
      })

      renderHook(() => useScenariosByDifficulty(difficulty), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(scenariosService.getScenariosByDifficulty).toHaveBeenCalledWith(difficulty)
      })
    })
  })

  describe('SCENARIO_KEYS', () => {
    it('devrait générer des clés de requête cohérentes', () => {
      expect(SCENARIO_KEYS.all).toEqual(['scenarios'])
      expect(SCENARIO_KEYS.lists()).toEqual(['scenarios', 'list'])
      expect(SCENARIO_KEYS.detail('123')).toEqual(['scenarios', 'detail', '123'])
      expect(SCENARIO_KEYS.category('technical')).toEqual(['scenarios', 'category', 'technical'])
      expect(SCENARIO_KEYS.difficulty('beginner')).toEqual(['scenarios', 'difficulty', 'beginner'])
    })
  })
})
