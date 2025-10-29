// 📱 Types pour le système hors ligne

export interface OfflineScenario {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  duration: number
  language: string
  is_public: boolean
  content: string
  created_at: string
  updated_at: string
  synced_at?: string
  is_dirty: boolean
}

export interface OfflineSession {
  id: string
  scenario_id: string
  started_at: string
  ended_at?: string
  duration: number
  transcript: string
  feedback?: string
  score?: number
  audio_blob?: Blob
  synced_at?: string
  is_dirty: boolean
}

export interface OfflineProgress {
  id: string
  user_id: string
  scenario_id: string
  attempts: number
  best_score: number
  average_score: number
  last_practiced: string
  synced_at?: string
}

export interface SyncQueueItem {
  id: string
  type: 'create' | 'update' | 'delete'
  entity: 'scenario' | 'session' | 'progress'
  data: OfflineScenario | OfflineSession | OfflineProgress | Record<string, unknown>
  timestamp: string
  retry_count: number
  last_error?: string
}

export interface OfflineStats {
  scenarios: number
  sessions: number
  pendingSync: number
  lastSync: string | null
  totalSize: number
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'

export interface SyncConfig {
  autoSync: boolean
  syncInterval: number
  maxRetries: number
  retryDelay: number
}

export interface OfflineStorageQuota {
  used: number
  available: number
  total: number
  percentage: number
}

// Événements pour la synchronisation
export interface SyncEvent {
  type: 'sync-start' | 'sync-progress' | 'sync-complete' | 'sync-error'
  data?: {
    progress?: number
    total?: number
    currentItem?: string
    error?: string
  }
  timestamp: string
}

// État de la connexion
export interface ConnectionState {
  isOnline: boolean
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}