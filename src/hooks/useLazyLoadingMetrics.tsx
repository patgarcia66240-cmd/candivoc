import { useState, useCallback } from 'react'

// 📊 Hook pour le suivi des performances de lazy loading
export function useLazyLoadingMetrics() {
  const [metrics, setMetrics] = useState({
    loadedComponents: 0,
    failedComponents: 0,
    averageLoadTime: 0,
    totalLoadTime: 0
  })

  const trackComponentLoad = useCallback((loadTime: number, success: boolean) => {
    setMetrics(prev => {
      const newTotal = prev.totalLoadTime + loadTime
      const newCount = prev.loadedComponents + (success ? 1 : 0)
      const newFailures = prev.failedComponents + (!success ? 1 : 0)

      return {
        loadedComponents: newCount,
        failedComponents: newFailures,
        averageLoadTime: newCount > 0 ? newTotal / newCount : 0,
        totalLoadTime: newTotal
      }
    })
  }, [])

  return {
    metrics,
    trackComponentLoad
  }
}
