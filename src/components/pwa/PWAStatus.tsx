import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const PWAStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <>
      {/* Bannière hors connexion */}
      {showOfflineBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-4 py-2 text-center">
          <div className="flex items-center justify-center gap-2 text-sm">
            <WifiOff className="w-4 h-4" />
            <span>Vous êtes hors connexion. Certaines fonctionnalités peuvent être limitées.</span>
          </div>
        </div>
      )}

      {/* Indicateur de statut (desktop) */}
      {!isOnline && (
        <div className="hidden md:block fixed bottom-4 left-4 z-40">
          <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
            <WifiOff className="w-4 h-4" />
            <span>Hors connexion</span>
            <button
              onClick={handleRefresh}
              className="p-1 hover:bg-gray-800 rounded transition-colors"
              title="Actualiser"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Indicateur en ligne (optionnel) */}
      {isOnline && (
        <div className="hidden lg:block fixed bottom-4 right-4 z-40">
          <div className=" gradient-to-r from-green-500 to-green-700 bg-green-400 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
            <Wifi className="w-4 h-4" />
            <span>En ligne</span>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAStatus;