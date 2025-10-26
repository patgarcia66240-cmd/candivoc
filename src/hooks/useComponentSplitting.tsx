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
        window.gtag('event', 'component_loaded', {
          load_time: Math.round(loadTime),
          component_name: (module.default as any)?.name || 'Unknown'
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

    preloadTimeoutRef.current = setTimeout(() => {
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
  importFn: () => Promise<{ default: any }>,
  options: {
    rootMargin?: string;
    threshold?: number;
    fallback?: React.ReactNode;
  } = {}
) {
  const { Component, loading, error, loadComponent } = useComponentSplitting(importFn, options);
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
    const handleChunkLoad = (event: CustomEvent) => {
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
        const connection = (navigator as any).connection;
        setConnectionType(connection.effectiveType || 'unknown');
      }
    };

    updateConnectionType();

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', updateConnectionType);

      return () => {
        connection.removeEventListener('change', updateConnectionType);
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

// 🎨 Composant wrapper pour lazy loading
interface LazyComponentWrapperProps {
  importFn: () => Promise<{ default: any }>;
  fallback?: React.ReactNode;
  preload?: boolean;
  preloadDelay?: number;
  children?: (Component: any) => React.ReactNode;
  onLoadingStart?: () => void;
  onLoadingComplete?: () => void;
  onError?: (error: Error) => void;
}

export const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({
  importFn,
  fallback,
  preload = false,
  preloadDelay = 0,
  children,
  onLoadingStart,
  onLoadingComplete,
  onError
}) => {
  const { Component, loading, error, loadComponent } = useComponentSplitting(importFn, {
    preloadDelay,
    fallback,
    onError
  });

  useEffect(() => {
    if (preload && !Component && !loading) {
      onLoadingStart?.();
      loadComponent().finally(() => {
        onLoadingComplete?.();
      });
    }
  }, [preload, Component, loading, loadComponent, onLoadingStart, onLoadingComplete]);

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600">Erreur de chargement du composant</p>
        <button
          onClick={() => loadComponent()}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (loading) {
    return fallback || <div className="animate-pulse bg-gray-200 rounded h-64" />;
  }

  if (Component && children) {
    return <>{children(Component)}</>;
  }

  if (Component) {
    return <Component />;
  }

  return fallback || null;
};

export default useComponentSplitting;