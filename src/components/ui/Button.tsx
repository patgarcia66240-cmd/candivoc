// 🎯 Bouton design system - Composant réutilisable amélioré
import React, { forwardRef } from 'react'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import { buttonVariants } from '@/utils/buttonVariants'

// 🎯 Interface du bouton - Étendue pour compatibilité
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  tooltip?: string
  children: React.ReactNode
}

// 🎯 Composant bouton - forwardRef pour les refs
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    fullWidth,
    children,
    disabled,
    loading = false,
    leftIcon,
    rightIcon,
    tooltip,
    ...props
  }, ref) => {
    const baseClasses = cn(buttonVariants({ variant, size, fullWidth, className }))

    // 🔄 Gérer l'état de chargement
    const isLoading = loading || disabled

    return (
      <button
        className={baseClasses}
        ref={ref}
        disabled={isLoading}
        title={tooltip}
        {...props}
      >
        {/* 🎯 Indicateur de chargement */}
        {isLoading && (
          <svg
            className={cn(
              "animate-spin -ml-1 mr-2 h-4 w-4",
              size === 'icon' && "m-0 h-4 w-4"
            )}
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* 🎯 Icône gauche */}
        {!isLoading && leftIcon && (
          <span className="mr-2 flex items-center justify-center">{leftIcon}</span>
        )}

        {/* 📝 Contenu */}
        <span className={cn("flex items-center", isLoading && "opacity-0")}>
          {children}
        </span>

        {/* 🎯 Icône droite */}
        {!isLoading && rightIcon && (
          <span className="ml-2 flex items-center justify-center">{rightIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

// 📦 Export pour compatibilité et nouvelles fonctionnalités
export { Button }
