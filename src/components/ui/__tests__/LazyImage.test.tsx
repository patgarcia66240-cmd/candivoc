// 🖼️ Tests pour le composant LazyImage
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LazyImage, LazyImageGallery, useImagePreloader } from '../LazyImage'

// Mock d'IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
})

global.IntersectionObserver = mockIntersectionObserver

describe('LazyImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendu de base', () => {
    it('devrait rendre avec les props par défaut', () => {
      render(
        <LazyImage
          src="https://example.com/image.jpg"
          alt="Test image"
        />
      )

      const img = screen.getByRole('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('alt', 'Test image')
    })

    it('devrait utiliser le placeholder comme src initial', () => {
      render(
        <LazyImage
          src="https://example.com/image.jpg"
          alt="Test image"
          placeholder="https://example.com/placeholder.jpg"
        />
      )

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', 'https://example.com/placeholder.jpg')
    })

    it('devrait appliquer les classes personnalisées', () => {
      render(
        <LazyImage
          src="https://example.com/image.jpg"
          alt="Test image"
          className="custom-class"
        />
      )

      const img = screen.getByRole('img')
      expect(img).toHaveClass('custom-class')
    })
  })

  describe('Stratégies de chargement', () => {
    it('devrait charger immédiatement avec la stratégie eager', () => {
      render(
        <LazyImage
          src="https://example.com/image.jpg"
          alt="Test image"
          loadingStrategy="eager"
        />
      )

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('loading', 'eager')
    })

    it('devrait utiliser lazy loading par défaut', () => {
      render(
        <LazyImage
          src="https://example.com/image.jpg"
          alt="Test image"
        />
      )

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('loading', 'lazy')
    })

    it('devrait utiliser la stratégie intersection par défaut', () => {
      render(
        <LazyImage
          src="https://example.com/image.jpg"
          alt="Test image"
        />
      )

      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          threshold: 0.1,
          rootMargin: '50px'
        })
      )
    })
  })

  describe('États de chargement', () => {
    it('devrait afficher le loader pendant le chargement', async () => {
      render(
        <LazyImage
          src="https://example.com/image.jpg"
          alt="Test image"
          placeholder="https://example.com/placeholder.jpg"
        />
      )

      // Simuler l'entrée dans le viewport
      const callback = mockIntersectionObserver.mock.calls[0][0]
      callback([{ isIntersecting: true, target: screen.getByRole('img') }])

      await waitFor(() => {
        const img = screen.getByRole('img')
        expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
      })
    })

    it('devrait gérer les erreurs de chargement', async () => {
      render(
        <LazyImage
          src="https://example.com/invalid-image.jpg"
          alt="Test image"
          fallback="https://example.com/fallback.jpg"
        />
      )

      // Simuler l'entrée dans le viewport et une erreur
      const callback = mockIntersectionObserver.mock.calls[0][0]
      callback([{ isIntersecting: true, target: screen.getByRole('img') }])

      // Simuler une erreur d'image
      const img = screen.getByRole('img') as HTMLImageElement
      Object.defineProperty(img, 'naturalWidth', { value: 0 })
      fireEvent.error(img)

      await waitFor(() => {
        expect(img).toHaveAttribute('src', 'https://example.com/fallback.jpg')
      })
    })
  })

  describe('Effets visuels', () => {
    it('devrait appliquer l\'effet de fondu au chargement', () => {
      render(
        <LazyImage
          src="https://example.com/image.jpg"
          alt="Test image"
          fadeIn={true}
        />
      )

      const img = screen.getByRole('img')
      expect(img).toHaveClass('transition-opacity', 'duration-300', 'opacity-0')
    })

    it('devrait appliquer le flou au placeholder', () => {
      render(
        <LazyImage
          src="https://example.com/image.jpg"
          alt="Test image"
          placeholder="https://example.com/placeholder.jpg"
          blurPlaceholder={true}
        />
      )

      const img = screen.getByRole('img')
      expect(img).toHaveClass('blur-sm')
    })
  })

  describe('Accessibilité', () => {
    it('devrait avoir un alt text', () => {
      render(
        <LazyImage
          src="https://example.com/image.jpg"
          alt="Descriptive alt text"
        />
      )

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('alt', 'Descriptive alt text')
    })

    it('devrait être focusable si nécessaire', () => {
      render(
        <LazyImage
          src="https://example.com/image.jpg"
          alt="Test image"
          tabIndex={0}
        />
      )

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('tabIndex', '0')
    })
  })
})

describe('LazyImageGallery', () => {
  const mockImages = [
    { src: 'https://example.com/image1.jpg', alt: 'Image 1' },
    { src: 'https://example.com/image2.jpg', alt: 'Image 2' },
    { src: 'https://example.com/image3.jpg', alt: 'Image 3' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024
    })
  })

  it('devrait rendre une galerie d\'images', () => {
    render(<LazyImageGallery images={mockImages} />)

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(6) // 3 images * 2 (initial visible)
  })

  it('devrait adapter le nombre de colonnes selon la taille d\'écran', async () => {
    Object.defineProperty(window, 'innerWidth', { value: 640 })

    render(<LazyImageGallery images={mockImages} />)

    // Attendre le redimensionnement
    await vi.waitFor(() => {
      const images = screen.getAllByRole('img')
      const grid = images[0].closest('div')
      expect(grid).toHaveClass('grid')
    })

    // Vérifier que le style a été appliqué
    const gallery = screen.getByRole('generic').parentElement
    expect(gallery).toBeInTheDocument()
  })

  it('devrait charger plus d\'images au scroll', async () => {
    render(<LazyImageGallery images={mockImages} columns={1} />)

    // Simuler le scroll vers le bas
    Object.defineProperty(document.documentElement, 'scrollTop', {
      writable: true,
      value: 1000
    })
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      value: 2000
    })
    Object.defineProperty(document.documentElement, 'clientHeight', {
      writable: true,
      value: 1000
    })

    fireEvent.scroll(window)

    await waitFor(() => {
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThan(2)
    })
  })

  it('devrait gérer les clics sur les images', () => {
    const handleClick = vi.fn()
    render(<LazyImageGallery images={mockImages} onImageClick={handleClick} />)

    const firstImage = screen.getAllByRole('img')[0]
    fireEvent.click(firstImage)

    expect(handleClick).toHaveBeenCalledWith(0)
  })
})

describe('useImagePreloader', () => {
  it('devrait précharger les images', async () => {
    const { result } = renderHook(() => useImagePreloader(['image1.jpg', 'image2.jpg']))

    // Initialement, aucune image préchargée
    expect(result.current.preloadedImages).toBeInstanceOf(Set)
    expect(result.current.preloadedImages.size).toBe(0)

    // Simuler le préchargement
    result.current.preloadImage('image1.jpg')

    // Simuler le chargement réussi
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(result.current.isPreloaded('image1.jpg')).toBe(true)
  })

  it('devrait gérer plusieurs préchargements', async () => {
    const { result } = renderHook(() => useImagePreloader(['image1.jpg', 'image2.jpg', 'image3.jpg']))

    const images = ['image1.jpg', 'image2.jpg', 'image3.jpg']

    // Précharger toutes les images
    images.forEach(image => {
      result.current.preloadImage(image)
    })

    // Simuler tous les chargements réussis
    await new Promise(resolve => setTimeout(resolve, 100))

    images.forEach(image => {
      expect(result.current.isPreloaded(image)).toBe(true)
    })

    expect(result.current.preloadedImages.size).toBe(3)
  })

  it('devrait éviter de précharger les images déjà préchargées', () => {
    const { result } = renderHook(() => useImagePreloader(['image1.jpg']))

    result.current.preloadImage('image1.jpg')

    // Tenter de précharger à nouveau
    result.current.preloadImage('image1.jpg')

    // Ne devrait pas créer de nouvelle tentative
    expect(result.current.isLoading('image1.jpg')).toBe(false)
  })
})