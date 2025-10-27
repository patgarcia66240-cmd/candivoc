import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  text
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Loader2 className={`animate-spin text-orange-500 ${sizeClasses[size]}`} />
      {text && (
        <span className="text-gray-600 text-sm">{text}</span>
      )}
    </div>
  )
}

// 🎨 Skeleton de chargement pour pages
export const PageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-linear-to-br from-orange-50 to-amber-50 p-6">
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
)

// 📊 Skeleton pour cartes
export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
    <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
    </div>
    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
  </div>
)

export default LoadingSpinner
