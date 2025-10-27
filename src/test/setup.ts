import '@testing-library/jest-dom'
import { vi } from 'vitest'

// 🎭 Mocks globaux pour les tests

// 📱 Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // déprécié
    removeListener: vi.fn(), // déprécié
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// 📱 Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 📱 Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 🔊 Mock Web Audio API
global.AudioContext = vi.fn().mockImplementation(() => ({
  createAnalyser: vi.fn().mockReturnValue({
    frequencyBinCount: 1024,
    getByteFrequencyData: vi.fn(),
  }),
  createMediaStreamSource: vi.fn(),
  createScriptProcessor: vi.fn(),
  sampleRate: 44100,
}))

// 🎤 Mock MediaRecorder
global.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  state: 'inactive',
  stream: new MediaStream(),
})) as any

// 🎤 Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getAudioTracks: () => [],
      getVideoTracks: () => [],
      getTracks: () => [],
    }),
  },
})

// 🔊 Mock SpeechRecognition
global.SpeechRecognition = vi.fn().mockImplementation(() => ({
  continuous: true,
  interimResults: true,
  lang: 'fr-FR',
  start: vi.fn(),
  stop: vi.fn(),
  onresult: null,
  onerror: null,
  onend: null,
})) as any

// 📊 Mock Service Worker
global.navigator.serviceWorker = {
  register: vi.fn().mockResolvedValue({
    installing: null,
    waiting: null,
    active: null,
  }),
  ready: Promise.resolve({
    addEventListener: vi.fn(),
  }),
}

// 🗄️ Mock Supabase
vi.mock('@/services/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockResolvedValue({ data: null, error: null }),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })),
  },
}))

// 🤖 Mock AI Service
vi.mock('@/services/ai/aiService', () => ({
  aiService: {
    generateResponse: vi.fn().mockResolvedValue({
      success: true,
      data: { message: 'Mock AI response' }
    }),
    testConnection: vi.fn().mockResolvedValue({
      success: true,
      message: 'Connection test successful'
    }),
  },
}))

// 💳 Mock Stripe
vi.mock('@/services/stripe', () => ({
  stripeService: {
    createCheckoutSession: vi.fn().mockResolvedValue({
      success: true,
      data: { url: 'https://checkout.stripe.com/mock' }
    }),
  },
}))

// 🔔 Mock Notifications API
global.Notification = vi.fn().mockImplementation(() => ({
  permission: 'granted',
  requestPermission: vi.fn().mockResolvedValue('granted'),
})) as any

Object.defineProperty(global, 'Notification', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    permission: 'granted',
    requestPermission: vi.fn().mockResolvedValue('granted'),
  })),
})

// 📊 Mock Performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
  },
})

// 🎨 Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: localStorageMock,
})

// 🎨 Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
})

// 🎯 Mock fetch global
global.fetch = vi.fn()

// 📱 Mock location API
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    ...window.location,
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
})

// 🔧 Environnement de test
Object.defineProperty(window, 'import', {
  writable: true,
  value: {
    meta: {
      env: {
        TEST: true,
        DEV: false,
        PROD: false,
        VITE_SUPABASE_URL: 'http://mock-supabase.com',
        VITE_SUPABASE_ANON_KEY: 'mock-key',
        VITE_OPENAI_API_KEY: 'mock-openai-key',
      }
    }
  }
})

// 🧹 Nettoyage après chaque test
afterEach(() => {
  vi.clearAllMocks()
  localStorageMock.clear()
  // Supprimer les console.error et console.warn pour les tests (erreurs attendues)
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})