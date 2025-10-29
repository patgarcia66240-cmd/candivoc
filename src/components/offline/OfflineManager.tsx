// 📱 Gestionnaire hors ligne pour CandiVoc
import React, { useEffect, useState } from 'react'
import { useOfflineSync } from '@/services/offline/offlineSyncService'

interface OfflineManagerProps {
  children: React.ReactNode
}

export function OfflineManager({ children }: OfflineManagerProps) {
  const { isOnline, syncStatus, offlineStats, syncWithServer, forceSync } = useOfflineSync()
  const [showOfflineAlert, setShowOfflineAlert] = useState(false)
  const [showSyncNotification, setShowSyncNotification] = useState(false)

  // 📊 Afficher/masquer les alertes selon le statut
  useEffect(() => {
    if (!isOnline) {
      setShowOfflineAlert(true)
    } else {
      // Masquer l'alerte après 2 secondes quand on revient en ligne
      const timer = setTimeout(() => setShowOfflineAlert(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isOnline])

  // 🔄 Afficher les notifications de synchronisation
  useEffect(() => {
    if (syncStatus === 'syncing') {
      setShowSyncNotification(true)
    } else if (syncStatus === 'success') {
      const timer = setTimeout(() => setShowSyncNotification(false), 3000)
      return () => clearTimeout(timer)
    } else if (syncStatus === 'error') {
      const timer = setTimeout(() => setShowSyncNotification(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [syncStatus])

  // 🔄 Synchroniser automatiquement quand on revient en ligne
  useEffect(() => {
    const pendingSync = offlineStats?.pendingSync ?? 0
    if (isOnline && pendingSync > 0) {
      syncWithServer()
    }
  }, [isOnline, offlineStats?.pendingSync, syncWithServer])

  return (
    <div className="relative">
      {/* 🚨 Alerte hors ligne */}
      {showOfflineAlert && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-3 shadow-lg transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
                <span className="font-medium">Mode hors ligne</span>
              </div>
              <span className="text-sm opacity-90">
                Vos données seront synchronisées dès que vous serez reconnecté
              </span>
            </div>

            {offlineStats && (
              <div className="flex items-center space-x-4 text-sm">
                <span>📝 {offlineStats.scenarios} scénarios</span>
                <span>🎤 {offlineStats.sessions} sessions</span>
                {(offlineStats.pendingSync ?? 0) > 0 && (
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                    ⏳ {(offlineStats.pendingSync ?? 0)} en attente
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔄 Notification de synchronisation */}
      {showSyncNotification && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 max-w-sm ${
          syncStatus === 'syncing' ? 'bg-blue-500 text-white' :
          syncStatus === 'success' ? 'bg-green-500 text-white' :
          'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-3">
            {syncStatus === 'syncing' && (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <div>
                  <div className="font-medium">Synchronisation en cours...</div>
                  {(offlineStats?.pendingSync ?? 0) > 0 && (
                    <div className="text-xs opacity-90">{(offlineStats?.pendingSync ?? 0)} éléments à synchroniser</div>
                  )}
                </div>
              </>
            )}

            {syncStatus === 'success' && (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <div className="font-medium">Synchronisation réussie</div>
                  <div className="text-xs opacity-90">Vos données sont à jour</div>
                </div>
              </>
            )}

            {syncStatus === 'error' && (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <div>
                  <div className="font-medium">Erreur de synchronisation</div>
                  <div className="text-xs opacity-90">Veuillez réessayer plus tard</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 🎛️ Panneau de statut hors ligne */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-40 bg-white rounded-lg shadow-lg p-4 max-w-xs border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Mode Hors Ligne</h3>
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">Actif</span>
          </div>

          {offlineStats && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Scénarios:</span>
                <span className="font-medium">{offlineStats.scenarios}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sessions:</span>
                <span className="font-medium">{offlineStats.sessions}</span>
              </div>
              {(offlineStats.pendingSync ?? 0) > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>En attente:</span>
                  <span className="font-medium">{(offlineStats.pendingSync ?? 0)}</span>
                </div>
              )}
              {offlineStats.lastSync && (
                <div className="flex justify-between text-gray-500 text-xs">
                  <span>Dernière sync:</span>
                  <span>{new Date(offlineStats.lastSync).toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={forceSync}
              disabled={!isOnline}
              className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
                isOnline
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isOnline ? 'Synchroniser maintenant' : 'Reconnexion requise'}
            </button>
          </div>
        </div>
      )}

      {/* Contenu de l'application */}
      <div className={showOfflineAlert ? 'pt-16' : ''}>
        {children}
      </div>
    </div>
  )
}

// 📊 Composant d'indicateur de statut de synchronisation
export function SyncStatusIndicator() {
  const { isOnline, syncStatus, offlineStats, forceSync } = useOfflineSync()

  if (isOnline && (!offlineStats || (offlineStats.pendingSync ?? 0) === 0)) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={forceSync}
        className={`relative p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 ${
          isOnline
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-orange-500 text-white hover:bg-orange-600'
        }`}
        title={isOnline ? "Synchroniser les données" : "Mode hors ligne"}
      >
        {/* Icône selon le statut */}
        {syncStatus === 'syncing' ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
        ) : isOnline ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        )}

        {/* Badge pour les éléments en attente */}
        {(offlineStats?.pendingSync ?? 0) > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {(offlineStats?.pendingSync ?? 0) > 99 ? '99+' : (offlineStats?.pendingSync ?? 0)}
          </span>
        )}
      </button>
    </div>
  )
}
