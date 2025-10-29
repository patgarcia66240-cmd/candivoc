// 📱 Hook pour la gestion responsive - Design system
import { useState, useEffect } from 'react'

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface BreakpointValue {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

export const breakpoints: BreakpointValue = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg')

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    if (typeof window !== 'undefined') {
      handleResize()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  // 🎯 Détecter le breakpoint actuel
  useEffect(() => {
    const { width } = windowSize

    if (width >= breakpoints['2xl']) {
      setCurrentBreakpoint('2xl')
    } else if (width >= breakpoints.xl) {
      setCurrentBreakpoint('xl')
    } else if (width >= breakpoints.lg) {
      setCurrentBreakpoint('lg')
    } else if (width >= breakpoints.md) {
      setCurrentBreakpoint('md')
    } else if (width >= breakpoints.sm) {
      setCurrentBreakpoint('sm')
    } else {
      setCurrentBreakpoint('xs')
    }
  }, [windowSize])

  // 🎯 Fonctions utilitaires
  const isAbove = (breakpoint: Breakpoint) => {
    return windowSize.width >= breakpoints[breakpoint]
  }

  const isBelow = (breakpoint: Breakpoint) => {
    return windowSize.width < breakpoints[breakpoint]
  }

  const isBetween = (min: Breakpoint, max: Breakpoint) => {
    return windowSize.width >= breakpoints[min] && windowSize.width < breakpoints[max]
  }

  // 📱 États pratiques
  const isMobile = isBelow('md')
  const isTablet = isBetween('md', 'lg')
  const isDesktop = isAbove('lg')
  const isSmallScreen = isBelow('sm')
  const isLargeScreen = isAbove('xl')

  return {
    windowSize,
    currentBreakpoint,
    isAbove,
    isBelow,
    isBetween,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isLargeScreen,
    breakpoints
  }
}

// 🎨 Hook pour les valeurs responsive
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T {
  const { currentBreakpoint } = useResponsive()

  // Trouver la valeur la plus appropriée
  const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs']

  for (const bp of breakpointOrder) {
    if (values[bp] !== undefined && bp <= currentBreakpoint) {
      return values[bp]!
    }
  }

  return defaultValue
}

// 📱 Hook pour les media queries personnalisées
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

// 🎨 Media queries prédéfinies
export function useIsDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)')
}

export function useIsReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

export function useIsHighContrast(): boolean {
  return useMediaQuery('(prefers-contrast: high)')
}

export function useIsLandscape(): boolean {
  return useMediaQuery('(orientation: landscape)')
}

export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)')
}