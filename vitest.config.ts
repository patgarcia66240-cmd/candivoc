import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],

  test: {
    // 🌐 Environment pour les tests React
    environment: 'jsdom',

    // 🎯 Fichiers de setup
    setupFiles: ['./src/test/setup.ts'],

    // 📁 Patterns de fichiers de test
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],

    // 🚫 Exclusions
    exclude: [
      'node_modules/',
      'dist/',
      '.next/',
      'coverage/',
      'src/test/',
      '**/*.config.*',
      '**/*.d.ts'
    ],

    // 🔧 Globales
    globals: true,

    // 📊 Couverture de code
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/__tests__/**',
        '**/*.d.ts',
        '**/*.config.*',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'coverage/**',
        'dist/**'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },

    // ⚡ Performances
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 1
      }
    },

    // 🎨 UI de test
    ui: true,
    open: false,

    // 🔍 Watch mode
    watch: true,

    // 📝 Rapporteurs
    reporter: ['verbose', 'html'],

    // 🔄 Timeout
    testTimeout: 10000,
    hookTimeout: 10000
  },

  // 📁 Résolution des modules (compatible avec Vite)
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

  // 🔧 Définitions pour les tests
  define: {
    'import.meta.env.TEST': 'true'
  }
})