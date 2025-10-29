import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'

// Importer les devtools uniquement en développement
// import { RouterDevtools } from '@tanstack/router-devtools'
import { Fragment, lazy } from 'react'
import { RootLayout } from './__root'

// Lazy loading des composants pour optimiser le chargement
const Landing = lazy(() => import('../pages/Landing').then(m => ({ default: m.Landing })))
const ConfigErrorSimple = lazy(() => import('../pages/ConfigErrorSimple').then(m => ({ default: m.ConfigErrorSimple })))
const Pricing = lazy(() => import('../pages/Pricing').then(m => ({ default: m.Pricing })))

// Lazy loading des pages protégées
const Dashboard = lazy(() => import('../pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Scenarios = lazy(() => import('../pages/Scenarios').then(m => ({ default: m.Scenarios })))
const Sessions = lazy(() => import('../pages/Sessions').then(m => ({ default: m.Sessions })))
const Settings = lazy(() => import('../pages/Settings').then(m => ({ default: m.Settings })))
const Chat = lazy(() => import('../pages/Chat').then(m => ({ default: m.Chat })))
const Session = lazy(() => import('../pages/Session'))
const PaymentSuccess = lazy(() => import('../pages/PaymentSuccess').then(m => ({ default: m.PaymentSuccess })))

// Layouts
const ProtectedLayout = lazy(() => import('./ProtectedLayout').then(m => ({ default: m.ProtectedLayout })))


// Route racine (layout)
const rootRoute = createRootRoute({
  component: RootLayout,
})

// Route Landing (page d'accueil publique)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function Index() {
    return <Landing />
  },
})

// Route Config Error (page d'erreur de configuration)
const configErrorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/config-error',
  component: function ConfigError() {
    return <ConfigErrorSimple />
  },
})

// Route Pricing (publique pour la migration, deviendra protégée plus tard)
const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pricing',
  component: function PricingPage() {
    return <Pricing />
  },
})


// Layout parent pour toutes les routes protégées
const protectedLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: function ProtectedLayoutPage() {
    return <ProtectedLayout />
  },
})

// Route Dashboard (enfant du layout protégé)
const dashboardRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'dashboard',
  component: function DashboardPage() {
    return <Dashboard />
  },
})

// Route Scenarios
const scenariosRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'scenarios',
  component: function ScenariosPage() {
    return <Scenarios />
  },
})

// Route Sessions
const sessionsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'sessions',
  component: function SessionsPage() {
    return <Sessions />
  },
})

// Route Settings
const settingsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'settings',
  component: function SettingsPage() {
    return <Settings />
  },
})

// Route Pricing (protégée)
const protectedPricingRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'pricing',
  component: function ProtectedPricingPage() {
    return <Pricing />
  },
})

// Route Chat avec paramètre
const chatRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'chat/$sessionId',
  component: function ChatPage() {
    return <Chat />
  },
})

// Route Session avec paramètre
const sessionRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'session/$sessionId',
  component: function SessionPage() {
    return <Session />
  },
})

// Route Payment Success
const successRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: 'success',
  component: function SuccessPage() {
    return <PaymentSuccess />
  },
})


// Créer l'arbre des routes
const routeTree = rootRoute.addChildren([
  // Routes publiques
  indexRoute,
  configErrorRoute,
  pricingRoute,
  // Layout protégé et ses enfants
  protectedLayoutRoute.addChildren([
    dashboardRoute,
    scenariosRoute,
    sessionsRoute,
    settingsRoute,
    protectedPricingRoute,
    chatRoute,
    sessionRoute,
    successRoute
  ])
])

// Créer et exporter le router
export const router = createRouter({ routeTree })

// Déclarer les types pour TypeScript
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
