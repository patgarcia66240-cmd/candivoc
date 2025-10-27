# 🔍 Services de Monitoring - CandiVoc

Cette documentation explique l'architecture de monitoring unifiée mise en place pour CandiVoc.

---

## 🏗️ Architecture de Monitoring

### 📦 Services Principaux

1. **MonitoringService** (`src/lib/monitoring.ts`) - Service unifié
2. **Sentry** (`src/lib/sentry.ts`) - Error tracking & performance
3. **Analytics** (`src/lib/analytics.ts`) - User behavior tracking
4. **Performance** (`src/lib/performance.ts`) - Core Web Vitals

### 🔄 Flux de Données

```
┌─────────────────┐
│   App.tsx      │  ← Point d'entrée unique
└────────┬────────┘
         │
    ┌────┴─────┐
    │  Services   │  ← Initialisation automatique
    └────┬─────┘
         │
    ┌────┴─────┐
    │  Monitoring │  ← Agrégation & unified
    └────┬─────┘
         │
    ┌────┴─────┐
    │  Platforms  │  ← Sentry, Analytics, Browser APIs
    └────────────┘
```

---

## 🔥 Sentry - Error Tracking

### 🎯 Fonctionnalités

```typescript
// Initialisation automatique
MonitoringService.init()

// Capture d'erreurs manuelles
MonitoringService.captureException(error, context)

// Tags et contexte
MonitoringService.setTags({ user_type: 'premium' })
MonitoringService.setContext('feature', 'chat_interface')
```

### 📊 Types de Données Collectées

- **Erreurs JavaScript** automatiques et manuelles
- **Performance traces** avec timing des opérations
- **User sessions** avec identifiants et contexte
- **Network requests** avec statuts et durées
- **Breadcrumbs** de navigation utilisateur

### 🔧 Configuration

```typescript
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  maxBreadcrumbs: 50,
  autoSessionTracking: true,
})
```

---

## 📊 Analytics - User Behavior

### 🎯 Événements Tracking

```typescript
// Événements personnalisés
AnalyticsService.trackEvent('feature_used', {
  category: 'Engagement',
  feature: 'voice_recording',
  context: 'scenarios_page'
})

// Pages vues
AnalyticsService.pageView('/dashboard', 'Tableau de bord')

// Événements métier
AnalyticsService.trackScenarioStart('scenario_123', 'technical')
AnalyticsService.trackSessionEnd('scenario_123', 120, 15)
```

### 📡 Google Analytics 4

- **Configuration automatique** avec `VITE_GA_ID`
- **GDPR compliant** avec consentement
- **Fallback local** pour développement
- **Events personnalisés** pour CandiVoc

### 🔑 Types d'Événements

| Catégorie | Événement | Description |
|----------|----------|------------|
| `Engagement` | `scenario_started` | Lancement d'un scénario |
| `Engagement` | `scenario_completed` | Fin d'un scénario |
| `Session` | `session_started` | Début d'entraînement |
| `Monetization` | `subscription_success` | Abonnement réussi |
| `Feature` | `feature_used` | Utilisation d'une fonctionnalité |

---

## ⚡ Performance - Core Web Vitals

### 🎯 Métriques Collectées

```typescript
// Scores de performance
const score = PerformanceService.getPerformanceScore()
// { overall: 'good', lcp: 'good', fid: 'needs-improvement', cls: 'good' }

// Mesures personnalisées
PerformanceService.measureOperation('scenario_load', async () => {
  await loadScenario()
})
```

### 📈 Seuils Google Web Vitals

| Métrique | Bon | Moyen | Mauvais |
|-----------|------|--------|----------|
| **LCP** | ≤ 2.5s | ≤ 4s | > 4s |
| **FID** | ≤ 100ms | ≤ 300ms | > 300ms |
| **CLS** | ≤ 0.1 | ≤ 0.25 | > 0.25 |

### 🔍 Monitoring des Ressources

- **Scripts** : nombre, taille, durée
- **CSS** : optimisation et chargement
- **Images** : poids et formats
- **API calls** : latence et erreurs

---

## 🔧 Configuration et Déploiement

### 🌍 Variables d'Environnement

```bash
# .env.local
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_GA_ID=G-XXXXXXXXXX
VITE_APP_VERSION=1.4.0
VITE_BUILD_DATE=2024-12-27
```

### 🚫 Modes de Désactivation

Les services sont automatiquement désactivés en développement :

```typescript
if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
  console.log('🚫 Monitoring désactivé en développement')
  return
}
```

### 🔥 Integration dans l'Application

```typescript
// App.tsx
const App = () => {
  React.useEffect(() => {
    MonitoringService.init()
    AnalyticsService.init()
    PerformanceService.init()
  }, [])

  return (
    <MonitoringService.ErrorBoundary fallback={ErrorFallback}>
      <Router>
        <AppRoutes />
      </Router>
    </MonitoringService.ErrorBoundary>
  )
}
```

---

## 📱 Utilisation dans les Composants

### 🎯 Hook de Performance

```typescript
const MyComponent = () => {
  const measureRender = PerformanceService.measureComponentRender('MyComponent')

  return (
    <div>
      {/* contenu */}
    </div>
  )
}
```

### 🔍 Tracking Utilisateur

```typescript
const useAuthTracking = () => {
  useEffect(() => {
    if (user) {
      MonitoringService.setUser(user)
      AnalyticsService.setUserId(user.id)
    }
  }, [user])
}
```

### 📊 Métriques Métier

```typescript
const handleScenarioComplete = (scenarioId: string, duration: number) => {
  AnalyticsService.trackScenarioComplete(scenarioId, duration)
  PerformanceService.captureMetric('scenario_duration', duration, 'seconds')
  MonitoringService.setTags({ last_scenario: scenarioId })
}
```

---

## 📊 Tableaux de Bord Monitoring

### 🚨 Tableau de Bord Sentry

- **Erreurs en temps réel** : catégorisées par sévérité
- **Performance traces** : identification des goulots d'étranglement
- **User feedback** : évaluations automatiques et manuelles
- **Trends** : évolution des erreurs dans le temps

### 📈 Tableau de Bord Analytics

- **Funnels de conversion** : landing → inscription → abonnement
- **Utilisation par fonctionnalité** : fréquence d'utilisation par feature
- **Sessions actives** : temps moyen, nombre de scénarios
- **User segments** : comportements par type d'utilisateur

### ⚡ Tableau de Bord Performance

- **Core Web Vitals** : LCP, FID, CLS par version et device
- **Resource performance** : poids et temps de chargement des assets
- **API performance** : latence des endpoints critiques
- **Bundle analysis** : size et impact sur le temps de chargement

---

## 🔍 Debug et Development

### 📡 Export Local Analytics

```typescript
// En développement uniquement
if (import.meta.env.DEV) {
  AnalyticsService.exportLocalData()
  // Génère un CSV avec les événements locaux
}
```

### 🔧 Logs Structurés

```typescript
// Erreurs
🚨 Sentry Error: NetworkError + context

// Analytics
📊 Analytics Event: scenario_started + properties

// Performance
📊 Performance Metric: component_render_Dashboard = 45ms
```

### 📉 Visualisation des Données

```typescript
// Ajouter au endpoint de monitoring
app.get('/debug/analytics', (req, res) => {
  const data = localStorage.getItem('candivoc_analytics')
  res.json({ events: JSON.parse(data), timestamp: Date.now() })
})
```

---

## 🛡️ Sécurité et Confidentialité

### 🔐 Données Collectées

- **Sentry** : stack traces, contexte applicatif, métadonnées
- **Analytics** : interactions utilisateur, performance, events métier
- **Performance** : métriques techniques, timing des ressources
- **Aucune donnée personnelle sensible** : mots de passe, conversations privées

### 🔒 Anonymisation

```typescript
// Masquage automatique des IPs
beforeSend(event) {
  // Supprimer les 3 derniers octets de l'IP
  const anonymizedIp = request.ip.replace(/\d+$/, 'xxx')
  event.user.ip = anonymizedIp
}
```

### 🔑 Consentement GDPR

```typescript
// Bannière de consentement intégrée
AnalyticsService.setConsent(consentGiven)

// Désactivation immédiate si refus
if (!consent) {
  window.gtag('config', 'GA_ID', {
    privacy_features: { 'analytics_storage': 'denied' }
  })
}
```

---

## 🔧 Alertes et Notifications

### 🚨 Alertes Configurées

- **Erreurs critiques** : notification immédiate
- **Taux d'erreur > 5%** : alerte automatique
- **Performance dégradée** : score < 'needs-improvement'
- **Drop significatif** : réduction de trafic > 20%

### 📧 Notifications par Email

```typescript
// Configuration Sentry (dashboard Sentry.io)
- Erreurs critiques : immédiat
- Rapports quotidiens : résumé des erreurs
- Alertes de performance : seuils dépassés
```

---

## 📈 Métriques de Succès

### Objectifs Monitoring

| KPI | Cible | Actuel | Tendance |
|-----|--------|---------|----------|
| **Error Rate** | < 1% | ? | ⬇️ |
| **Performance Score** | > 90% | ? | ⬆️ |
| **User Engagement** | > 75% | ? | ➡️ |
| **Page Load Time** | < 3s | ? | ⬇️ |

### 📊 Reports Automatisés

- **Hebdomadaires** : synthèse performance et erreurs
- **Mensuels** : KPIs et tendances
- **Trimestriels** : évolutions majeures et objectifs
- **Incidents** : rapports post-incident

---

## 🚀 Bonnes Pratiques

### 📝 Intégration dans les Composants

```typescript
// Wrapper de composant avec monitoring
export const WithMonitoring = <P,>({ children }) => {
  const transaction = MonitoringService.useTransaction('ComponentRender', 'ui')

  React.useEffect(() => {
    transaction.start()
    return () => transaction.finish()
  })

  return <Component />
}
```

### 🔍 Tests de Monitoring

```typescript
// Tests unitaires des services
describe('AnalyticsService', () => {
  it('devrait envoyer les événements', () => {
    const mockGtag = vi.fn()
    window.gtag = mockGtag

    AnalyticsService.trackEvent('test')
    expect(mockGtag).toHaveBeenCalledWith('event', 'test', {})
  })
})
```

### 🔄 Migration et Rétrocompatibilité

```typescript
// Support des anciennes versions
const legacyTrackEvent = (name: string, props: any) => {
  // Convertir vers nouveau format
  AnalyticsService.trackEvent(name, {
    category: 'legacy',
    ...props
  })
}
```

---

## 🔨 Maintenance et Évolution

### 📅 Revues Quotidiennes

- **Dashboard Sentry** : erreurs et performance
- **Google Analytics** : tendances utilisateur
- **Performance monitoring** : Core Web Vitals
- **Error trends** : évolution des erreurs

### 🔄 Améliorations Continues

- **Nouveaux types d'événements** : fonctionnalités métier
- **Métriques personnalisées** : indicateurs de succès
- **Alertes prédictives** : identification proactive des problèmes
- **Tableaux de bord** : visualisations interactives

---

## 🔗 Ressources et Documentation

### 📚 Liens Utiles

- **Sentry Documentation** : https://docs.sentry.io/
- **Google Analytics 4** : https://developers.google.com/analytics/
- **Web Vitals Guide** : https://web.dev/vitals/
- **Performance API** : https://developer.mozilla.org/en-US/docs/Web/API/Performance

### 🛠️ Outils Développement

- **Sentry CLI** : `npm install @sentry/cli`
- **Analytics Debug** : Chrome Extension Google Analytics Debugger
- **Performance Audit** : Lighthouse de Chrome DevTools
- **Network Throttling** : DevTools pour simulation connexion lente

---

*Pour toute question sur l'implémentation ou l'optimisation du monitoring, n'hésitez pas à contacter l'équipe technique.*