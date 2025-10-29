import React from 'react'
import { useComponentSplitting } from '../../hooks/useComponentSplitting-hooks'

// 🎨 Composant wrapper pour lazy loading
interface LazyComponentWrapperProps {
  importFn: () => Promise<{ default: React.ComponentType<unknown> }>;
  fallback?: React.ReactNode;
  preload?: boolean;
  preloadDelay?: number;
  children?: (Component: React.ComponentType<unknown>) => React.ReactNode;
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
  const { Component, loading, error, loadComponent } = useComponentSplitting(importFn as () => Promise<{ default: React.ComponentType<unknown> }>, {
    preloadDelay,
    fallback,
    onError
  });

  React.useEffect(() => {
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

export default LazyComponentWrapper;