// 🎯 Hook pour utiliser l'error boundary
import { useQueryErrorResetBoundary } from '@tanstack/react-query'

export function useReactQueryErrorBoundary() {
  const { reset } = useQueryErrorResetBoundary()
  return { reset }
}