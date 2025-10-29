import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactQueryErrorBoundary } from '@/components/error-boundaries/ReactQueryErrorBoundary'
import { queryClient } from '@/lib/react-query'

interface ReactQueryProviderProps {
  children: React.ReactNode
  enableDevtools?: boolean
}

// 🎯 Provider React Query simplifié pour tester
export function ReactQueryProviderSimple({
  children,
  enableDevtools = import.meta.env.DEV
}: ReactQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryErrorBoundary
        onError={(error) => {
          console.error('React Query Error:', error)
        }}
      >
        {children}

        {/* 📊 Devtools en développement */}
        {enableDevtools && (
          <ReactQueryDevtools
            initialIsOpen={false}
          />
        )}
      </ReactQueryErrorBoundary>
    </QueryClientProvider>
  )
}