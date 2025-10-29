import  { useState, useRef, useEffect } from 'react'
import { cn } from '../../utils/cn'
import { LazyImage } from './LazyImage'

// 📊 Composant pour gérer une galerie d'images avec lazy loading
export interface ImageGalleryProps {
  images: Array<{
    src: string
    alt: string
    placeholder?: string
  }>
  columns?: number
  gap?: string
  className?: string
  imageClassName?: string
  onImageClick?: (index: number) => void
}

export function LazyImageGallery({
  images,
  columns = 3,
  gap = 'gap-4',
  className,
  imageClassName,
  onImageClick
}: ImageGalleryProps) {
  const [visibleImages, setVisibleImages] = useState<number>(columns * 2) // Commencer avec 2 rangées
  const galleryRef = useRef<HTMLDivElement>(null)

  // 📱 Adapter le nombre de colonnes selon la taille d'écran
  const [actualColumns, setActualColumns] = useState(columns)

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width < 640) setActualColumns(1) // mobile
      else if (width < 768) setActualColumns(2) // tablet
      else if (width < 1024) setActualColumns(3) // desktop small
      else setActualColumns(columns) // desktop
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [columns])

  // 🔄 Charger plus d'images au scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!galleryRef.current) return

      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100

      // Charger plus d'images quand on approche du bas
      if (scrollPercentage > 70 && visibleImages < images.length) {
        setVisibleImages(prev => Math.min(prev + actualColumns * 2, images.length))
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [visibleImages, images.length, actualColumns])

  const gridClasses = cn(
    'grid',
    gap,
    className
  )

  const gridStyle = {
    gridTemplateColumns: `repeat(${actualColumns}, minmax(0, 1fr))`
  }

  return (
    <div ref={galleryRef} className={gridClasses} style={gridStyle}>
      {images.slice(0, visibleImages).map((image, index) => (
        <div
          key={image.src}
          className={cn(
            'cursor-pointer transform transition-transform duration-200 hover:scale-105',
            imageClassName
          )}
          onClick={() => onImageClick?.(index)}
        >
          <LazyImage
            src={image.src}
            alt={image.alt}
            placeholder={image.placeholder}
            className="w-full h-full object-cover rounded-lg"
            containerClassName="aspect-square"
          />
        </div>
      ))}

      {/* 🔽 Indicateur de chargement */}
      {visibleImages < images.length && (
        <div className="col-span-full flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500"></div>
        </div>
      )}
    </div>
  )
}
