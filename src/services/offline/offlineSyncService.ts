// 📱 Service de synchronisation hors ligne pour CandiVoc
import { openDB, DBSchema, IDBPDatabase } from 'idb'

// 🗄️ Interface pour la base de données locale
interface CandiVocDB extends DBSchema {
  // 📝 Scénarios sauvegardés hors ligne
  scenarios: {
    key: string
    value: {
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
    indexes: {
      'by-category': string
      'by-difficulty': string
      'by-sync-status': string
    }
  }

  // 🎤 Sessions d'entraînement
  sessions: {
    key: string
    value: {
      id: string
      scenario_id: string
      started_at: string
      ended_at?: string
      duration: number
      transcript: string
      feedback?: string
      score?: number
      synced_at?: string
      is_dirty: boolean
    }
    indexes: {
      'by-scenario': string
      'by-sync-status': string
      'by-date': string
    }
  }

  // 📊 Statistiques et progression
  progress: {
    key: string
    value: {
      user_id: string
      scenario_id: string
      attempts: number
      best_score: number
      average_score: number
      last_practiced: string
      synced_at?: string
    }
    indexes: {
      'by-user': string
      'by-scenario': string
    }
  }

  // 🔄 Queue de synchronisation
  syncQueue: {
    key: string
    value: {
      id: string
      type: 'create' | 'update' | 'delete'
      entity: 'scenario' | 'session' | 'progress'
      data: Record<string, unknown>
      timestamp: string
      retry_count: number
      last_error?: string
    }
    indexes: {
      'by-type': string
      'by-timestamp': string
      'by-retry-count': number
    }
  }
}

// 🏗️ Classe principale du service de synchronisation
export class OfflineSyncService {
  private db: IDBPDatabase<CandiVocDB> | null = null
  private syncInProgress = false
  private maxRetries = 3

  // 🚀 Initialisation de la base de données
  async init(): Promise<void> {
    try {
      this.db = await openDB<CandiVocDB>('CandiVocOffline', 1, {
        upgrade(db) {
          // Scenarios
          if (!db.objectStoreNames.contains('scenarios')) {
            const scenarioStore = db.createObjectStore('scenarios', { keyPath: 'id' })
            scenarioStore.createIndex('by-category', 'category')
            scenarioStore.createIndex('by-difficulty', 'difficulty')
            scenarioStore.createIndex('by-sync-status', 'synced_at')
          }

          // Sessions
          if (!db.objectStoreNames.contains('sessions')) {
            const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' })
            sessionStore.createIndex('by-scenario', 'scenario_id')
            sessionStore.createIndex('by-sync-status', 'synced_at')
            sessionStore.createIndex('by-date', 'started_at')
          }

          // Progression
          if (!db.objectStoreNames.contains('progress')) {
            const progressStore = db.createObjectStore('progress', { keyPath: 'id' })
            progressStore.createIndex('by-user', 'user_id')
            progressStore.createIndex('by-scenario', 'scenario_id')
          }

          // Queue de synchronisation
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' })
            syncStore.createIndex('by-type', 'type')
            syncStore.createIndex('by-timestamp', 'timestamp')
            syncStore.createIndex('by-retry-count', 'retry_count')
          }
        }
      })

      console.log('✅ Base de données hors ligne initialisée')
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la base de données:', error)
      throw error
    }
  }

  // 📝 Sauvegarder un scénario hors ligne
  async saveScenarioOffline(scenario: Record<string, unknown>): Promise<void> {
    if (!this.db) await this.init()

    try {
      const scenarioToSave = {
        ...scenario,
        is_dirty: true,
        synced_at: undefined
      }

      await this.db!.put('scenarios', scenarioToSave as CandiVocDB['scenarios']['value'])

      // Ajouter à la queue de synchronisation
      await this.addToSyncQueue({
        type: 'create',
        entity: 'scenario',
        data: scenarioToSave
      })

      console.log('✅ Scénario sauvegardé hors ligne:', scenario.id)
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du scénario:', error)
      throw error
    }
  }

  // 🎤 Sauvegarder une session hors ligne
  async saveSessionOffline(session: Record<string, unknown>): Promise<void> {
    if (!this.db) await this.init()

    try {
      const sessionToSave = {
        ...session,
        is_dirty: true,
        synced_at: undefined
      }

      await this.db!.put('sessions', sessionToSave as CandiVocDB['sessions']['value'])

      await this.addToSyncQueue({
        type: 'create',
        entity: 'session',
        data: sessionToSave
      })

      console.log('✅ Session sauvegardée hors ligne:', session.id)
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de la session:', error)
      throw error
    }
  }

  // 📊 Récupérer les scénarios hors ligne
  async getOfflineScenarios(filters?: {
    category?: string
    difficulty?: string
  }): Promise<Record<string, unknown>[]> {
    if (!this.db) await this.init()

    try {
      if (!filters || Object.keys(filters).length === 0) {
        return await this.db!.getAll('scenarios')
      }

      // Filtrage selon les critères
      let scenarios = await this.db!.getAll('scenarios')

      if (filters.category) {
        scenarios = scenarios.filter(s => s.category === filters.category)
      }

      if (filters.difficulty) {
        scenarios = scenarios.filter(s => s.difficulty === filters.difficulty)
      }

      return scenarios.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des scénarios:', error)
      return []
    }
  }

  // 🔄 Ajouter un élément à la queue de synchronisation
  private async addToSyncQueue(item: {
    type: 'create' | 'update' | 'delete'
    entity: 'scenario' | 'session' | 'progress'
    data: Record<string, unknown>
  }): Promise<void> {
    if (!this.db) await this.init()

    const syncItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: item.type,
      entity: item.entity,
      data: item.data,
      timestamp: new Date().toISOString(),
      retry_count: 0
    }

    await this.db!.add('syncQueue', syncItem)
  }

  // 🚀 Lancer la synchronisation avec le serveur
  async syncWithServer(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) {
      console.log('⏸️ Synchronisation en cours ou hors ligne')
      return
    }

    this.syncInProgress = true

    try {
      console.log('🔄 Début de la synchronisation...')

      if (!this.db) await this.init()

      // Récupérer les éléments à synchroniser
      const queue = await this.db!.getAll('syncQueue')

      if (queue.length === 0) {
        console.log('✅ Rien à synchroniser')
        return
      }

      let successCount = 0
      let errorCount = 0

      for (const item of queue) {
        try {
          await this.syncItem(item)
          await this.db!.delete('syncQueue', item.id)
          successCount++
        } catch (error) {
          console.error(`❌ Erreur de synchronisation pour ${item.id}:`, error)
          errorCount++

          // Mettre à jour le compteur de tentatives
          item.retry_count++
          item.last_error = error instanceof Error ? error.message : 'Unknown error'

          if (item.retry_count < this.maxRetries) {
            await this.db!.put('syncQueue', item)
          } else {
            console.warn(`⚠️ Élément ${item.id} abandonné après ${this.maxRetries} tentatives`)
            await this.db!.delete('syncQueue', item.id)
          }
        }
      }

      console.log(`✅ Synchronisation terminée: ${successCount} succès, ${errorCount} erreurs`)

      // Nettoyer les données obsolètes
      await this.cleanupOldData()

    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  // 🔄 Synchroniser un élément individuel
  private async syncItem(item: {
    id: string
    type: 'create' | 'update' | 'delete'
    entity: 'scenario' | 'session' | 'progress'
    data: Record<string, unknown>
    timestamp: string
    retry_count: number
    last_error?: string
  }): Promise<void> {
    // Cette méthode serait implémentée avec les vrais appels API
    // Pour l'instant, nous simulons la synchronisation

    console.log(`🔄 Synchronisation de ${item.entity} (${item.type}):`, item.data.id)

    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 100))

    // Marquer comme synchronisé dans la base de données locale
    if (item.entity === 'scenario' && this.db) {
      const scenario = await this.db.get('scenarios', item.data.id as string)
      if (scenario) {
        scenario.synced_at = new Date().toISOString()
        scenario.is_dirty = false
        await this.db.put('scenarios', scenario)
      }
    } else if (item.entity === 'session' && this.db) {
      const session = await this.db.get('sessions', item.data.id as string)
      if (session) {
        session.synced_at = new Date().toISOString()
        session.is_dirty = false
        await this.db.put('sessions', session)
      }
    }
  }

  // 🧹 Nettoyer les anciennes données
  private async cleanupOldData(): Promise<void> {
    if (!this.db) return

    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      // Nettoyer les anciennes sessions
      const oldSessions = await this.db!.getAllFromIndex(
        'sessions',
        'by-date',
        IDBKeyRange.upperBound(thirtyDaysAgo.toISOString())
      )

      for (const session of oldSessions) {
        await this.db!.delete('sessions', session.id)
      }

      if (oldSessions.length > 0) {
        console.log(`🧹 Nettoyé ${oldSessions.length} anciennes sessions`)
      }
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error)
    }
  }

  // 📊 Obtenir les statistiques hors ligne
  async getOfflineStats(): Promise<{
    scenarios: number
    sessions: number
    pendingSync: number
    lastSync: string | null
  }> {
    if (!this.db) await this.init()

    const [scenarios, sessions, syncQueue] = await Promise.all([
      this.db!.count('scenarios'),
      this.db!.count('sessions'),
      this.db!.count('syncQueue')
    ])

    return {
      scenarios,
      sessions,
      pendingSync: syncQueue,
      lastSync: localStorage.getItem('lastSync') || null
    }
  }

  // 🔍 Vérifier le statut de synchronisation
  isOnline(): boolean {
    return navigator.onLine
  }

  // 🚀 Forcer la synchronisation manuelle
  async forceSync(): Promise<void> {
    if (navigator.onLine) {
      await this.syncWithServer()
      localStorage.setItem('lastSync', new Date().toISOString())
    } else {
      throw new Error('Hors ligne - impossible de synchroniser')
    }
  }
}

// 🏭 Singleton du service
export const offlineSyncService = new OfflineSyncService()

// 🎯 Hook React pour utiliser le service hors ligne
import { useEffect, useState, useCallback } from 'react'

type OfflineStats = {
  scenarios: number
  sessions: number
  pendingSync: number
  lastSync: string | null
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [offlineStats, setOfflineStats] = useState<OfflineStats | null>(null)

  // 🔄 Fonction de synchronisation
  const syncWithServer = useCallback(async () => {
    try {
      setSyncStatus('syncing')
      await offlineSyncService.syncWithServer()
      setSyncStatus('success')

      // Mettre à jour les statistiques
      const stats = await offlineSyncService.getOfflineStats()
      setOfflineStats(stats)

      setTimeout(() => setSyncStatus('idle'), 2000)
    } catch (error) {
      setSyncStatus('error')
      console.error('❌ Erreur de synchronisation:', error)
    }
  }, [])

  // 📊 Mettre à jour le statut de connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setSyncStatus('success')
    }

    const handleOffline = () => {
      setIsOnline(false)
      setSyncStatus('error')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 🔄 Synchroniser automatiquement lors de la reconnexion
  useEffect(() => {
    if (isOnline && syncStatus === 'error') {
      syncWithServer()
    }
  }, [isOnline, syncStatus, syncWithServer])

  // 📊 Charger les statistiques
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await offlineSyncService.getOfflineStats()
        setOfflineStats(stats)
      } catch (error) {
        console.error('❌ Erreur lors du chargement des statistiques:', error)
      }
    }

    loadStats()
  }, [syncStatus])

  return {
    isOnline,
    syncStatus,
    offlineStats,
    syncWithServer,
    forceSync: () => offlineSyncService.forceSync()
  }
}
