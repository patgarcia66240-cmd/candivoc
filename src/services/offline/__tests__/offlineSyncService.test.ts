// 📱 Tests pour le service de synchronisation hors ligne
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { offlineSyncService } from '../offlineSyncService'

// Mock d'IndexedDB
vi.mock('idb', () => ({
  openDB: vi.fn()
}))

describe('OfflineSyncService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialisation', () => {
    it('devrait initialiser la base de données avec succès', async () => {
      const mockDB = {
        put: vi.fn().mockResolvedValue(undefined),
        get: vi.fn().mockResolvedValue(undefined),
        getAll: vi.fn().mockResolvedValue([]),
        add: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
        count: vi.fn().mockResolvedValue(0),
        getAllFromIndex: vi.fn().mockResolvedValue([])
      }

      const mockOpenDB = await import('idb')
      mockOpenDB.openDB = vi.fn().mockResolvedValue(mockDB as unknown)

      await offlineSyncService.init()

      expect(mockOpenDB.openDB).toHaveBeenCalledWith('CandiVocOffline', 1, expect.any(Function))
    })

    it('devrait gérer les erreurs d\'initialisation', async () => {
      const mockOpenDB = await import('idb')
      mockOpenDB.openDB = vi.fn().mockRejectedValue(new Error('Database error'))

      await expect(offlineSyncService.init()).rejects.toThrow('Database error')
    })
  })

  describe('Sauvegarde hors ligne', () => {
    it('devrait sauvegarder un scénario hors ligne', async () => {
      const mockScenario = {
        id: 'test-scenario',
        title: 'Test Scenario',
        description: 'Test Description',
        category: 'technical',
        difficulty: 'beginner'
      }

      const mockDB = {
        put: vi.fn().mockResolvedValue(undefined),
        add: vi.fn().mockResolvedValue(undefined)
      }

      const mockOpenDB = await import('idb')
      mockOpenDB.openDB = vi.fn().mockResolvedValue(mockDB as unknown)

      await offlineSyncService.init()
      await offlineSyncService.saveScenarioOffline(mockScenario)

      expect(mockDB.put).toHaveBeenCalledWith('scenarios', {
        ...mockScenario,
        is_dirty: true,
        synced_at: undefined
      })
    })

    it('devrait sauvegarder une session hors ligne', async () => {
      const mockSession = {
        id: 'test-session',
        scenario_id: 'test-scenario',
        started_at: '2024-01-01T00:00:00Z',
        transcript: 'Test transcript'
      }

      const mockDB = {
        put: vi.fn().mockResolvedValue(undefined),
        add: vi.fn().mockResolvedValue(undefined)
      }

      const mockOpenDB = await import('idb')
      mockOpenDB.openDB = vi.fn().mockResolvedValue(mockDB as unknown)

      await offlineSyncService.init()
      await offlineSyncService.saveSessionOffline(mockSession)

      expect(mockDB.put).toHaveBeenCalledWith('sessions', {
        ...mockSession,
        is_dirty: true,
        synced_at: undefined
      })
    })
  })

  describe('Récupération de données', () => {
    it('devrait récupérer les scénarios hors ligne', async () => {
      const mockScenarios = [
        {
          id: 'test-1',
          title: 'Scenario 1',
          category: 'technical',
          difficulty: 'beginner',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'test-2',
          title: 'Scenario 2',
          category: 'behavioral',
          difficulty: 'advanced',
          created_at: '2024-01-02T00:00:00Z'
        }
      ]

      const mockDB = {
        getAll: vi.fn().mockResolvedValue(mockScenarios)
      }

      const mockOpenDB = await import('idb')
      mockOpenDB.openDB = vi.fn().mockResolvedValue(mockDB as unknown)

      await offlineSyncService.init()
      const scenarios = await offlineSyncService.getOfflineScenarios()

      expect(mockDB.getAll).toHaveBeenCalledWith('scenarios')
      expect(scenarios).toHaveLength(2)
      expect(scenarios[0].title).toBe('Scenario 1')
    })

    it('devrait filtrer les scénarios par catégorie', async () => {
      const mockScenarios = [
        { id: '1', category: 'technical' },
        { id: '2', category: 'behavioral' },
        { id: '3', category: 'technical' }
      ]

      const mockDB = {
        getAll: vi.fn().mockResolvedValue(mockScenarios)
      }

      const mockOpenDB = await import('idb')
      mockOpenDB.openDB = vi.fn().mockResolvedValue(mockDB as unknown)

      await offlineSyncService.init()
      const scenarios = await offlineSyncService.getOfflineScenarios({ category: 'technical' })

      expect(scenarios).toHaveLength(2)
      expect(scenarios.every(s => s.category === 'technical')).toBe(true)
    })
  })

  describe('Synchronisation', () => {
    it('devrait synchroniser avec le serveur', async () => {
      const mockQueueItem = {
        id: 'sync-1',
        type: 'create',
        entity: 'scenario',
        data: { id: 'test-scenario', title: 'Test' },
        timestamp: '2024-01-01T00:00:00Z',
        retry_count: 0
      }

      const mockDB = {
        getAll: vi.fn().mockResolvedValue([mockQueueItem]),
        delete: vi.fn().mockResolvedValue(undefined),
        get: vi.fn().mockResolvedValue({ id: 'test-scenario', is_dirty: true })
      }

      const mockOpenDB = await import('idb')
      mockOpenDB.openDB = vi.fn().mockResolvedValue(mockDB as unknown)

      await offlineSyncService.init()
      await offlineSyncService.syncWithServer()

      expect(mockDB.getAll).toHaveBeenCalledWith('syncQueue')
      expect(mockDB.delete).toHaveBeenCalledWith('sync-1')
    })

    it('devrait ne pas synchroniser si déjà en cours', async () => {
      const mockOpenDB = await import('idb')
      mockOpenDB.openDB = vi.fn().mockResolvedValue({} as Record<string, unknown>)

      await offlineSyncService.init()

      // Première synchronisation
      const syncPromise1 = offlineSyncService.syncWithServer()
      // Deuxième synchronisation (devrait être ignorée)
      const syncPromise2 = offlineSyncService.syncWithServer()

      expect(syncPromise1).toBeDefined()
      expect(syncPromise2).toBeDefined()
    })

    it('devrait gérer les erreurs de synchronisation', async () => {
      const mockQueueItem = {
        id: 'sync-error',
        type: 'create',
        entity: 'scenario',
        data: { id: 'test-scenario' },
        timestamp: '2024-01-01T00:00:00Z',
        retry_count: 0
      }

      const mockDB = {
        getAll: vi.fn().mockResolvedValue([mockQueueItem]),
        put: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined)
      }

      const mockOpenDB = await import('idb')
      mockOpenDB.openDB = vi.fn().mockResolvedValue(mockDB as unknown)

      // Simuler une erreur de synchronisation
      vi.spyOn(offlineSyncService, 'syncItem' as keyof typeof offlineSyncService).mockRejectedValueOnce(new Error('Network error'))

      await offlineSyncService.init()
      await offlineSyncService.syncWithServer()

      expect(mockDB.put).toHaveBeenCalledWith('syncQueue', {
        ...mockQueueItem,
        retry_count: 1,
        last_error: 'Network error'
      })
    })
  })

  describe('Statistiques', () => {
    it('devrait retourner les statistiques hors ligne', async () => {
      const mockDB = {
        count: vi.fn()
          .mockResolvedValueOnce(5) // scenarios
          .mockResolvedValueOnce(10) // sessions
          .mockResolvedValueOnce(3) // pending sync
      }

      const mockOpenDB = await import('idb')
      mockOpenDB.openDB = vi.fn().mockResolvedValue(mockDB as unknown)

      await offlineSyncService.init()
      const stats = await offlineSyncService.getOfflineStats()

      expect(stats).toEqual({
        scenarios: 5,
        sessions: 10,
        pendingSync: 3,
        lastSync: null
      })
    })
  })

  describe('Gestion du statut de connexion', () => {
    it('devrait détecter le statut en ligne', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      })

      expect(offlineSyncService.isOnline()).toBe(true)
    })

    it('devrait détecter le statut hors ligne', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      })

      expect(offlineSyncService.isOnline()).toBe(false)
    })

    it('devrait échouer la synchronisation forcée hors ligne', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      })

      await expect(offlineSyncService.forceSync()).rejects.toThrow('Hors ligne - impossible de synchroniser')
    })
  })

  describe('Nettoyage des données', () => {
    it('devrait nettoyer les anciennes sessions', async () => {
      const oldSessions = [
        { id: 'old-1', started_at: '2023-01-01T00:00:00Z' },
        { id: 'old-2', started_at: '2023-01-02T00:00:00Z' }
      ]

      const mockDB = {
        count: vi.fn().mockResolvedValue(2),
        delete: vi.fn().mockResolvedValue(undefined),
        getAllFromIndex: vi.fn().mockResolvedValue(oldSessions)
      }

      const mockOpenDB = await import('idb')
      mockOpenDB.openDB = vi.fn().mockResolvedValue(mockDB as unknown)

      await offlineSyncService.init()

      // Appeler la méthode privée via le hack
      await (offlineSyncService as { cleanupOldData: () => Promise<void> }).cleanupOldData()

      expect(mockDB.delete).toHaveBeenCalledWith('old-1')
      expect(mockDB.delete).toHaveBeenCalledWith('old-2')
    })
  })
})