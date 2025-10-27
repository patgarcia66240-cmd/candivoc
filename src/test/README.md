# 🧪 Guide de Testing - CandiVoc

Ce guide explique comment utiliser la configuration de testing mise en place avec Vitest et React Testing Library.

---

## 🛠️ Stack de Testing

### Technologies utilisées :
- **Vitest** : Framework de tests rapide et moderne
- **React Testing Library** : Tests de composants React
- **jsdom** : Environnement DOM simulé
- **@testing-library/user-event** : Simulations d'interactions utilisateur
- **@testing-library/jest-dom** : Matchers customisés

---

## 📁 Structure des Tests

```
src/
├── test/
│   ├── setup.ts              # Configuration globale des tests
│   └── README.md             # Ce guide
├── hooks/
│   └── __tests__/
│       └── useScenarios.test.ts # Tests des hooks
├── components/
│   └── ui/
│       └── __tests__/
│           └── Input.test.tsx    # Tests des composants
└── services/
    └── settings/
        └── SettingsManager.test.ts # Tests des services
```

---

## 🚀 Scripts Disponibles

```bash
# Lancer les tests en mode watch
npm run test

# Lancer tous les tests une fois
npm run test:run

# Générer un rapport de couverture
npm run test:coverage

# Lancer l'interface UI des tests
npm run test:ui

# Mode watch continu
npm run test:watch

# Exécuter les tests en CI
npm run test:ci
```

---

## 🧪 Écrire des Tests

### Tests de Composants

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('devrait afficher le texte fourni', () => {
    render(<Button>Cliquez ici</Button>)

    expect(screen.getByRole('button', { name: 'Cliquez ici' })).toBeInTheDocument()
  })

  it('devrait appeler onClick au clic', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Cliquez ici</Button>)

    await user.click(screen.getByRole('button', { name: 'Cliquez ici' }))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Tests de Hooks

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useScenarios } from '@/hooks/useScenarios'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
)

describe('useScenarios', () => {
  it('devrait charger les scénarios', async () => {
    const { result } = renderHook(() => useScenarios(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toEqual([])
    })
  })
})
```

### Tests de Services

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { scenariosService } from '@/services/api/scenarios'

describe('scenariosService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devrait récupérer les scénarios', async () => {
    const mockScenarios = [{ id: '1', title: 'Test' }]

    vi.mocked(someApiCall).mockResolvedValue(mockScenarios)

    const result = await scenariosService.getAllScenarios()

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockScenarios)
  })
})
```

---

## 🎭 Mocks et Setup

### Mocks automatiques inclus :

```typescript
// 📱 Web APIs
Object.defineProperty(window, 'matchMedia', { ... })
global.IntersectionObserver = vi.fn()
global.ResizeObserver = vi.fn()

// 🔊 Audio APIs
global.AudioContext = vi.fn()
global.MediaRecorder = vi.fn()
global.SpeechRecognition = vi.fn()

// 🗄️ Storage
Object.defineProperty(window, 'localStorage', { ... })

// 🤖 Services externes
vi.mock('@/services/ai/aiService')
vi.mock('@/services/supabase/client')
vi.mock('@/services/stripe')
```

### Mock personnalisé :

```tsx
import { vi } from 'vitest'

// Mock d'un module
vi.mock('@/services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  }
}))

// Mock d'une fonction spécifique
const mockFetch = vi.fn()
global.fetch = mockFetch
```

---

## 🔍 Bonnes Pratiques

### 1. Structure des tests

```tsx
describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Fonctionnalité X', () => {
    it('devrait faire Y', () => {
      // Test
    })
  })
})
```

### 2. Tests accessibles

```tsx
// ✅ Bon : tester ce que l'utilisateur voit
it('devrait afficher le message d\'erreur', () => {
  render(<Component error="Erreur réseau" />)
  expect(screen.getByText('Erreur réseau')).toBeInTheDocument()
})

// ❌ Éviter : tester l'implémentation
it('devrait avoir la classe error', () => {
  render(<Component error="Erreur réseau" />)
  expect(screen.getByRole('alert').className).toContain('error')
})
```

### 3. Simulations utilisateur

```tsx
// ✅ Bon : utiliser userEvent
import userEvent from '@testing-library/user-event'

test('form submission', async () => {
  const user = userEvent.setup()
  render(<MyForm />)

  await user.type(screen.getByLabelText('Email'), 'test@example.com')
  await user.click(screen.getByRole('button', { name: 'Envoyer' }))

  expect(mockSubmit).toHaveBeenCalledWith({ email: 'test@example.com' })
})
```

### 4. Queries prioritaires

```tsx
// Ordre de priorité (du plus spécifique au moins) :

// 1. Par rôle et texte
screen.getByRole('button', { name: 'Envoyer' })

// 2. Par texte
screen.getByText('Envoyer')

// 3. Par placeholder
screen.getByPlaceholderText('Entrez votre email')

// 4. Par label
screen.getByLabelText('Email')

// 5. Par test ID (éviter si possible)
screen.getByTestId('submit-button')
```

---

## 🐛 Débogage des Tests

### Problèmes courants :

1. **Act waiting error** : Ajouter `waitFor`
```tsx
await waitFor(() => {
  expect(screen.getByText('Chargé')).toBeInTheDocument()
})
```

2. **Multiple elements found** : Utiliser `getByRole` avec filtres
```tsx
screen.getByRole('button', { name: 'Sauvegarder' })
```

3. **Element not found** : Vérifier les composants conditionnels
```tsx
// Utiliser findBy pour les éléments asynchrones
const button = await screen.findByRole('button', { name: 'Charger' })
```

### Debug helpers :

```tsx
import { screen, prettyDOM } from '@testing-library/react'

// Afficher le DOM
screen.debug()

// Afficher un élément spécifique
screen.debug(screen.getByRole('button'))

// Afficher le DOM formaté
console.log(prettyDOM(container))
```

---

## 📊 Couverture de Code

### Configuration actuelle :

```json
{
  "thresholds": {
    "global": {
      "branches": 70,
      "functions": 70,
      "lines": 70,
      "statements": 70
    }
  }
}
```

### Rapport de couverture :

```bash
npm run test:coverage

# Ouvre le rapport HTML
npx vite preview --outDir html
```

### Fichiers exclus de la couverture :

- Fichiers de test (`**/*.test.*`, `**/__tests__/**`)
- Fichiers de configuration (`**/*.config.*`)
- Fichiers de types (`**/*.d.ts`)
- Dossiers de build (`dist/`, `coverage/`)

---

## 🔧 Tests Intégration (E2E)

### Préparation pour tests E2E :

```ts
// vitest.e2e.config.ts (à créer)
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/e2e/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/test/e2e.setup.ts']
  }
})
```

---

## 🚀 CI/CD Integration

### Scripts pour pipeline :

```bash
# Tests + couverture
npm run test:ci

# Générer rapport JUnit pour CI
npm run test:run -- --reporter=junit --outputFile=junit.xml
```

### GitHub Actions example :

```yaml
- name: Tests
  run: npm run test:run

- name: Coverage
  run: npm run test:coverage
  uses: codecov/codecov-action@v3
```

---

## 📚 Ressources Utiles

### Documentation :
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [User Event Documentation](https://testing-library.com/docs/user-event/overview)

### Playgrounds :
- [Vitest + React Playground](https://stackblitz.com/edit/vitest-react-starter)

### Extensions VS Code :
- Vitest
- Testing Library VSCode
- Coverage Gutters

---

## ✨ Checklist de Testing

- [ ] Le test est **lisible** et **compréhensible**
- [ ] Le test vérifie le **comportement utilisateur**, pas l'implémentation
- [ ] Le test utilise des **queries accessibles** (byRole, byLabelText)
- [ ] Le test simule des **interactions réelles** (userEvent)
- [ ] Le test est **isolé** (pas de dépendances externes)
- [ ] Le test a des **assertions claires**
- [ ] Le test gère les **états de loading/erreur**
- [ ] Le test est **maintenable** et **évolutif**

---

*N'hésitez pas à demander de l'aide ou des clarifications sur la configuration de testing !*