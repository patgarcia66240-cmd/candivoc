import { cva } from 'class-variance-authority'

// 🎨 Variants du bouton avec CVA - Compatible avec l'interface existante
export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Variants existantes - préservées pour compatibilité
        primary: 'cursor-pointer bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md',
        secondary: 'cursor-pointer bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 shadow-sm hover:shadow-md',
        outline: 'cursor-pointer border-2 border-secondary-300 bg-white dark:border-gray-600 dark:bg-gray-800 text-secondary-700 dark:text-gray-300 hover:bg-secondary-50 dark:hover:bg-gray-700 focus:ring-primary-500 hover:border-primary-500 dark:hover:border-primary-400',
        ghost: 'cursor-pointer text-secondary-700 dark:text-gray-300 hover:bg-secondary-100 dark:hover:bg-gray-800 focus:ring-secondary-500 hover:text-primary-600 dark:hover:text-primary-400',
        gray: 'cursor-pointer bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-sm hover:shadow-md',
        gradient: 'cursor-pointer bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700 dark:from-blue-600 dark:via-blue-700 dark:to-blue-800 text-white hover:from-slate-600 hover:via-slate-700 hover:to-slate-800 dark:hover:from-blue-700 dark:hover:via-blue-800 dark:hover:to-blue-900 focus:ring-slate-500 dark:focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 [text-shadow:0_2px_4px_rgb(0_0_0/0.6)] border border-slate-400/20 dark:border-blue-400/20',

        // Nouveaux variants avec design system
        default: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md',
        destructive: 'bg-error-600 text-white hover:bg-error-700 shadow-sm hover:shadow-md',
        success: 'bg-success-600 text-white hover:bg-success-700 shadow-sm hover:shadow-md',
        warning: 'bg-warning-600 text-white hover:bg-warning-700 shadow-sm hover:shadow-md',
        link: 'text-primary-600 underline-offset-4 hover:underline',
        glass: 'bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 shadow-md'
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-11 px-6 text-lg',
        xs: 'h-8 px-2 text-xs',
        xl: 'h-12 px-8 text-xl',
        icon: 'h-10 w-10'
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false
    }
  }
)