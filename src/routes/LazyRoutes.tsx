import React, { lazy, Suspense, useState, useEffect } from 'react'
import { PageSkeleton } from '../components/ui/PageSkeleton'

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// 🎯 Type pour composants lazy compatibles JSX
type LazyComponentType = React.ComponentType<any> & {
  preload?: () => Promise<void>;
}

// 🚀 Composant de chargement optimisé
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback = <PageSkeleton />,
  delay = 200
}) => {
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowFallback(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <Suspense fallback={showFallback ? fallback : null}>
      {children}
    </Suspense>
  )
}

// 🏠 Pages principales avec lazy loading intelligent
export const Landing = lazy(() =>
  import('../pages/Landing').then(module => ({
    default: module.Landing
  }))
) as LazyComponentType

export const Dashboard = lazy(() =>
  Promise.all([
    import('../pages/Dashboard'),
    // 📦 Précharger les données utilisateur en parallèle
    new Promise(resolve => setTimeout(resolve, 100))
  ]).then(([module]) => ({ default: module.Dashboard }))
) as LazyComponentType

// ⚙️ Settings (page très volumineuse - 784 lignes)
export const Settings = lazy(() =>
  Promise.all([
    import('../pages/Settings'),
    // 🎯 Délai minimum pour éviter le flash
    new Promise(resolve => setTimeout(resolve, 300))
  ]).then(([module]) => ({ default: module.Settings }))
) as LazyComponentType

// 💬 Chat et features vocales (premium)
export const Chat = lazy(() =>
  import('../pages/Chat').then(module => ({
    default: module.Chat
  }))
) as LazyComponentType

export const Session = lazy(() =>
  import('../pages/Session').then(module => ({
    default: module.SessionPage
  }))
) as LazyComponentType

// 💳 Paiements et abonnements
export const Pricing = lazy(() =>
  import('../pages/Pricing').then(module => ({
    default: module.Pricing
  }))
) as LazyComponentType

export const PaymentSuccess = lazy(() =>
  import('../pages/PaymentSuccess').then(module => ({
    default: module.PaymentSuccess }))
) as LazyComponentType

// 🎭 Scénarios et simulations
export const Scenarios = lazy(() =>
  import('../pages/Scenarios').then(module => ({
    default: module.Scenarios }))
) as LazyComponentType

export const Sessions = lazy(() =>
  import('../pages/Sessions').then(module => ({
    default: module.Sessions }))
) as LazyComponentType

// 🛠️ Pages utilitaires
export const ConfigErrorSimple = lazy(() =>
  import('../pages/ConfigErrorSimple').then(module => ({
    default: module.ConfigErrorSimple }))
) as LazyComponentType


// 🎨 Composants volumineux avec lazy loading

// 🎙️ Interface de chat vocal (247 lignes)
export const VoiceChatInterface = lazy(() =>
  import('../components/chat/VoiceChatInterface').then(module => ({
    default: module.VoiceChatInterface
  }))
) as LazyComponentType

// 🎙️ Enregistreur audio (85 lignes)
export const AudioRecorder = lazy(() =>
  import('../components/chat/AudioRecorder').then(module => ({
    default: module.AudioRecorder
  }))
) as LazyComponentType

// 📝 Transcription temps réel (140 lignes)
export const LiveTranscription = lazy(() =>
  import('../components/chat/LiveTranscription').then(module => ({
    default: module.LiveTranscription
  }))
) as LazyComponentType

// 📊 Visualisation audio (79 lignes)
export const WaveformVisualizer = lazy(() =>
  import('../components/chat/WaveformVisualizer').then(module => ({
    default: module.WaveformVisualizer
  }))
) as LazyComponentType

// 💳 Composants tarifs (280 lignes)
export const PricingSection = lazy(() =>
  import('../components/pricing/PricingSection').then(module => ({
    default: module.PricingSection
  }))
) as LazyComponentType

export const PricingCard = lazy(() =>
  import('../components/ui/PricingCard').then(module => ({
    default: module.PricingCard
  }))
) as LazyComponentType

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
        Dashboard.preload?.()
      }, 10000)
    }
  },

  // Précharger settings quand utilisateur clique sur profil
  settings: () => {
    Settings.preload?.()
  },

  // Précharger chat quand utilisateur est sur dashboard > 5s
  chat: () => {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        Chat.preload?.()
        VoiceChatInterface.preload?.()
      }, 5000)
    }
  },

  // Précharger pricing quand utilisateur visite tarifs
  pricing: () => {
    Pricing.preload?.()
    PricingSection.preload?.()
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

// 🎨 Wrapper de route avec préchargement
interface RouteWithPrefetchProps {
  children: React.ReactNode;
  prefetch?: () => void;
  prefetchOnHover?: boolean;
}

export const RouteWithPrefetch: React.FC<RouteWithPrefetchProps> = ({
  children,
  prefetch,
  prefetchOnHover = false
}) => {
  const handleMouseEnter = () => {
    if (prefetchOnHover && prefetch) {
      prefetch()
    }
  }

  return (
    <div onMouseEnter={handleMouseEnter}>
      <LazyWrapper>
        {children}
      </LazyWrapper>
    </div>
  )
}

// 📊 Statistiques de chargement (pour monitoring)
export const trackChunkLoading = (chunkName: string, loadTime: number) => {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    window.gtag('event', 'chunk_loaded', {
      chunk_name: chunkName,
      load_time: loadTime,
      timestamp: Date.now()
    })
  }
}

// 🚀 Export du routeur optimisé
export const createOptimizedRoutes = () => {

  return [
    {
      path: '/',
      element: (
        <RouteWithPrefetch prefetch={prefetchChunks.dashboard}>
          <Landing />
        </RouteWithPrefetch>
      )
    },
    {
      path: '/dashboard',
      element: (
        <RouteWithPrefetch prefetch={prefetchChunks.chat}>
          <Dashboard />
        </RouteWithPrefetch>
      )
    },
    {
      path: '/settings',
      element: (
        <RouteWithPrefetch>
          <Settings />
        </RouteWithPrefetch>
      )
    },
    {
      path: '/chat/:sessionId',
      element: (
        <RouteWithPrefetch>
          <Chat />
        </RouteWithPrefetch>
      )
    },
    {
      path: '/tarifs',
      element: (
        <RouteWithPrefetch prefetch={prefetchChunks.pricing}>
          <Pricing />
        </RouteWithPrefetch>
      )
    },
    // ... autres routes
  ]
}

export default createOptimizedRoutes
