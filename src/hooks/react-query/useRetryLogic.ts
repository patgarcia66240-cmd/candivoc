import React, { useCallback } from 'react'

// 🔄 Types pour la logique de retry
interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: unknown, attemptNumber: number) => boolean;
  onRetry?: (attemptNumber: number, error: unknown) => void;
  onError?: (error: unknown) => void;
}

interface RetryState {
  attempts: number;
  isRetrying: boolean;
  lastError: unknown;
  nextRetryTime: number | null;
}

// 🔄 Hook pour la logique de retry personnalisée
export function useRetryLogic(options: RetryOptions = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    shouldRetry = defaultShouldRetry,
    onRetry,
    onError
  } = options

  const calculateDelay = useCallback((attemptNumber: number): number => {
    // Délai exponentiel avec jitter
    const exponentialDelay = baseDelay * Math.pow(2, attemptNumber - 1)
    const jitter = Math.random() * 0.3 * exponentialDelay // 30% jitter
    const delay = exponentialDelay + jitter
    return Math.min(delay, maxDelay)
  }, [baseDelay, maxDelay])

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    customShouldRetry?: (error: unknown, attemptNumber: number) => boolean
  ): Promise<T> => {
    let lastError: unknown

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        const result = await operation()
        return result
      } catch (error) {
        lastError = error

        // Vérifier si on doit retry
        const retryCondition = customShouldRetry || shouldRetry
        if (attempt > maxRetries || !retryCondition(error, attempt)) {
          onError?.(error)
          throw error
        }

        // Calculer le délai
        const delay = calculateDelay(attempt)

        // Callback de retry
        onRetry?.(attempt, error)

        // Attendre avant de retry
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    onError?.(lastError)
    throw lastError
  }, [maxRetries, shouldRetry, calculateDelay, onRetry, onError])

  return {
    executeWithRetry,
    calculateDelay
  }
}

// 🎯 Fonction par défaut pour déterminer si on doit retry
function defaultShouldRetry(error: unknown, attemptNumber: number): boolean {
  // Erreurs HTTP
  if (error && typeof error === 'object' && 'status' in error) {
    const status = error.status as number

    // Pas de retry pour les erreurs client (4xx)
    if (status >= 400 && status < 500) {
      // Exceptions: retry pour 408 (Request Timeout), 429 (Too Many Requests)
      return status === 408 || status === 429
    }

    // Retry pour erreurs serveur (5xx)
    if (status >= 500 && status < 600) {
      return true
    }

    // Pas de retry pour autres statuts
    return false
  }

  // Erreurs réseau
  if (error && typeof error === 'object' && 'code' in error) {
    const code = error.code as string
    if (code === 'NETWORK_ERROR' || code === 'TIMEOUT') {
      return true
    }
  }

  // Erreurs de timeout
  if (error && typeof error === 'object' && 'name' in error) {
    const name = error.name as string
    if (name === 'TimeoutError' || name === 'AbortError') {
      return true
    }
  }

  // Erreurs de parsing JSON
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return true
  }

  // Par défaut, retry pour les autres erreurs (max 3 fois)
  return attemptNumber <= 3
}

// 🔄 Hook pour le retry avec état
export function useRetryWithState(options: RetryOptions = {}) {
  const retryLogic = useRetryLogic(options)
  const [retryState, setRetryState] = React.useState<RetryState>({
    attempts: 0,
    isRetrying: false,
    lastError: null,
    nextRetryTime: null
  })

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    customShouldRetry?: (error: unknown, attemptNumber: number) => boolean
  ): Promise<T> => {
    setRetryState(prev => ({
      ...prev,
      isRetrying: true,
      attempts: prev.attempts + 1,
      lastError: null
    }))

    try {
      const result = await retryLogic.executeWithRetry(operation, customShouldRetry)

      setRetryState({
        attempts: 0,
        isRetrying: false,
        lastError: null,
        nextRetryTime: null
      })

      return result
    } catch (error) {
      setRetryState(prev => ({
        ...prev,
        isRetrying: false,
        lastError: error,
        nextRetryTime: null
      }))

      throw error
    }
  }, [retryLogic])

  const resetRetry = useCallback(() => {
    setRetryState({
      attempts: 0,
      isRetrying: false,
      lastError: null,
      nextRetryTime: null
    })
  }, [])

  return {
    executeWithRetry,
    retryState,
    resetRetry,
    calculateDelay: retryLogic.calculateDelay
  }
}

// 🔄 Hook pour le retry automatique avec décompte
export function useRetryWithCountdown(options: RetryOptions & {
  onCountdownTick?: (secondsRemaining: number) => void;
} = {}) {
  const { onCountdownTick, ...retryOptions } = options
  const retryWithState = useRetryWithState(retryOptions)
  const [countdown, setCountdown] = React.useState<number | null>(null)

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    customShouldRetry?: (error: unknown, attemptNumber: number) => boolean
  ): Promise<T> => {
    const wrappedOperation = async () => {
      try {
        return await operation()
      } catch (error) {
        const retryCondition = customShouldRetry || defaultShouldRetry
        const currentAttempt = retryWithState.retryState.attempts

        if (retryCondition(error, currentAttempt)) {
          const delay = retryWithState.calculateDelay(currentAttempt)
          const seconds = Math.ceil(delay / 1000)

          // Démarrer le countdown
          setCountdown(seconds)

          // Décompte
          const countdownInterval = setInterval(() => {
            setCountdown(prev => {
              if (prev === null || prev <= 1) {
                clearInterval(countdownInterval)
                return null
              }
              onCountdownTick?.(prev - 1)
              return prev - 1
            })
          }, 1000)

          // Nettoyer le countdown après le délai
          setTimeout(() => {
            setCountdown(null)
            clearInterval(countdownInterval)
          }, delay)
        }

        throw error
      }
    }

    return retryWithState.executeWithRetry(wrappedOperation, customShouldRetry)
  }, [retryWithState, onCountdownTick])

  return {
    executeWithRetry,
    retryState: retryWithState.retryState,
    countdown,
    resetRetry: retryWithState.resetRetry,
    isCountingDown: countdown !== null
  }
}

// 🎯 Utilitaires pour les patterns de retry courants
export const RetryPatterns = {
  // Retry agressif pour les requêtes critiques
  aggressive: {
    maxRetries: 5,
    baseDelay: 500,
    maxDelay: 10000
  },

  // Retry modéré pour les requêtes normales
  moderate: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000
  },

  // Retry conservateur pour les requêtes non critiques
  conservative: {
    maxRetries: 2,
    baseDelay: 2000,
    maxDelay: 60000
  },

  // Pas de retry pour les requêtes sensibles
  none: {
    maxRetries: 0,
    baseDelay: 0,
    maxDelay: 0
  }
}

// 🎯 Hook pour le retry basé sur le type d'opération
export function useOperationRetry(operationType: 'critical' | 'normal' | 'noncritical' | 'sensitive') {
  const pattern = {
    critical: RetryPatterns.aggressive,
    normal: RetryPatterns.moderate,
    noncritical: RetryPatterns.conservative,
    sensitive: RetryPatterns.none
  }[operationType]

  return useRetryWithState(pattern)
}