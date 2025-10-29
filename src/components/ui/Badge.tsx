// 🏷️ Composant Badge - Design system
import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

// 🎨 Variants du badge
const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-500 text-white hover:bg-primary-600',
        secondary: 'border-transparent bg-secondary-100 text-secondary-800 hover:bg-secondary-200',
        success: 'border-transparent bg-success-500 text-white hover:bg-success-600',
        warning: 'border-transparent bg-warning-500 text-white hover:bg-warning-600',
        error: 'border-transparent bg-error-500 text-white hover:bg-error-600',
        outline: 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
        ghost: 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200',
        info: 'border-transparent bg-blue-500 text-white hover:bg-blue-600',
        gradient: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700',
        glass: 'border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
      },
      size: {
        xs: 'px-1.5 py-0.5 text-[10px]',
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
        xl: 'px-4 py-1.5 text-base'
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'full'
    }
  }
)

// 🎯 Interface du composant Badge
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
  dotColor?: string
  removable?: boolean
  onRemove?: () => void
}

// 🎯 Composant Badge principal
const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({
    className,
    variant,
    size,
    rounded,
    children,
    dot = false,
    dotColor,
    removable = false,
    onRemove,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, rounded, className }))}
        {...props}
      >
        {/* 🎯 Point indicateur */}
        {dot && (
          <span
            className={cn(
              'mr-1.5 h-2 w-2 flex-shrink-0 rounded-full self-center',
              dotColor || 'bg-current'
            )}
          />
        )}

        {/* 📝 Contenu */}
        <span className="truncate max-w-[200px] self-center">{children}</span>

        {/* 🗑️ Bouton de suppression */}
        {removable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1.5 flex-shrink-0 rounded-full hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-black/20 self-center"
            aria-label="Retirer"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

// 🏷️ Badge de statut spécial
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'online' | 'offline' | 'busy' | 'away' | 'invisible'
}

const statusColors = {
  online: 'bg-success-500',
  offline: 'bg-gray-400',
  busy: 'bg-error-500',
  away: 'bg-warning-500',
  invisible: 'bg-gray-300'
}

const statusLabels = {
  online: 'En ligne',
  offline: 'Hors ligne',
  busy: 'Occupé',
  away: 'Absent',
  invisible: 'Invisible'
}

export const StatusBadge = forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, className, ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        variant="outline"
        size="sm"
        className={cn('gap-1.5', className)}
        {...props}
      >
        <span
          className={cn('h-2 w-2 flex-shrink-0 rounded-full self-center', statusColors[status])}
        />
        <span className="text-xs self-center">{statusLabels[status]}</span>
      </Badge>
    )
  }
)

StatusBadge.displayName = 'StatusBadge'

// 🎯 Badge de compteur
export interface CounterBadgeProps extends Omit<BadgeProps, 'children'> {
  count: number
  max?: number
  showZero?: boolean
}

export const CounterBadge = forwardRef<HTMLDivElement, CounterBadgeProps>(
  ({
    count,
    max = 99,
    showZero = false,
    className,
    variant = 'error',
    size = 'xs',
    ...props
  }, ref) => {
    if (count === 0 && !showZero) return null

    const displayCount = count > max ? `${max}+` : count.toString()

    return (
      <Badge
        ref={ref}
        variant={variant}
        size={size}
        className={cn('min-w-[20px] h-5 p-0 flex items-center justify-center', className)}
        {...props}
      >
        {displayCount}
      </Badge>
    )
  }
)

CounterBadge.displayName = 'CounterBadge'

// 📦 Export des composants
export { Badge }
export default Badge
