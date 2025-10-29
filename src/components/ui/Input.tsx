// 🎯 Composant Input - Design system amélioré
import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'


// 🎨 Variants de l'input - Compatible avec l'interface existante
const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-gray-300 bg-white text-gray-900 focus:border-primary-500 focus:ring-primary-500 hover:border-gray-400',
        filled: 'border-gray-200 bg-gray-50 text-gray-900 focus:border-primary-500 focus:ring-primary-500 hover:bg-white',
        outlined: 'border-2 border-gray-300 bg-transparent text-gray-900 focus:border-primary-500 focus:ring-primary-500',
        underlined: 'border-0 border-b-2 border-gray-300 bg-transparent text-gray-900 rounded-none focus:border-primary-500 focus:ring-0 px-0',
        ghost: 'border-0 bg-transparent text-gray-900 focus:bg-gray-50 focus:ring-0 px-0',
        success: 'border-success-300 bg-white text-gray-900 focus:border-success-500 focus:ring-success-500',
        warning: 'border-warning-300 bg-white text-gray-900 focus:border-warning-500 focus:ring-warning-500',
        error: 'border-error-300 bg-error-50 text-gray-900 focus:border-error-500 focus:ring-error-500'
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-11 px-5 text-lg',
        xl: 'h-12 px-6 text-xl'
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
      rounded: 'md'
    }
  }
)

// 🎯 Interface du composant Input - Étendue pour compatibilité
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  helperText?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  loading?: boolean
}

// 🎯 Composant Input principal - forwardRef pour les refs
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant,
    size,
    rounded,
    label,
    error,
    helperText,
    startIcon,
    endIcon,
    loading,
    disabled,
    id,
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const hasError = !!error
    const isLoading = loading && !disabled

    // 🔧 Appliquer l'erreur comme variant
    const finalVariant = hasError ? 'error' : variant

    // 🎨 Classes de base pour compatibilité avec ancien code
    const baseClasses = cn(
      inputVariants({ variant: finalVariant, size, rounded }),
      startIcon && 'pl-10',
      (endIcon || isLoading) && 'pr-10',
      // Style par défaut pour compatibilité
      !variant && 'w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 hover:border-orange-300'
    )

    return (
      <div className="w-full space-y-2">
        {/* 🏷️ Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-1',
              hasError
                ? 'text-error-600'
                : 'text-secondary-700 dark:text-gray-300'
            )}
          >
            {label}
          </label>
        )}

        {/* 🎯 Conteneur de l'input */}
        <div className="relative">
          {/* 🎯 Icône gauche */}
          {startIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {startIcon}
            </div>
          )}

          {/* 🎯 Input principal */}
          <input
            id={inputId}
            ref={ref}
            className={cn(baseClasses, className)}
            disabled={disabled || isLoading}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />

          {/* 🎯 Icône droite ou loader */}
          {(endIcon || isLoading) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isLoading ? (
                <svg
                  className="animate-spin h-4 w-4 text-gray-400"
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
              ) : (
                endIcon
              )}
            </div>
          )}
        </div>

        {/* 📝 Texte d'aide ou d'erreur */}
        {(error || helperText) && (
          <p
            id={hasError ? `${inputId}-error` : `${inputId}-helper`}
            className={cn(
              'text-sm',
              hasError ? 'text-error-600' : 'text-gray-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// 🎯 Composant Textarea (extension de Input)
export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    Omit<VariantProps<typeof inputVariants>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  rows?: number
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    variant,
    rounded,
    label,
    error,
    helperText,
    rows = 4,
    id,
    ...props
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const hasError = !!error
    const finalVariant = hasError ? 'error' : variant

    return (
      <div className="w-full space-y-2">
        {/* 🏷️ Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'block text-sm font-medium mb-1',
              hasError && 'text-error-600',
              !hasError && 'text-secondary-700 dark:text-gray-300'
            )}
          >
            {label}
          </label>
        )}

        {/* 🎯 Textarea */}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={cn(
            inputVariants({ variant: finalVariant, rounded, className }),
            'min-h-[80px] resize-y',
            // Style par défaut pour compatibilité
            !variant && 'w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400'
          )}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />

        {/* 📝 Texte d'aide ou d'erreur */}
        {(error || helperText) && (
          <p
            id={hasError ? `${textareaId}-error` : `${textareaId}-helper`}
            className={cn(
              'text-sm mt-1',
              hasError ? 'text-error-600' : 'text-gray-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

// 📦 Export des composants
export { Input, Textarea }
