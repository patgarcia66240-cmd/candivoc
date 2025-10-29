// 🚀 Utilitaires pour les routes lazy-loaded
import React, { useEffect } from 'react'

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

// 🎯 Type pour composants lazy compatibles JSX
export type LazyComponentType = React.ComponentType<Record<string, unknown>> & {
  preload?: () => Promise<void>;
}

// 🔥 Stratégie de préchargement intelligent

// 🎯 Précharger les pages critiques au hover
export const preloadOnHover = (lazyComponent: LazyComponentType) => {
  return () => {
    return lazyComponent
  }
}

// 📦 Précharger les chunks basés sur le comportement utilisateur
export const prefetchChunks = {
  // Précharger dashboard quand utilisateur est sur landing > 10s
  dashboard: () => {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        // Lazy import to avoid circular dependencies
        import('./LazyRoutes').then(routes => {
          routes.Dashboard?.preload?.()
        })
      }, 10000)
    }
  },

  // Précharger scenarios quand utilisateur accède dashboard
  scenarios: () => {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        import('./LazyRoutes').then(routes => {
          routes.Scenarios?.preload?.()
        })
      }, 5000)
    }
  },

  // Précharger settings (basse priorité)
  settings: () => {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        import('./LazyRoutes').then(routes => {
          routes.Settings?.preload?.()
        })
      }, 15000)
    }
  }
}

// 🎯 Analytics pour le chargement des pages
export const trackPageLoad = (pageName: string, loadTime: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_load_time', {
      page_name: pageName,
      load_time: Math.round(loadTime),
      event_category: 'performance'
    })
  }
}

// 🎯 Détection du réseau pour optimiser le préchargement
export const getNetworkOptimizedDelay = () => {
  if (typeof navigator === 'undefined') return 200

  const connection = (navigator as Navigator & {
    connection?: { effectiveType: string };
    mozConnection?: { effectiveType: string };
    webkitConnection?: { effectiveType: string }
  }).connection ||
  (navigator as Navigator & { mozConnection?: { effectiveType: string } }).mozConnection ||
  (navigator as Navigator & { webkitConnection?: { effectiveType: string } }).webkitConnection

  if (connection) {
    const effectiveType = connection.effectiveType
    switch (effectiveType) {
      case '4g':
      case '5g':
        return 100
      case '3g':
        return 200
      case '2g':
      case 'slow-2g':
        return 500
      default:
        return 200
    }
  }

  return 200
}

// 🎯 Optimiseur de préchargement adaptatif
export const createAdaptivePreloader = (pages: string[]) => {
  const preloadedPages = new Set<string>()
  const loadingTimes = new Map<string, number>()

  return {
    shouldPreload: (page: string) => {
      return !preloadedPages.has(page) && pages.includes(page)
    },

    markAsPreloaded: (page: string) => {
      preloadedPages.add(page)
    },

    recordLoadTime: (page: string, time: number) => {
      loadingTimes.set(page, time)

      // Ajuster la stratégie de préchargement basée sur les performances
      if (time > 3000) {
        // Si le chargement est lent, augmenter le délai pour cette page
        console.log(`Page ${page} took ${time}ms to load, consider optimizing`)
      }
    },

    getOptimalNextPage: (currentPage: string) => {
      // Logique simple pour déterminer la prochaine page à précharger
      const pageFlow: Record<string, string> = {
        'landing': 'dashboard',
        'dashboard': 'scenarios',
        'scenarios': 'sessions',
        'sessions': 'settings'
      }

      return pageFlow[currentPage] || pages[0]
    }
  }
}

// 📊 Statistiques de chargement (pour monitoring)
export const trackChunkLoading = (chunkName: string, loadTime: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', {
      event_category: 'chunk_loading',
      event_label: chunkName,
      value: loadTime,
      timestamp: Date.now()
    })
  }
}

// 📊 Hook de préchargement intelligent
export const usePrefetching = () => {
  useEffect(() => {
    // 🎯 Analyser le comportement utilisateur
    const handleUserInteraction = () => {
      // Précharger dashboard après première interaction
      if (!localStorage.getItem('dashboard_prefetched')) {
        prefetchChunks.dashboard()
        localStorage.setItem('dashboard_prefetched', 'true')
      }
    }

    // 🖱️ Écouter les interactions utilisateur
    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('scroll', handleUserInteraction)

    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('scroll', handleUserInteraction)
    }
  }, [])
}

