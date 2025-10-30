import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

// 🎯 Configuration Vite optimisée pour CandiVoc
export default defineConfig({
  plugins: [
    react(),
    // 🚫 Désactiver PWA pour Storybook pour éviter les erreurs de build
    ...(process.env.NODE_ENV !== 'storybook' ? [
      VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff2,woff,ttf,eot}',
          '**/*.{json,webmanifest}',
          'assets/**/*',
          'images/**/*'
        ],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          // 🧠 API OpenAI - NetworkFirst avec fallback
          {
            urlPattern: /^https:\/\/api\.openai\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'openai-api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 12 // 12 hours
              }
            }
          },
          // 🗄️ API Supabase - NetworkFirst avec fallback hors ligne
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              networkTimeoutSeconds: 8,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 30 // 30 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // 🎨 Assets statiques - CacheFirst avec longue durée
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          // 📄 Fonts - CacheFirst permanente
          {
            urlPattern: /\.(?:woff2|woff|ttf|eot)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          // 🎭 CSS et JS - StaleWhileRevalidate
          {
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          },
          // 📊 Fichiers JSON et données - NetworkFirst
          {
            urlPattern: /\.(?:json)$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'json-data-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 2 // 2 hours
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'CandiVoc - Entraînement IA Entretiens',
        short_name: 'CandiVoc',
        description: 'Application d\'entraînement vocal avec IA pour préparer vos entretiens d\'embauche',
        theme_color: '#f97316',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
    ] : []),
  ],

  // 🔥 Optimisations build avancées
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2015',

    // 📦 Code splitting intelligent basé sur l'analyse du code
    rollupOptions: {
      output: {
        // 🎯 Chunks optimisées selon l'utilisation
        manualChunks: (id) => {
          // 🏠 Page d'accueil et marketing
          if (id.includes('Landing') || id.includes('pages/Landing')) {
            return 'landing';
          }

          // 🎛️ Tableau de bord
          if (id.includes('Dashboard') || id.includes('pages/Dashboard')) {
            return 'dashboard';
          }

          // ⚙️ Page settings (très volumineuse)
          if (id.includes('Settings') || id.includes('pages/Settings')) {
            return 'settings';
          }

          // 💬 Chat et communication vocale (features premium)
          if (id.includes('Chat') ||
              id.includes('chat/') ||
              id.includes('VoiceChatInterface') ||
              id.includes('AudioRecorder') ||
              id.includes('LiveTranscription') ||
              id.includes('WaveformVisualizer')) {
            return 'chat-features';
          }

          // 💳 Paiements et abonnements
          if (id.includes('Pricing') ||
              id.includes('Payment') ||
              id.includes('stripe') ||
              id.includes('PricingSection') ||
              id.includes('PricingCard')) {
            return 'payment';
          }

          // 🎭 Scénarios et simulations
          if (id.includes('Scenario') ||
              id.includes('scenarios/') ||
              id.includes('Session')) {
            return 'scenarios';
          }

          // 🔐 Authentification
          if (id.includes('auth/') ||
              id.includes('authContext') ||
              id.includes('useAuth')) {
            return 'auth';
          }

          // 🎵 Services audio (lourd)
          if (id.includes('audio/') ||
              id.includes('audioService') ||
              id.includes('SpeechRecognition')) {
            return 'audio-services';
          }

          // 🤖 Services IA
          if (id.includes('ai/') ||
              id.includes('aiService')) {
            return 'ai-services';
          }

          // 🗄️ Services Supabase
          if (id.includes('supabase/') && !id.includes('auth/')) {
            return 'supabase-services';
          }

          // 🎨 Bibliothèques UI
          if (id.includes('@radix-ui') ||
              id.includes('lucide-react') ||
              id.includes('@heroicons')) {
            return 'ui-libraries';
          }

          // 📦 Vendors React principaux
          if (id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router-dom')) {
            return 'react-vendor';
          }

          // 🧪 Tests et développement
          if (id.includes('test') ||
              false) {
            return 'test-utils';
          }

          // 🛠️ Configuration et erreurs
          if (id.includes('ConfigError') ||
              id.includes('config')) {
            return 'config';
          }
        },

        // 🎯 Noms de fichiers optimisés pour cache
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            const fileName = facadeModuleId.split('/').pop()?.replace('.tsx', '')
            return `chunks/${fileName}-[hash].js`
          }
          return 'chunks/[name]-[hash].js'
        },

        entryFileNames: 'entries/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',

        // ⚡ Optimisation taille des chunks
        compact: true
      },

      // 🔧 Optimisations spécifiques
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false
      }
    },

    // 📏 Limites de taille des chunks
    chunkSizeWarningLimit: 800,
    assetsInlineLimit: 4096,

    // 🎯 Compression avancée
    minify: 'terser'
  },

  // 🔧 Résolution intelligente des modules
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@services': resolve(__dirname, 'src/services'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@contexts': resolve(__dirname, 'src/contexts'),
      '@lib': resolve(__dirname, 'src/lib')
    }
  },

  // ⚡ Optimisations dépendances
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js'
    ],
    exclude: [
      // Exclure les gros bundles du pre-bundling
      '@radix-ui/react-dialog',
      '@radix-ui/react-toast'
    ]
  },

  // 🎯 Configuration serveur développement avec sécurité
  server: {
    port: 3000,
    open: true,
    cors: true,
    preTransformRequests: true,
    headers: {
      // 🔐 Headers de sécurité pour le développement
      'Content-Security-Policy': [
        "default-src 'self';",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
        "font-src 'self' https://fonts.gstatic.com data:;",
        "img-src 'self' data: https:;",
        "connect-src 'self' https://api.openai.com https://api.stripe.com https://*.supabase.co wss://*.supabase.co ws://localhost:* ws://127.0.0.1:*;",
        "worker-src 'self' blob:;",
        "media-src 'self' blob:;",
        "object-src 'none';",
        "base-uri 'self';",
        "form-action 'self';",
        "frame-ancestors 'none';"
      ].join(' '),

      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  },

  // 📊 Configuration preview avec sécurité
  preview: {
    port: 4173,
    open: true,
    headers: {
      'Content-Security-Policy': [
        // 🔒 Politique CSP restrictive pour production
        "default-src 'self';",
        "script-src 'self' 'unsafe-inline' https://js.stripe.com https://checkout.stripe.com;",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
        "font-src 'self' https://fonts.gstatic.com data:;",
        "img-src 'self' data: https: https://avatars.githubusercontent.com;",
        "connect-src 'self' https://api.openai.com https://api.stripe.com https://*.supabase.co wss://*.supabase.co;",
        "worker-src 'self' blob:;",
        "media-src 'self' blob:;",
        "object-src 'none';",
        "base-uri 'self';",
        "form-action 'self';",
        "frame-ancestors 'none';",
        "upgrade-insecure-requests;"
      ].join(' '),

      // 🛡️ Autres headers de sécurité
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
  },

  // 🎨 CSS optimisé
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  }
})