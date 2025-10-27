// 📊 Performance Monitoring - Core Web Vitals

import React from 'react';

interface PerformanceMetrics {
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  ttfb: number // Time to First Byte
  fcp: number // First Contentful Paint
  domContentLoaded: number
  load: number
}

interface NavigationTiming {
  type: 'navigate' | 'reload' | 'back_forward'
  redirectCount: number
  transferSize: number
  encodedBodySize: number
  decodedBodySize: number
}

export class PerformanceService {
  private static metrics: Partial<PerformanceMetrics> = {}
  private static observers: PerformanceObserver[] = []

  // 🚀 Initialisation
  static init() {
    if (!('performance' in window)) {
      console.warn('⚠️ Performance API non supportée')
      return
    }

    this.observeCoreWebVitals()
    this.measureNavigationTiming()
    this.measureResourceTiming()

    console.log('✅ Performance monitoring initialisé')
  }

  // 🎯 Observer les Core Web Vitals
  private static observeCoreWebVitals() {
    try {
      // Largest Contentful Paint (LCP)
      this.observePerformanceEntry('largest-contentful-paint', (entries) => {
        const lastEntry = entries[entries.length - 1]
        if (lastEntry) {
          this.metrics.lcp = lastEntry.startTime
          this.reportMetric('lcp', this.metrics.lcp, 'ms')
        }
      })

      // First Input Delay (FID) - seulement en production
      if (import.meta.env.PROD) {
        this.observePerformanceEntry('first-input', (entries) => {
          const firstInput = entries[0]
          if (firstInput && 'startTime' in firstInput) {
            const fid = (firstInput as any).processingStart - firstInput.startTime
            this.metrics.fid = fid
            this.reportMetric('fid', this.metrics.fid, 'ms')
          }
        })
      }

      // Cumulative Layout Shift (CLS)
      this.observePerformanceEntry('layout-shift', (entries) => {
        let clsValue = 0
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        this.metrics.cls = clsValue
        this.reportMetric('cls', this.metrics.cls)
      })

    } catch (error) {
      console.warn('⚠️ Erreur observation Core Web Vitals:', error)
    }
  }

  // 🔧 Observer les entrées de performance
  private static observePerformanceEntry(
    type: string,
    callback: (entries: PerformanceEntry[]) => void
  ) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries())
      })
      observer.observe({ type, buffered: true })
      this.observers.push(observer)
    } catch (error) {
      console.warn(`⚠️ Type ${type} non supporté:`, error)
    }
  }

  // ⏱️ Mesurer Navigation Timing
  private static measureNavigationTiming() {
    if ('navigation' in performance) {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

      const metrics = {
        ttfb: nav.responseStart - nav.requestStart,
        fcp: nav.loadEventEnd - nav.startTime,
        domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
        load: nav.loadEventEnd - nav.startTime,
        type: nav.type,
        redirectCount: nav.redirectCount,
      }

      Object.assign(this.metrics, metrics)

      // Signaler les métriques importantes
      this.reportMetric('ttfb', metrics.ttfb, 'ms')
      this.reportMetric('fcp', metrics.fcp, 'ms')
      this.reportMetric('dom_content_loaded', metrics.domContentLoaded, 'ms')
      this.reportMetric('page_load', metrics.load, 'ms')

      this.reportNavigationDetails(nav as NavigationTiming)
    }
  }

  // 📦 Mesurer Resource Timing
  private static measureResourceTiming() {
    try {
      const observer = new PerformanceObserver((list) => {
        const resources = list.getEntriesByType('resource') as PerformanceResourceTiming[]
        this.analyzeResources(resources)
      })
      observer.observe({ type: 'resource', buffered: true })
      this.observers.push(observer)
    } catch (error) {
      console.warn('⚠️ Resource Timing API non disponible:', error)
    }
  }

  // 📊 Analyser les ressources
  private static analyzeResources(resources: PerformanceResourceTiming[]) {
    const resourceTypes = {
      script: { count: 0, size: 0, duration: 0 },
      css: { count: 0, size: 0, duration: 0 },
      image: { count: 0, size: 0, duration: 0 },
      api: { count: 0, size: 0, duration: 0 },
      other: { count: 0, size: 0, duration: 0 }
    }

    resources.forEach(resource => {
      const url = new URL(resource.name)
      const extension = url.pathname.split('.').pop()?.toLowerCase()

      // Classifier le type de ressource
      let type: keyof typeof resourceTypes
      if (url.pathname.includes('/api/') || url.hostname.includes('supabase.co')) {
        type = 'api'
      } else if (extension === 'js') {
        type = 'script'
      } else if (extension === 'css') {
        type = 'css'
      } else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
        type = 'image'
      } else {
        type = 'other'
      }

      if (type in resourceTypes) {
        const resourceType = resourceTypes[type]
        resourceType.count++
        if (resource.encodedBodySize) {
          resourceType.size += resource.encodedBodySize
        }
        resourceType.duration += resource.duration
      }
    })

    // Rapporter les métriques de ressources
    Object.entries(resourceTypes).forEach(([type, metrics]) => {
      if (metrics.count > 0) {
        this.reportMetric(`${type}_count`, metrics.count)
        this.reportMetric(`${type}_size_kb`, Math.round(metrics.size / 1024))
        this.reportMetric(`${type}_duration`, Math.round(metrics.duration), 'ms')
      }
    })
  }

  // 📡 Détails de navigation
  private static reportNavigationDetails(nav: NavigationTiming) {
    const details = {
      connection_type: (navigator as any).connection?.effectiveType || 'unknown',
      device_memory: (navigator as any).deviceMemory || 0,
      hardware_concurrency: navigator.hardwareConcurrency || 1,
      service_worker: 'serviceWorker' in navigator,
      https: location.protocol === 'https:',
      cache_hit: nav.transferSize === 0 && nav.encodedBodySize > 0,
    }

    this.reportContext('navigation', details)
  }

  // 📊 Signaler une métrique
  private static reportMetric(name: string, value: number, unit: string = '') {
    console.log(`📊 Performance Metric: ${name} = ${value}${unit}`)

    // Envoyer à Analytics
    if (window.analytics) {
      window.analytics.trackPerformance(name, value, unit)
    }

    // Envoyer à Monitoring Service
    if (window.performanceService) {
      window.performanceService.captureMetric(name, value, unit)
    }
  }

  // 📝 Signaler un contexte
  private static reportContext(key: string, context: any) {
    if (window.analytics) {
      window.analytics.setUserProperties({ [key]: context })
    }
  }

  // 🎯 Obtenir le score de performance
  static getPerformanceScore(): {
    overall: 'good' | 'needs-improvement' | 'poor'
    lcp: 'good' | 'needs-improvement' | 'poor'
    fid: 'good' | 'needs-improvement' | 'poor'
    cls: 'good' | 'needs-improvement' | 'poor'
  } {
    // Scores selon Google Web Vitals
    const lcpScore = this.getLCPScore()
    const fidScore = this.getFIDScore()
    const clsScore = this.getCLSScore()

    // Score global
    const goodCount = [lcpScore, fidScore, clsScore].filter(s => s === 'good').length
    const overall = goodCount >= 2 ? 'good' : goodCount >= 1 ? 'needs-improvement' : 'poor'

    return {
      overall,
      lcp: lcpScore,
      fid: fidScore,
      cls: clsScore,
    }
  }

  // 🏁 Score LCP (Largest Contentful Paint)
  private static getLCPScore(): 'good' | 'needs-improvement' | 'poor' {
    if (!this.metrics.lcp) return 'needs-improvement'
    if (this.metrics.lcp <= 2500) return 'good'
    if (this.metrics.lcp <= 4000) return 'needs-improvement'
    return 'poor'
  }

  // 🏁 Score FID (First Input Delay)
  private static getFIDScore(): 'good' | 'needs-improvement' | 'poor' {
    if (!this.metrics.fid) return 'needs-improvement'
    if (this.metrics.fid <= 100) return 'good'
    if (this.metrics.fid <= 300) return 'needs-improvement'
    return 'poor'
  }

  // 🏁 Score CLS (Cumulative Layout Shift)
  private static getCLSScore(): 'good' | 'needs-improvement' | 'poor' {
    if (!this.metrics.cls) return 'needs-improvement'
    if (this.metrics.cls <= 0.1) return 'good'
    if (this.metrics.cls <= 0.25) return 'needs-improvement'
    return 'poor'
  }

  // 🔧 Mesurer le temps de chargement d'un composant
  static measureComponentRender(componentName: string) {
    return (WrappedComponent: React.ComponentType) => {
      return (props: any) => {
        React.useEffect(() => {
          const startTime = performance.now()

          return () => {
            const endTime = performance.now()
            const duration = endTime - startTime

            this.reportMetric(`component_render_${componentName}`, duration, 'ms')
          }
        })

        return <WrappedComponent {...props} />
      }
    }
  }

  // 🔄 Mesurer une opération personnalisée
  static measureOperation(name: string, operation: () => void | Promise<void>) {
    return async () => {
      const startTime = performance.now()

      try {
        await operation()
        const duration = performance.now() - startTime
        this.reportMetric(`operation_${name}`, duration, 'ms')
      } catch (error) {
        const duration = performance.now() - startTime
        this.reportMetric(`operation_${name}_error`, duration, 'ms')

        // Signaler l'erreur au monitoring
        if (window.performanceService) {
          window.performanceService.captureException(error as Error, { operation: name, duration })
        }

        throw error
      }
    }
  }

  // 📊 Obtenir toutes les métriques
  static getAllMetrics(): PerformanceMetrics {
    return this.metrics as PerformanceMetrics
  }

  // 🧹 Nettoyage
  static cleanup() {
    this.observers.forEach(observer => {
      observer.disconnect()
    })
    this.observers = []
  }
}

// 🔧 Extensions TypeScript pour window
declare global {
  interface Window {
    analytics?: any
    performanceService?: any
  }
}

export default PerformanceService
