// Types principaux pour l'application de chat vocal

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'candidate' | 'recruiter' | 'admin';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'commercial' | 'presentation' | 'problem-solving' | 'communication';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // en minutes
  language: string;
  instructions: string;
  aiPersonality: string;
  evaluationCriteria: EvaluationCriteria[];
  createdBy: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  weight: number; // pourcentage
  type: 'semantic' | 'emotional' | 'fluency' | 'relevance' | 'timing';
}

export interface Session {
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

export interface Message {
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

export interface SessionEvaluation {
  id: string;
  sessionId: string;
  overallScore: number; // 0-100
  criteriaScores: CriteriaScore[];
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  feedback: string;
  createdAt: Date;
}

export interface CriteriaScore {
  criteriaId: string;
  score: number; // 0-100
  details: string;
}

export interface Analytics {
  userId: string;
  totalSessions: number;
  totalDuration: number;
  averageScore: number;
  progressByCategory: CategoryProgress[];
  recentSessions: Session[];
  strongAreas: string[];
  improvementAreas: string[];
}

export interface CategoryProgress {
  category: string;
  sessionsCount: number;
  averageScore: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface AudioSettings {
  inputDevice?: string;
  outputDevice?: string;
  inputVolume: number; // 0-1
  outputVolume: number; // 0-1
  noiseSuppression: boolean;
  echoCancellation: boolean;
}

export interface WebSocketMessage {
  type: 'audio_chunk' | 'transcript' | 'ai_response' | 'session_start' | 'session_end' | 'error';
  data: unknown;
  timestamp: Date;
}

