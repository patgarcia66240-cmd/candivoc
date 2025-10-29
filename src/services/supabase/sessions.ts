import { supabase } from './client'

// Types pour les sessions utilisateur
export interface Session {
  id: string
  scenario_id: string
  user_id: string
  status: 'active' | 'completed' | 'paused' | 'abandoned'
  started_at: string
  completed_at?: string
  duration?: number
  score?: number
  feedback?: Record<string, unknown>
  audio_url?: string
  transcription?: string
  ai_analysis?: Record<string, unknown>
}

export interface CreateSessionData {
  scenario_id: string
  user_id?: string
  settings?: {
    audio_enabled?: boolean
    transcription_enabled?: boolean
    real_time_feedback?: boolean
    difficulty_adjustment?: boolean
  }
}

export interface UpdateSessionData {
  status?: Session['status']
  duration?: number
  score?: number
  feedback?: Record<string, unknown>
  audio_url?: string
  transcription?: string
  ai_analysis?: Record<string, unknown>
}

export interface SessionFilters {
  user_id?: string
  status?: Session['status']
  limit?: number
}

export class SessionsService {
  // Récupérer les sessions d'un utilisateur
  static async getUserSessions(userId: string, options: {
    status?: Session['status']
    limit?: number
  } = {}): Promise<Session[]> {
    let query = supabase!
      .from('sessions')
      .select('*')
      .eq('user_id', userId)

    if (options.status) {
      query = query.eq('status', options.status)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query
      .order('started_at', { ascending: false })

    if (error) throw error
    return (data as Session[]) || []
  }

  // Récupérer une session par son ID
  static async getSessionById(id: string): Promise<Session> {
    const { data, error } = await supabase!
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Session
  }

  // Récupérer la session active d'un utilisateur
  static async getActiveSession(userId: string): Promise<Session | null> {
    const { data, error } = await supabase!
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data as Session | null
  }

  // Créer une nouvelle session
  static async createSession(data: CreateSessionData): Promise<Session> {
    const sessionData = {
      scenario_id: data.scenario_id,
      user_id: data.user_id,
      status: 'active',
      started_at: new Date().toISOString(),
      settings: data.settings
    }

    const { data: session, error } = await supabase!
      .from('sessions')
      .insert(sessionData)
      .select()
      .single()

    if (error) throw error
    return session as Session
  }

  // Mettre à jour une session
  static async updateSession(id: string, updates: UpdateSessionData): Promise<Session> {
    const { data, error } = await supabase!
      .from('sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Session
  }

  // Terminer une session
  static async endSession(id: string, data: {
    duration: number
    score?: number
    feedback?: Record<string, unknown>
  }): Promise<Session> {
    const { data: session, error } = await supabase!
      .from('sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        duration: data.duration,
        score: data.score,
        feedback: data.feedback,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return session as Session
  }

  // Mettre à jour la transcription
  static async updateTranscript(id: string, transcription: string): Promise<void> {
    const { error } = await supabase!
      .from('sessions')
      .update({
        transcription,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error
  }

  // Générer l'évaluation IA (placeholder - à implémenter)
  static async generateEvaluation(sessionId: string): Promise<Record<string, unknown>> {
    // Récupérer la session
    const session = await this.getSessionById(sessionId)

    // Simulation d'une évaluation IA
    const evaluation = {
      id: `eval_${Date.now()}`,
      session_id: sessionId,
      overall_score: session.score || 0,
      strengths: ['Communication claire'],
      areas_for_improvement: ['Rythme de parole'],
      detailed_feedback: 'Bonne performance générale',
      generated_at: new Date().toISOString()
    }

    // Mettre à jour la session avec l'évaluation
    await this.updateSession(sessionId, {
      ai_analysis: evaluation
    })

    return evaluation
  }

  // Récupérer les statistiques des sessions
  static async getSessionStats(userId: string, options: {
    period?: 'week' | 'month' | 'year'
  } = {}): Promise<{
    totalSessions: number
    averageScore: number
    totalDuration: number
    completedSessions: number
    averageDuration: number
  }> {
    // Calculer la date de début basée sur la période
    const now = new Date()
    let startDate: Date

    switch (options.period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Par défaut 30 jours
    }

    const { data: sessions, error } = await supabase!
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('started_at', startDate.toISOString())

    if (error) throw error

    // Calculer les statistiques
    const stats = {
      totalSessions: sessions?.length || 0,
      completedSessions: sessions?.filter(s => s.status === 'completed').length || 0,
      totalDuration: sessions?.reduce((sum, s) => sum + (s.duration || 0), 0) || 0,
      averageScore: sessions?.length
        ? (sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length)
        : 0,
      averageDuration: sessions?.filter(s => s.status === 'completed').length
        ? (sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.filter(s => s.status === 'completed').length)
        : 0
    }

    return stats
  }
}
