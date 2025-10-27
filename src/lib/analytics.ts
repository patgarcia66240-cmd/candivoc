// 📊 Service d'Analytics pour CandiVoc

interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  userId?: string
  value?: number
  timestamp?: number
}

interface PageView {
  page: string
  title?: string
  location?: string
}

interface UserProperties {
  [key: string]: any
}

export class AnalyticsService {
  private static isInitialized = false
  private static isConsentGiven = false

  // 🚀 Initialisation
  static init() {
    if (this.isInitialized) return

    // 🚫 Désactiver en développement
    if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
      console.log('🚫 Analytics désactivé en développement')
      return
    }

    // 🎯 Google Analytics 4
    if (import.meta.env.VITE_GA_ID) {
      this.initGA4()
    }

    // 🔥 Configuration alternative si nécessaire
    this.initAlternativeTracking()

    this.isInitialized = true
    console.log('✅ Analytics initialisé')
  }

  // 🎯 Google Analytics 4
  private static initGA4() {
    // Créer le script gtag
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_ID}`

    // Initialiser gtag global
    window.dataLayer = window.dataLayer || []
    window.gtag = function(...args) {
      window.dataLayer.push(args)
    }

    script.onload = () => {
      // Configurer GA4
      window.gtag('config', import.meta.env.VITE_GA_ID, {
        page_location: window.location.href,
        page_title: document.title,
        custom_map: {
          custom_parameter_1: 'parameter_1_value',
        },
      })

      console.log(`✅ Google Analytics configuré avec ID: ${import.meta.env.VITE_GA_ID}`)
    }

    document.head.appendChild(script)
  }

  // 🔥 Alternative analytics (simple localStorage)
  private static initAlternativeTracking() {
    if (!import.meta.env.VITE_GA_ID) {
      // Mode local pour développement
      console.log('📊 Analytics local mode activé')
      window.gtag = (action: string, config: any) => {
        console.log('📊 Analytics Event:', action, config)
        const events = JSON.parse(localStorage.getItem('candivoc_analytics') || '[]')
        events.push({
          action,
          config,
          timestamp: Date.now(),
          url: window.location.href,
        })
        localStorage.setItem('candivoc_analytics', JSON.stringify(events.slice(-100))) // Garder 100 derniers
      }
    }
  }

  // 🤝 Consentement GDPR
  static setConsent(consent: boolean) {
    this.isConsentGiven = consent

    if (consent && this.isInitialized) {
      this.trackEvent('analytics_consent_given', {
        method: 'banner',
      })
    }

    // Désactiver le suivi si pas de consentement
    if (!consent && window.gtag) {
      window.gtag('config', import.meta.env.VITE_GA_ID, {
        privacy_features: { 'analytics_storage': 'denied' }
      })
    }
  }

  // 📄 Page view
  static pageView(page: string, title?: string) {
    if (!this.isConsentGiven) return

    const pageData: PageView = {
      page,
      title: title || document.title,
      location: window.location.href,
    }

    this.trackEvent('page_view', pageData)
  }

  // 🎯 Événement personnalisé
  static trackEvent(event: string, properties?: AnalyticsEvent['properties']) {
    if (!this.isConsentGiven) return

    const eventData: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
    }

    if (window.gtag) {
      window.gtag('event', event, {
        event_category: properties?.category || 'User',
        event_label: properties?.label,
        value: properties?.value,
        custom_parameter_1: properties?.custom_param_1,
        custom_parameter_2: properties?.custom_param_2,
        non_interaction: properties?.nonInteraction,
      })
    }

    console.log('📊 Analytics Event:', eventData)
  }

  // 👤 Propriétés utilisateur
  static setUserProperties(properties: UserProperties) {
    if (!this.isConsentGiven) return

    if (window.gtag) {
      window.gtag('config', import.meta.env.VITE_GA_ID, {
        custom_map: properties,
      })

      this.trackEvent('user_properties_set', properties)
    }
  }

  // 👤 Identifiant utilisateur
  static setUserId(userId: string) {
    if (!this.isConsentGiven) return

    if (window.gtag) {
      window.gtag('config', import.meta.env.VITE_GA_ID, {
        user_id: userId,
      })
    }

    this.trackEvent('user_identified', { method: 'analytics_setUserId' })
  }

  // 🔄 Événements de tracking spécifiques à CandiVoc
  static trackScenarioStart(scenarioId: string, category: string) {
    this.trackEvent('scenario_started', {
      category: 'Engagement',
      label: 'Scenario Started',
      scenario_id: scenarioId,
      scenario_category: category,
    })
  }

  static trackScenarioComplete(scenarioId: string, duration: number, score?: number) {
    this.trackEvent('scenario_completed', {
      category: 'Engagement',
      label: 'Scenario Completed',
      scenario_id: scenarioId,
      duration_seconds: Math.round(duration),
      score: score,
    })
  }

  static trackSessionStart(scenarioId: string, isAI: boolean) {
    this.trackEvent('session_started', {
      category: 'Session',
      label: 'Session Started',
      scenario_id: scenarioId,
      session_type: isAI ? 'ai' : 'practice',
    })
  }

  static trackSessionEnd(scenarioId: string, duration: number, messagesCount: number) {
    this.trackEvent('session_ended', {
      category: 'Session',
      label: 'Session Ended',
      scenario_id: scenarioId,
      duration_seconds: Math.round(duration),
      messages_count: messagesCount,
    })
  }

  static trackSubscriptionAttempt(plan: string, source: string) {
    this.trackEvent('subscription_attempt', {
      category: 'Monetization',
      label: 'Subscription Attempt',
      plan,
      source,
    })
  }

  static trackSubscriptionSuccess(plan: string, value: number) {
    this.trackEvent('subscription_success', {
      category: 'Monetization',
      label: 'Subscription Success',
      plan,
      value,
    })
  }

  static trackFeatureUsage(feature: string, context?: string) {
    this.trackEvent('feature_used', {
      category: 'Feature',
      label: 'Feature Used',
      feature,
      context,
    })
  }

  static trackError(error: Error, context?: string) {
    this.trackEvent('error_occurred', {
      category: 'Error',
      label: 'Error Occurred',
      error_name: error.name,
      error_message: error.message,
      context,
      url: window.location.href,
    })
  }

  static trackPerformance(metric: string, value: number, unit?: string) {
    this.trackEvent('performance_metric', {
      category: 'Performance',
      label: 'Performance Metric',
      metric,
      value,
      unit,
    })
  }

  // 📊 Export des données locales (développement)
  static exportLocalData() {
    if (import.meta.env.DEV) {
      const data = localStorage.getItem('candivoc_analytics')
      if (data) {
        const events = JSON.parse(data)
        console.table(events)

        // Créer un CSV
        interface LocalAnalyticsEvent {
          action: string
          config: Record<string, any>
          timestamp: number
          url: string
        }

        const eventsTyped = events as LocalAnalyticsEvent[]

        const csv = [
          'Timestamp,Event,Properties,URL',
          ...eventsTyped.map(e =>
            `${new Date(e.timestamp).toISOString()},${e.action},${JSON.stringify(e.config)},"${e.url}"`
          )
        ].join('\n')

        console.log('📊 Analytics CSV:', csv)

        // Télécharger le CSV
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `candivoc_analytics_${Date.now()}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }
    }
  }
}

// 🔧 Extensions TypeScript pour window
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

export default AnalyticsService