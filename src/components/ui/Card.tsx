// 🎯 Composant Card - Design system
import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'


// 🎨 Variants de la card
const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm',
  {
    variants: {
      variant: {
        default: 'bg-white border-gray-200 shadow-sm',
        elevated: 'bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200',
        outlined: 'bg-white border-2 border-gray-300 shadow-none',
        ghost: 'bg-transparent border-0 shadow-none',
        gradient: 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-md',
        glass: 'bg-white/10 backdrop-blur-sm border-white/20 shadow-lg',
        dark: 'bg-gray-900 border-gray-700 shadow-md',
        success: 'bg-success-50 border-success-200 shadow-sm',
        warning: 'bg-warning-50 border-warning-200 shadow-sm',
        error: 'bg-error-50 border-error-200 shadow-sm'
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10'
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        full: 'rounded-full'
      },
      hover: {
        true: 'hover:shadow-lg transition-shadow duration-200 cursor-pointer',
        false: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'lg',
      hover: false
    }
  }
)

// 🎯 Interface du composant Card
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

// 🎯 Composant Card principal
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, rounded, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, size, rounded, hover, className }))}
      {...props}
    />
  )
)
Card.displayName = 'Card'

// 🎯 Composant Card Header
const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

// 🎯 Composant Card Title
const CardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

// 🎯 Composant Card Description
const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

// 🎯 Composant Card Content
const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

// 🎯 Composant Card Footer
const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// 🎯 Composant Card Media (pour images/videos)
const CardMedia = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    aspectRatio?: 'square' | 'video' | '4/3' | '16/9' | '21/9'
  }
>(({ className, aspectRatio = '16/9', children, ...props }, ref) => {
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-[16/9]',
    '21/9': 'aspect-[21/9]'
  }

  return (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden rounded-t-lg',
        aspectRatioClasses[aspectRatio],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
CardMedia.displayName = 'CardMedia'

// 📦 Export de tous les composants
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardMedia
}