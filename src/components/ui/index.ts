// 📦 Export des composants UI - Design system CandiVoc

// 🎯 Composants principaux
export { Button } from './Button'
export type { ButtonProps } from './Button'
export { buttonVariants } from '@/utils/buttonVariants'

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardMedia
} from './Card'
export type { CardProps } from './Card'

export { Input, Textarea } from './Input'
export type { InputProps, TextareaProps } from './Input'

// 🏷️ Composants Badge
export { StatusBadge, CounterBadge } from './Badge'
export { default as Badge } from './Badge'
export type { BadgeProps, StatusBadgeProps, CounterBadgeProps } from './Badge'

// 🖼️ Composants médias
export {
  LazyImage,
  LazyImageGallery,
  useImagePreloader
} from './LazyImage'
export type {
  ImageGalleryProps
} from './LazyImage'

// ⚡ Composants optimisation
export {
  LazyComponent,
  PriorityLazyComponent,
  LazySection,
  createLazyComponent,
  useLazyLoadingMetrics
} from './LazyComponent'
export type {
  LazyComponentProps,
  PriorityLazyComponentProps,
  LazySectionProps
} from './LazyComponent'

// 🎨 Composants theme
export { ThemeToggle } from './ThemeToggle'
export { useTheme } from '@/contexts/ThemeContextDefinition'
export type { Theme, ThemeName } from '@/tokens/designTokens'

// 🎯 Tokens et design system
export { designTokens, themes, useDesignTokens } from '@/tokens/designTokens'
export type { Theme as DesignSystemTheme } from '@/tokens/designTokens'
