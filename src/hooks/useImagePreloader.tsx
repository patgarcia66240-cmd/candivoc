import { useState, useCallback, useEffect } from 'react'

// 🎯 Hook pour précharger des images
export function useImagePreloader(images: string[]) {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set())
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set())

  const preloadImage = useCallback((src: string) => {
    if (preloadedImages.has(src) || loadingImages.has(src)) return

    setLoadingImages(prev => new Set(prev).add(src))

    const img = new Image()
    img.onload = () => {
      setPreloadedImages(prev => new Set(prev).add(src))
      setLoadingImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(src)
        return newSet
      })
    }
    img.onerror = () => {
      setLoadingImages(prev => {
        const newSet = new Set(prev)
        newSet.delete(src)
        return newSet
      })
    }
    img.src = src
  }, [preloadedImages, loadingImages])

  // 🔄 Précharger toutes les images
  useEffect(() => {
    images.forEach(preloadImage)
  }, [images, preloadImage])

  return {
    preloadedImages,
    loadingImages,
    preloadImage,
    isPreloaded: (src: string) => preloadedImages.has(src),
    isLoading: (src: string) => loadingImages.has(src)
  }
}
