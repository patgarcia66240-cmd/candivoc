// 🎭 Configuration Playwright pour les tests E2E - CandiVoc
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // 🎯 Timeout global pour les tests
  timeout: 30 * 1000,
  expect: {
    // 🕐 Timeout pour les assertions
    timeout: 5000
  },
  // 🔄 Retry en cas d'échec
  retries: 2,
  // 📁 Où trouver les tests
  testDir: './tests/e2e',
  // 📊 Rapports
  reporter: [
    ['html', { outputFolder: 'tests/e2e-results' }],
    ['json', { outputFile: 'tests/e2e-results/results.json' }],
    ['junit', { outputFile: 'tests/e2e-results/junit.xml' }],
    ['list']
  ],
  // 🔧 Fichiers à inclure/exclure
  testMatch: [
    '**/*.e2e.ts',
    '**/*.e2e.js',
    '**/*.spec.ts',
    '**/*.spec.js'
  ],
  // 📱 Navigateurs et appareils
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // 📱 Tests mobiles
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // 📱 Tests tablettes
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    },

    // 🌐 Tests avec différentes résolutions
    {
      name: 'Desktop Large',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'Desktop Small',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 },
      },
    }
  ],

  // 🏃‍♂️ Exécution en parallèle
  fullyParallel: true,
  // 🌐 Serveur de développement
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // 📸 Captures d'écran et vidéos
  use: {
    // 📸 Prendre des captures d'écran en cas d'échec
    screenshot: 'only-on-failure',
    // 🎥 Enregistrer des vidéos en cas d'échec
    video: 'retain-on-failure',
    // 🕐 Tempo d'attente pour les actions
    actionTimeout: 10000,
    // 🕐 Tempo d'attente pour la navigation
    navigationTimeout: 30000,
    // 🗂️ Dossier pour les traces
    trace: 'on-first-retry',
  },

  // 📁 Dossiers de sortie
  outputDir: 'tests/e2e-results/',
  // 🗂️ Dossiers pour les traces
  trace: 'on-first-retry',

  // 🎯 Variables globales
  globalSetup: require.resolve('./tests/e2e/global-setup.ts'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown.ts'),
});