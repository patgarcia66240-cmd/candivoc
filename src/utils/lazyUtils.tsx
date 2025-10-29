import  { ComponentType } from 'react'
import { LazyComponentProps, LazyComponent } from '../components/ui/LazyComponent'

// 🎯 Hook pour créer des composants lazy facilement
export function createLazyComponent<T extends ComponentType<Record<string, unknown>>>(
  loader: () => Promise<{ default: T }>,
  options?: Partial<LazyComponentProps>
) {
  return (props: Record<string, unknown>) => (
    <LazyComponent loader={loader} {...options} {...props} />
  )
}
