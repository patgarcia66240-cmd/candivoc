# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CandiVoc** is a React-based voice training application for job interview preparation using AI. It features voice recording, real-time transcription, AI-powered feedback, and subscription-based premium features with Supabase backend integration.

## Development Commands

```bash
# Development
npm run dev              # Start development server (port 3000)
npm run storybook        # Launch Storybook for component documentation

# Building & Deployment
npm run build            # Production build
npm run build:analyze    # Build with bundle size analysis
npm run preview          # Preview production build locally

# Testing
npm run test             # Run unit tests with coverage (target: 85%)
npm run test:ui          # Run tests with UI
npm run test:e2e         # Run E2E tests with Playwright
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix ESLint issues
npm run type-check       # TypeScript type checking

# Performance & Monitoring
npm run perf:bundle      # Analyze bundle size
npm run perf:lighthouse  # Run Lighthouse audit
```

## Architecture Overview

### Technology Stack
- **React 19** with TypeScript, Vite build tool
- **Supabase** for authentication, database, and storage
- **React Query** for server state management with intelligent caching
- **Tailwind CSS** with CVA for component variants
- **PWA** with service worker for offline functionality

### Directory Structure
```
src/
├── components/          # UI components (feature-based organization)
│   ├── ui/             # Design system components (Button, Input, Card, etc.)
│   ├── scenarios/      # Interview scenario components
│   ├── settings/       # Settings page components
│   └── pwa/           # PWA-specific components
├── pages/              # Route-level components
├── hooks/              # Custom React hooks (domain-specific logic)
├── services/           # Business logic & API calls
├── contexts/           # React contexts for global state
├── lib/               # Utilities and configurations
├── types/             # TypeScript definitions
└── providers/         # React providers
```

### State Management Patterns
- **Server State**: React Query with 5-minute stale time, 15-minute garbage collection
- **Client State**: React Context for auth, theme, toast notifications
- **Form State**: Local component state with validation hooks

### Authentication Architecture
- **Supabase Auth** with JWT tokens and refresh mechanism
- **Profile System**: Separate auth users table + extended profile data
- **Role-based Access**: User, admin, moderator roles
- **Session Management**: Auto-refresh with secure localStorage

### Component Patterns
- **Design System**: Use CVA (Class Variance Authority) for component variants
- **Lazy Loading**: Route-based code splitting with intelligent chunks
- **Error Boundaries**: Granular error handling with user feedback
- **Accessibility**: Radix UI primitives with ARIA support

### Security Implementation
- **Input Sanitization**: DOMPurify for XSS prevention
- **Validation**: Secure regex patterns for emails, passwords, names
- **CSP Headers**: Content Security Policy configured in Vite
- **Rate Limiting**: Client-side protection against brute force

## Key Development Patterns

### Component Development
```typescript
// Use the established design system
import { Button, Input, Card } from '@/components/ui'

// Follow CVA pattern for variants
const buttonVariants = cva("base-classes", {
  variants: {
    variant: {
      primary: "bg-primary-600 text-white hover:bg-primary-700",
      secondary: "bg-secondary-600 text-white hover:bg-secondary-700"
    }
  }
})
```

### Service Layer
```typescript
// Services in /services with clear interfaces
export class ScenarioService {
  static async getScenarios(category?: string): Promise<Scenario[]> {
    // Implementation with error handling and logging
  }
}
```

### Custom Hooks
```typescript
// Domain-specific hooks for reusable logic
export function useScenarios(category?: string) {
  return useQuery({
    queryKey: ['scenarios', category],
    queryFn: () => ScenariosService.getScenarios(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

### Error Handling
```typescript
// Use React Query error boundaries
// Implement comprehensive error logging with Sentry
// Provide user-friendly error messages with recovery options
```

## Performance Optimizations

### Bundle Management
- **Manual Chunks**: React vendors, UI libraries, services split separately
- **Target Size**: ~175KB gzipped with 15 optimized chunks
- **Build Time**: ~6.1s with Terser minification

### Caching Strategy
- **React Query**: API response caching with background updates
- **Service Worker**: Network-first caching for assets and APIs
- **Browser Cache**: Static assets with long-term caching

### Lazy Loading
- **Routes**: Component-based code splitting
- **Images**: Intersection Observer with blur placeholders
- **Features**: Dynamic imports for heavy components

## Testing Strategy

### Test Structure
- **Unit Tests**: Component logic, hooks, utilities (85% coverage target)
- **Integration Tests**: React Query, auth flows, service interactions
- **E2E Tests**: User journeys with Playwright
- **Accessibility Tests**: Lighthouse integration in CI

### Testing Patterns
```typescript
// Mock external services in test/setup.ts
// Use @testing-library/react for component testing
// Test error states and loading states
// Validate accessibility with axe-core
```

## Environment Setup

### Required Environment Variables
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_SENTRY_DSN=your_sentry_dsn (optional)
```

### Development Workflow
1. Feature development on feature branches
2. Comprehensive testing (unit + integration)
3. Bundle size analysis before PR
4. E2E validation on staging
5. Performance monitoring in production

## Code Quality Standards

### TypeScript Configuration
- Strict mode enabled
- Path aliases configured (@/components, @/services, etc.)
- Comprehensive type definitions for all APIs

### ESLint Rules
- TypeScript strict rules
- React hooks exhaustive dependencies
- Accessibility (jsx-a11y) rules
- Custom rules for project-specific patterns

### Git Hooks
- Pre-commit: lint-staged with formatting
- Pre-push: test coverage validation
- CI/CD: build, test, deploy pipeline with automated releases

## Monitoring & Analytics

### Error Tracking
- **Sentry Integration**: Error tracking with user context
- **Performance Monitoring**: Core Web Vitals tracking
- **User Analytics**: Event tracking for business metrics

### Development Tools
- **Storybook**: Component documentation and visual testing
- **Bundle Analyzer**: Visual bundle size analysis
- **Performance Budgets**: Automated size enforcement
- **Hot Reload**: Fast development iteration