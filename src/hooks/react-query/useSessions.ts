import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SessionsService, Session, CreateSessionData, UpdateSessionData } from '@/services/supabase/sessions'
import { useToastContext } from '@/contexts/useToastContext'

// 📊 Cache keys constants
export const SESSION_KEYS = {
  all: ['sessions'] as const,
  lists: () => [...SESSION_KEYS.all, 'list'] as const,
  list: (filters: { user_id?: string; status?: string; limit?: number }) =>
    [...SESSION_KEYS.lists(), filters] as const,
  details: () => [...SESSION_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SESSION_KEYS.details(), id] as const,
  active: () => [...SESSION_KEYS.all, 'active'] as const,
  user: (userId: string) => [...SESSION_KEYS.all, 'user', userId] as const,
}

// 📊 Hook pour récupérer les sessions utilisateur
export function useUserSessions(userId: string, options: {
  status?: Session['status'];
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: SESSION_KEYS.list({ user_id: userId, ...options }),
    queryFn: () => SessionsService.getUserSessions(userId, options),

    // ⏰ Cache court pour les sessions (changent fréquemment)
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes

    // 🔄 Retry limité pour les sessions
    retry: 1,

    // 📊 Tri par date décroissante
    select: (data) => {
      if (!data) return []
      return data.sort((a: Session, b: Session) =>
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      )
    },

    // 🔄 Pas de refetch automatique (sessions sensibles)
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,

    // 📊 Activation conditionnelle
    enabled: !!userId
  })
}

// 📊 Hook pour récupérer une session spécifique
export function useSession(id: string) {
  return useQuery({
    queryKey: SESSION_KEYS.detail(id),
    queryFn: () => SessionsService.getSessionById(id),

    // ⏰ Cache très court pour les sessions actives
    staleTime: 1000 * 30, // 30 secondes
    gcTime: 1000 * 60 * 2, // 2 minutes

    // 🔄 Pas de retry pour les sessions terminées
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error) {
        const status = error.status as number
        if (status >= 400) return false
      }
      return failureCount < 1
    },

    // 🔄 Rafraîchissement automatique pour sessions actives
    refetchInterval: (query) => {
      // Rafraîchir toutes les 30s pour les sessions actives
      if (query.state.data?.status === 'active') return 1000 * 30
      return false // Pas de refetch pour les autres
    },

    // 📊 Activation conditionnelle
    enabled: !!id
  })
}

// 📊 Hook pour récupérer la session active
export function useActiveSession(userId?: string) {
  return useQuery({
    queryKey: [...SESSION_KEYS.active(), userId],
    queryFn: () => userId ? SessionsService.getActiveSession(userId) : null,

    // ⏰ Cache très très court pour la session active
    staleTime: 1000 * 10, // 10 secondes
    gcTime: 1000 * 60, // 1 minute

    // 🔄 Rafraîchissement très fréquent
    refetchInterval: 5000, // 5 secondes

    // 📊 Activation conditionnelle
    enabled: !!userId
  })
}

// 🔄 Hook pour créer une session
export function useCreateSession() {
  const queryClient = useQueryClient()
  const toast = useToastContext()

  return useMutation({
    mutationFn: (data: CreateSessionData) => SessionsService.createSession(data),

    // 🔄 Optimistic updates limités (sessions critiques)
    onMutate: async () => {
      // Invalider les requêtes pertinentes
      queryClient.invalidateQueries({ queryKey: SESSION_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: SESSION_KEYS.active() })
    },

    onSuccess: (newSession: Session) => {
      toast.success('Session démarrée!')

      // Ajouter au cache
      queryClient.setQueryData(SESSION_KEYS.detail(newSession.id), newSession)
      queryClient.setQueryData([...SESSION_KEYS.active(), newSession.user_id], newSession)

      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: SESSION_KEYS.lists() })
    },

    onError: (error) => {
      toast.error(`Erreur démarrage session: ${(error as Error).message}`)
    }
  })
}

// 🔄 Hook pour mettre à jour une session
export function useUpdateSession() {
  const queryClient = useQueryClient()
  const toast = useToastContext()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSessionData }) =>
      SessionsService.updateSession(id, data),

    // 🔄 Optimistic updates pour les sessions
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: SESSION_KEYS.detail(id) })

      const previousSession = queryClient.getQueryData(SESSION_KEYS.detail(id))

      // Mise à jour optimiste
      queryClient.setQueryData(SESSION_KEYS.detail(id), (old: Session | undefined) =>
        old ? { ...old, ...data } : undefined
      )

      return { previousSession }
    },

    onSuccess: (_, { id }) => {
      // Invalider pour forcer le rafraîchissement
      queryClient.invalidateQueries({ queryKey: SESSION_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: SESSION_KEYS.lists() })
    },

    onError: (error, { id }, context) => {
      toast.error(`Erreur mise à jour session: ${error.message}`)
      if (context?.previousSession) {
        queryClient.setQueryData(SESSION_KEYS.detail(id), context.previousSession)
      }
    }
  })
}

// 🔄 Hook pour terminer une session
export function useEndSession() {
  const queryClient = useQueryClient()
  const toast = useToastContext()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { duration: number; score?: number; feedback?: Record<string, unknown> } }) =>
      SessionsService.endSession(id, data),

    onSuccess: () => {
      toast.success('Session terminée!')

      // Invalider tout le cache de sessions
      queryClient.invalidateQueries({ queryKey: SESSION_KEYS.all })
      queryClient.invalidateQueries({ queryKey: SESSION_KEYS.active() })
    },

    onError: (error) => {
      toast.error(`Erreur fin de session: ${(error as Error).message}`)
    }
  })
}

// 🔄 Hook pour mettre à jour le transcript en temps réel
export function useUpdateTranscript() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, transcription }: { id: string; transcription: string }) =>
      SessionsService.updateTranscript(id, transcription),

    // 🔄 Pas de toast pour les transcripts (trop fréquents)
    onSuccess: (_result, { id, transcription }) => {
      // Mise à jour optimiste
      queryClient.setQueryData(SESSION_KEYS.detail(id), (old: Session | undefined) =>
        old ? { ...old, transcription } : undefined
      )
    },

    // 🔄 Pas de retry pour les transcripts
    retry: 0
  })
}

// 🔄 Hook pour générer l'évaluation IA
export function useGenerateEvaluation() {
  const queryClient = useQueryClient()
  const toast = useToastContext()

  return useMutation({
    mutationFn: (sessionId: string) => SessionsService.generateEvaluation(sessionId),

    onSuccess: (evaluation: Record<string, unknown>, sessionId: string) => {
      toast.success('Évaluation générée!')

      // Mettre à jour la session avec l'évaluation
      queryClient.setQueryData(SESSION_KEYS.detail(sessionId), (old: Session | undefined) =>
        old ? { ...old, ai_analysis: evaluation } : undefined
      )
    },

    onError: (error) => {
      toast.error(`Erreur génération évaluation: ${(error as Error).message}`)
    }
  })
}

// 📊 Hook pour les statistiques des sessions
export function useSessionStats(userId: string, options: {
  period?: 'week' | 'month' | 'year';
} = {}) {
  return useQuery({
    queryKey: [...SESSION_KEYS.user(userId), 'stats', options],
    queryFn: () => SessionsService.getSessionStats(userId, options),

    // ⏰ Cache plus long pour les stats (changent moins souvent)
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes

    // 🔄 Pas de refetch automatique
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,

    // 📊 Activation conditionnelle
    enabled: !!userId
  })
}
