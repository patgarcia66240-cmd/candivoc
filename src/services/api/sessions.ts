import { apiClient } from './client';

// Interfaces locales pour éviter les problèmes d'export
interface Session {
  id: string;
  userId: string;
  scenarioId: string;
  status: 'pending' | 'active' | 'completed' | 'abandoned';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  audioRecordingUrl?: string;
  transcript: Message[];
  evaluation?: SessionEvaluation;
  createdAt: Date;
}

interface Message {
  id: string;
  sessionId: string;
  content: string;
  speaker: 'user' | 'ai';
  timestamp: Date;
  audioUrl?: string;
  metadata?: {
    sentiment?: number;
    confidence?: number;
    duration?: number;
  };
}

interface SessionEvaluation {
  id: string;
  sessionId: string;
  overallScore: number;
  criteriaScores: CriteriaScore[];
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  feedback: string;
  createdAt: Date;
}

interface CriteriaScore {
  criteriaId: string;
  score: number;
  details: string;
}

interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateSessionData {
  scenarioId: string;
  userId: string;
}

export const sessionsService = {
  async createSession(data: CreateSessionData): Promise<APIResponse<Session>> {
    return apiClient.post<Session>('/sessions', data);
  },

  async getSessionById(id: string): Promise<APIResponse<Session>> {
    return apiClient.get<Session>(`/sessions/${id}`);
  },

  async getUserSessions(userId: string): Promise<APIResponse<Session[]>> {
    return apiClient.get<Session[]>(`/sessions/user/${userId}`);
  },

  async updateSession(id: string, session: Partial<Session>): Promise<APIResponse<Session>> {
    return apiClient.put<Session>(`/sessions/${id}`, session);
  },

  async endSession(id: string): Promise<APIResponse<Session>> {
    return apiClient.post<Session>(`/sessions/${id}/end`);
  },

  async getSessionEvaluation(sessionId: string): Promise<APIResponse<SessionEvaluation>> {
    return apiClient.get<SessionEvaluation>(`/sessions/${sessionId}/evaluation`);
  },

  async generateSessionEvaluation(sessionId: string): Promise<APIResponse<SessionEvaluation>> {
    return apiClient.post<SessionEvaluation>(`/sessions/${sessionId}/evaluate`);
  }
};