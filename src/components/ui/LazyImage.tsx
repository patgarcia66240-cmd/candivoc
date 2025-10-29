// 🖼️ Composant d'image avec lazy loading avancé
import React, { useState, useRef, useEffect } from 'react'
import { cn } from '../../utils/cn'


interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  placeholder?: string
  fallback?: string
  className?: string
  containerClassName?: string
  loadingStrategy?: 'lazy' | 'eager' | 'intersection'
  threshold?: number
  rootMargin?: string
  onLoad?: () => void
  onError?: () => void
  fadeIn?: boolean
  blurPlaceholder?: boolean
}

export function LazyImage({
  src,
  alt,
  placeholder,
  fallback = '/images/placeholder.png',
  className,
  containerClassName,
  loadingStrategy = 'intersection',
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
  fadeIn = true,
  blurPlaceholder = true,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(loadingStrategy === 'eager')
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(placeholder || fallback)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // 🎯 Détecter quand l'image est dans le viewport
  useEffect(() => {
    if (loadingStrategy !== 'intersection' || !imgRef.current) return

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observerRef.current?.disconnect()
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observerRef.current.observe(imgRef.current)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [loadingStrategy, threshold, rootMargin])

  // 🔄 Charger l'image quand elle est visible
  useEffect(() => {
    if (isInView && !isLoaded && !hasError && currentSrc !== src) {
      const img = new Image()

      img.onload = () => {
        setCurrentSrc(src)
        setIsLoaded(true)
        onLoad?.()
      }

      img.onerror = () => {
        setHasError(true)
        setCurrentSrc(fallback)
        onError?.()
      }

      img.src = src
    }
  }, [isInView, isLoaded, hasError, currentSrc, src, fallback, onLoad, onError])

  // 🎨 Classes CSS dynamiques
  const imageClasses = cn(
    'transition-opacity duration-300',
    {
      'opacity-0': !isLoaded && fadeIn,
      'opacity-100': isLoaded || !fadeIn,
      'blur-sm': blurPlaceholder && !isLoaded && currentSrc === placeholder
    },
    className
  )

  const containerClasses = cn(
    'relative overflow-hidden',
    {
      'animate-pulse bg-gray-200': !isLoaded && placeholder
    },
    containerClassName
  )

  return (
    <div className={containerClasses}>
      {/* 📷 Image principale */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={imageClasses}
        loading={loadingStrategy === 'lazy' ? 'lazy' : 'eager'}
        {...props}
      />

      {/* ⚡ Indicateur de chargement */}
      {!isLoaded && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Chargement...</p>
          </div>
        </div>
      )}

      {/* ❌ Indicateur d'erreur */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-500">Image non disponible</p>
          </div>
        </div>
      )}

      {/* 🏷️ Badge de chargement optimisé */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 left-0 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5">
          {loadingStrategy}
        </div>
      )}
    </div>
  )
}
