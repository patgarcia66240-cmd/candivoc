import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionsService, type CreateSessionData } from '@/services/api/sessions'

// Types locaux
interface Session {
  id: string
  userId: string
  scenarioId: string
  status: 'pending' | 'active' | 'completed' | 'abandoned'
  startTime: Date
  endTime?: Date
  duration?: number
  audioRecordingUrl?: string
  transcript: Message[]
  evaluation?: SessionEvaluation
  createdAt: Date
}

interface Message {
  id: string
  sessionId: string
  content: string
  speaker: 'user' | 'ai'
  timestamp: Date
  audioUrl?: string
  metadata?: {
    sentiment?: number
    confidence?: number
    duration?: number
  }
}

interface SessionEvaluation {
  id: string
  sessionId: string
  overallScore: number
  criteriaScores: CriteriaScore[]
  strengths: string[]
  improvements: string[]
  suggestions: string[]
  feedback: string
  createdAt: Date
}

interface CriteriaScore {
  criteriaId: string
  score: number
  details: string
}

// 📊 Cache keys constants
export const SESSION_KEYS = {
  all: ['sessions'] as const,
  lists: () => [...SESSION_KEYS.all, 'list'] as const,
  list: (userId: string) => [...SESSION_KEYS.lists(), userId] as const,
  details: () => [...SESSION_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SESSION_KEYS.details(), id] as const,
  evaluations: () => [...SESSION_KEYS.all, 'evaluation'] as const,
  evaluation: (sessionId: string) => [...SESSION_KEYS.evaluations(), sessionId] as const,
}

// 📊 Récupérer toutes les sessions d'un utilisateur
export function useUserSessions(userId: string) {
  return useQuery({
    queryKey: SESSION_KEYS.list(userId),
    queryFn: () => sessionsService.getUserSessions(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes - les sessions changent souvent
    select: (response) => response.data?.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ) || [],
    enabled: !!userId
  })
}

// 📊 Récupérer une session par ID
export function useSession(id: string) {
  return useQuery({
    queryKey: SESSION_KEYS.detail(id),
    queryFn: () => sessionsService.getSessionById(id),
    staleTime: 1000 * 60 * 2, // 2 minutes - les sessions actives changent fréquemment
    enabled: !!id,
    select: (response) => response.data,
    // 🔄 Revalidation automatique pour les sessions actives
    refetchInterval: (response) => {
      return response.data?.status === 'active' ? 10000 : false // 10 secondes si active
    }
  })
}

// 📊 Récupérer l'évaluation d'une session
export function useSessionEvaluation(sessionId: string) {
  return useQuery({
    queryKey: SESSION_KEYS.evaluation(sessionId),
    queryFn: () => sessionsService.getSessionEvaluation(sessionId),
    staleTime: 1000 * 60 * 60, // 1 heure - les évaluations ne changent pas
    enabled: !!sessionId,
    select: (response) => response.data
  })
}

// 🔄 Mutation créer une session
export function useCreateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSessionData) => sessionsService.createSession(data),
    onSuccess: (response, variables) => {
      // 🔄 Invalider la liste des sessions de l'utilisateur
      queryClient.invalidateQueries({
        queryKey: SESSION_KEYS.list(variables.userId)
      })

      // 🎯 Ajouter la nouvelle session au cache
      if (response.data) {
        queryClient.setQueryData(
          SESSION_KEYS.detail(response.data.id),
          response
        )
      }
    },
    onError: (error) => {
      console.error('Erreur création session:', error)
    }
  })
}

// 🔄 Mutation mettre à jour une session
export function useUpdateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, session }: { id: string; session: Partial<Session> }) =>
      sessionsService.updateSession(id, session),
    onSuccess: (response, { id }) => {
      // 🔄 Mettre à jour le cache de la session spécifique
      if (response.data) {
        queryClient.setQueryData(
          SESSION_KEYS.detail(id),
          response
        )
      }
    },
    onError: (error) => {
      console.error('Erreur mise à jour session:', error)
    }
  })
}

// 🔄 Mutation terminer une session
export function useEndSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => sessionsService.endSession(id),
    onSuccess: (response, id) => {
      // 🔄 Mettre à jour le cache de la session
      if (response.data) {
        queryClient.setQueryData(
          SESSION_KEYS.detail(id),
          response
        )
      }

      // 🔄 Invalider les listes de sessions
      queryClient.invalidateQueries({ queryKey: SESSION_KEYS.lists() })
    },
    onError: (error) => {
      console.error('Erreur fin session:', error)
    }
  })
}

// 🔄 Mutation générer une évaluation
export function useGenerateEvaluation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) => sessionsService.generateSessionEvaluation(sessionId),
    onSuccess: (response, sessionId) => {
      // 🔄 Mettre à jour le cache de l'évaluation
      if (response.data) {
        queryClient.setQueryData(
          SESSION_KEYS.evaluation(sessionId),
          response
        )
      }
    },
    onError: (error) => {
      console.error('Erreur génération évaluation:', error)
    }
  })
}

// 🔄 Précharger les sessions récentes
export function usePrefetchSessions() {
  const queryClient = useQueryClient()

  return (userId: string) => {
    // Précharger les sessions récentes de l'utilisateur
    queryClient.prefetchQuery({
      queryKey: SESSION_KEYS.list(userId),
      queryFn: () => sessionsService.getUserSessions(userId),
      staleTime: 1000 * 60 * 2
    })
  }
}