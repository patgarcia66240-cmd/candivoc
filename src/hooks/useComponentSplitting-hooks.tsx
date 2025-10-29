import { useState, useEffect, useRef } from 'react'

// 🎯 Hook pour optimiser le chargement des composants volumineux
export function useComponentSplitting<T>(
  importFn: () => Promise<{ default: T }>,
  options: {
    preloadDelay?: number;
    fallback?: React.ReactNode;
    onError?: (error: Error) => void;
  } = {}
) {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const preloadTimeoutRef = useRef<number | undefined>(undefined);

  const {
    preloadDelay = 0,
    onError
  } = options;

  // 🚀 Charger le composant
  const loadComponent = async () => {
    if (Component) return Component;

    setLoading(true);
    setError(null);

    try {
      const startTime = performance.now();
      const module = await importFn();
      const loadTime = performance.now() - startTime;

      setComponent(module.default);

      // 📊 Tracking performance
      if (typeof window !== 'undefined' && 'gtag' in window) {
        const gtag = (window as Record<string, unknown>).gtag as (command: string, action: string, options: Record<string, unknown>) => void;
        gtag('event', 'component_loaded', {
          load_time: Math.round(loadTime),
          component_name: (module.default as Record<string, unknown>)?.name || 'Unknown'
        });
      }

      return module.default;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load component');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 📦 Précharger le composant avec délai
  const preload = () => {
    if (preloadTimeoutRef.current) return;

    preloadTimeoutRef.current = window.setTimeout(() => {
      loadComponent().catch(console.error);
    }, preloadDelay);
  };

  // 🧹 Nettoyage
  useEffect(() => {
    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
    };
  }, []);

  return {
    Component,
    loading,
    error,
    loadComponent,
    preload
  };
}

// 🎨 Hook pour lazy loading intelligent basé sur l'intersection
export function useIntersectionLazy(
  importFn: () => Promise<{ default: React.ComponentType<unknown> }>,
  options: {
    rootMargin?: string;
    threshold?: number;
    fallback?: React.ReactNode;
  } = {}
) {
  const { Component, loading, error, loadComponent } = useComponentSplitting(importFn as () => Promise<{ default: React.ComponentType<unknown> }>, options);
  const elementRef = useRef<HTMLElement>(null);

  const {
    rootMargin = '50px',
    threshold = 0.1,
    fallback
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // 👁️ Observer l'élément
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadComponent().catch(console.error);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [loadComponent, rootMargin, threshold]);

  return {
    Component,
    loading,
    error,
    elementRef,
    fallback: fallback || (
      <div className="animate-pulse bg-gray-200 rounded-lg h-64 w-full" />
    )
  };
}

// 📊 Hook pour monitoring des chunks
export function useChunkMonitoring() {
  const [loadedChunks, setLoadedChunks] = useState<Set<string>>(new Set());
  const [loadingTimes, setLoadingTimes] = useState<Record<string, number>>({});

  useEffect(() => {
    // 📊 Surveiller les chunks chargés
    const handleChunkLoad = (event: CustomEvent<{ chunkName: string; loadTime: number }>) => {
      const { chunkName, loadTime } = event.detail;

      setLoadedChunks(prev => new Set([...prev, chunkName]));
      setLoadingTimes(prev => ({
        ...prev,
        [chunkName]: loadTime
      }));

      // 📈 Analytics
      if (typeof window !== 'undefined' && 'gtag' in window) {
        window.gtag('event', 'chunk_loaded', {
          chunk_name: chunkName,
          load_time: loadTime,
          total_chunks: loadedChunks.size + 1
        });
      }
    };

    window.addEventListener('chunkLoaded', handleChunkLoad as EventListener);

    return () => {
      window.removeEventListener('chunkLoaded', handleChunkLoad as EventListener);
    };
  }, [loadedChunks.size]);

  return {
    loadedChunks,
    loadingTimes,
    totalLoadedChunks: loadedChunks.size,
    averageLoadTime: Object.values(loadingTimes).reduce((a, b) => a + b, 0) / Object.keys(loadingTimes).length || 0
  };
}

// 🎯 Hook pour préchargement basé sur le réseau
export function useNetworkBasedPreloading() {
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    // 📡 Détecter le type de connexion
    const updateConnectionType = () => {
      if ('connection' in navigator) {
        const connection = (navigator as Navigator & { connection?: { effectiveType?: string; addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void } }).connection;
        setConnectionType(connection?.effectiveType || 'unknown');
      }
    };

    updateConnectionType();

    if ('connection' in navigator) {
      const connection = (navigator as Navigator & { connection?: { effectiveType?: string; addEventListener: (event: string, handler: () => void) => void; removeEventListener: (event: string, handler: () => void) => void } }).connection;
      connection?.addEventListener('change', updateConnectionType);

      return () => {
        connection?.removeEventListener('change', updateConnectionType);
      };
    }
  }, []);

  // 🎯 Adapter le préchargement selon la connexion
  const shouldPreload = () => {
    const slowConnections = ['slow-2g', '2g', '3g'];
    return !slowConnections.includes(connectionType);
  };

  return {
    connectionType,
    shouldPreload,
    isSlowConnection: ['slow-2g', '2g'].includes(connectionType)
  };
}
