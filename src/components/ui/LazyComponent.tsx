// ⚡ Composant de lazy loading avancé pour React
import React, { Suspense, useState, useEffect, useRef, ComponentType } from 'react'
import { cn } from '../../utils/cn'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'


export interface LazyComponentProps {
  loader: () => Promise<{ default: ComponentType<Record<string, unknown>> }>
  fallback?: React.ReactNode
  error?: React.ReactNode
  delay?: number
  rootMargin?: string
  threshold?: number
  className?: string
  children?: React.ReactNode
  [key: string]: unknown
}

// 🎯 Défauts pour les composants lazy
const DEFAULT_FALLBACK = (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500"></div>
  </div>
)

const DEFAULT_ERROR = (
  <div className="flex items-center justify-center p-8 text-red-500">
    <div className="text-center">
      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p>Erreur lors du chargement du composant</p>
    </div>
  </div>
)



// ⚡ Composant principal de lazy loading
export function LazyComponent({
  loader,
  fallback = DEFAULT_FALLBACK,
  error = DEFAULT_ERROR,
  delay = 200,
  rootMargin = '50px',
  threshold = 0.1,
  className,
  children,
  ...props
}: LazyComponentProps) {
  const [Component, setComponent] = useState<ComponentType<Record<string, unknown>> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // 🎯 Détecter quand le composant est dans le viewport
  const isInViewport = useIntersectionObserver(containerRef, {
    rootMargin,
    threshold
  })

  // 🔄 Déclencher le chargement
  useEffect(() => {
    if (isInViewport && !Component && !shouldLoad) {
      setShouldLoad(true)
    }
  }, [isInViewport, Component, shouldLoad])

  // 📦 Charger le composant
  useEffect(() => {
    if (!shouldLoad || Component) return

    let isMounted = true
    let timeoutId: NodeJS.Timeout

    const loadComponent = async () => {
      try {
        setIsLoading(true)
        setHasError(false)

        // Ajouter un délai si spécifié
        if (delay > 0) {
          await new Promise(resolve => {
            timeoutId = setTimeout(resolve, delay)
          })
        }

        const module = await loader()
        if (isMounted) {
          setComponent(() => module.default)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Erreur lors du chargement du composant:', err)
        if (isMounted) {
          setHasError(true)
          setIsLoading(false)
        }
      }
    }

    loadComponent()

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [shouldLoad, loader, delay, Component])

  // 🎨 Conteneur avec placeholder
  const containerClasses = cn(
    'min-h-[200px]',
    {
      'animate-pulse bg-gray-100': isLoading
    },
    className
  )

  if (hasError) {
    return <div className={containerClasses}>{error}</div>
  }

  if (isLoading || (!Component && !shouldLoad)) {
    return (
      <div ref={containerRef} className={containerClasses}>
        {isLoading ? fallback : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <p className="text-sm">Faites défiler pour charger</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (Component) {
    return (
      <Suspense fallback={fallback}>
        <Component {...props}>{children}</Component>
      </Suspense>
    )
  }

  return <div ref={containerRef} className={containerClasses} />
}



// 📱 Composant pour lazy loader avec priorité
export interface PriorityLazyComponentProps extends LazyComponentProps {
  priority?: 'low' | 'medium' | 'high'
  preload?: boolean
}

export function PriorityLazyComponent({
  loader,
  priority = 'medium',
  preload = false,
  ...props
}: PriorityLazyComponentProps) {
  const shouldPreload = preload
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // 🎯 Priorités de chargement
  const rootMargin = {
    low: '200px',
    medium: '100px',
    high: '50px'
  }[priority]

  const threshold = {
    low: 0.01,
    medium: 0.1,
    high: 0.25
  }[priority]

  const delay = {
    low: 500,
    medium: 200,
    high: 0
  }[priority]

  // 🔍 Observer avec les options de priorité
  const isInViewport = useIntersectionObserver(containerRef, {
    rootMargin,
    threshold
  })

  useEffect(() => {
    if (isInViewport && !isVisible) {
      setIsVisible(true)
    }
  }, [isInViewport, isVisible])

  // 📦 Préchargement si demandé
  useEffect(() => {
    if (shouldPreload && !isVisible) {
      // Précharger en arrière-plan
      const timer = setTimeout(() => {
        loader().catch(() => {
          // Ignorer les erreurs de préchargement
        })
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [shouldPreload, isVisible, loader])

  return (
    <div ref={containerRef}>
      {isVisible && (
        <LazyComponent
          loader={loader}
          {...props}
          delay={delay}
          rootMargin={rootMargin}
          threshold={threshold}
        />
      )}
      {!isVisible && (
        <div className="min-h-[200px] flex items-center justify-center text-gray-400">
          <p className="text-sm">Chargement différé (priorité: {priority})</p>
        </div>
      )}
    </div>
  )
}

// 🎨 Composant de lazy loading pour les sections de page
export interface LazySectionProps {
  children: React.ReactNode
  id?: string
  className?: string
  placeholder?: React.ReactNode
  threshold?: number
  rootMargin?: string
  onEnterView?: () => void
  onLeaveView?: () => void
}

export function LazySection({
  children,
  id,
  className,
  placeholder,
  threshold = 0.1,
  rootMargin = '50px',
  onEnterView,
  onLeaveView
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement | null>(null)

  const isInViewport = useIntersectionObserver(sectionRef, {
    threshold,
    rootMargin
  })

  useEffect(() => {
    if (isInViewport && !isVisible) {
      setIsVisible(true)
      onEnterView?.()
    } else if (!isInViewport && isVisible) {
      setIsVisible(false)
      onLeaveView?.()
    }
  }, [isInViewport, isVisible, onEnterView, onLeaveView])

  return (
    <section
      ref={sectionRef}
      id={id}
      className={cn('min-h-[200px]', className)}
    >
      {isVisible ? (
        children
      ) : (
        placeholder || (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse">
              <div className="h-4 w-32 bg-gray-300 rounded"></div>
            </div>
          </div>
        )
      )}
    </section>
  )
}
