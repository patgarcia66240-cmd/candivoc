# 🎨 Système de Thèmes Unifié CandiVoc

## Vue d'ensemble

Ce document décrit le système de thèmes unifié de CandiVoc, qui combine la puissance de Tailwind CSS avec des tokens de design personnalisés pour une expérience utilisateur cohérente.

## 🏗️ Architecture

### Fichiers principaux
```
src/
├── tokens/designTokens.ts     # Tokens de design (couleurs, espacements, etc.)
├── styles/theme.css           # Variables CSS et utilitaires de thème
├── providers/ThemeProviderComponent.tsx  # Logique du fournisseur de thème
├── contexts/ThemeContextDefinition.tsx   # Contexte React pour le thème
├── components/ui/
│   └── ThemeToggle.tsx        # Composant de basculement de thème
└── tailwind.config.js         # Configuration Tailwind avec `darkMode: 'class'`
```

## 🎯 Thèmes disponibles

### 1. **Light Theme** (par défaut)
- Fond : `#fafafa` (très clair)
- Texte : `#0a0a0a` (très foncé)
- Primaire : `#0284c7` (bleu vif)

### 2. **Dark Theme**
- Fond : `#0f172a` (bleu nuit)
- Texte : `#f5f5f5` (très clair)
- Primaire : `#0ea5e9` (bleu clair)

### 3. **System Theme**
- Détecte automatiquement la préférence du navigateur
- Applique le thème clair ou sombre selon `prefers-color-scheme`

## 🔧 Fonctionnalités

### Mode de détection
```typescript
type Theme = 'light' | 'dark' | 'system'
```

### Gestion d'état
- **LocalStorage** : Sauvegarde le choix de l'utilisateur
- **Détection système** : Écoute les changements de préférence
- **Transitions fluides** : 300ms pour tous les changements de thème

### Variables CSS injectées
Le système injecte dynamiquement des variables CSS :
```css
:root {
  --color-background: #fafafa;
  --color-foreground: #0a0a0a;
  --color-primary: #0284c7;
  --color-primary-foreground: #f0f9ff;
  /* ...etc */
}
```

## 🎨 Utilisation dans les composants

### Classes Tailwind
```jsx
// Utilisation des classes natives Tailwind
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <button className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2">
    Bouton thématique
  </button>
</div>
```

### Variables CSS
```jsx
// Utilisation des variables CSS personnalisées
<div className="themed-card" style={{
  backgroundColor: 'var(--color-background)',
  color: 'var(--color-foreground)'
 }}>
  Contenu thématique
</div>
```

### Hook React
```jsx
import { useTheme } from '@/contexts/ThemeContextDefinition';

function MyComponent() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  return (
    <div>
      <p>Thème actuel: {theme} (résolu: {resolvedTheme})</p>
      <button onClick={toggleTheme}>Basculer</button>
    </div>
  );
}
```

## 🛠️ Personnalisation

### Ajouter une nouvelle couleur
1. **Dans `designTokens.ts`**:
```typescript
colors: {
  primary: {
    // ...existant
    950: '#172554'  // Ajouter une nouvelle nuance
  }
}
```

2. **Dans `theme.css`**:
```css
:root {
  --color-primary-950: #172554;
}

html.dark {
  --color-primary-950: #1e3a8a;
}
```

### Créer un nouveau thème
```typescript
// Dans designTokens.ts
export const themes = {
  // ...existants
  corporate: {
    colors: {
      background: '#ffffff',
      foreground: '#1a1a1a',
      primary: '#1e40af',
      // ...etc
    }
  }
}
```

## 🔍 Debug et Test


### Test manuel
1. Aller sur `http://localhost:3002/`
2. Se connecter à l'application
3. Utiliser le bouton ThemeToggle (🌙/☀️) en haut à droite

### Console logging
Le système loggue les changements de thème :
```
🎨 Thème appliqué: dark (mode: dark)
🎨 Couleurs du thème: { background: "#0f172a", primary: "#0ea5e9", ... }
```

## 📱 Performance

### Optimisations
- **CSS Variables** : Changements de thème instantanés
- **Tailwind CSS** : Classes purgées automatiquement
- **LocalStorage** : Sauvegarde instantanée sans rechargement
- **Transitions CSS** : Animations fluides de 300ms

### Bundle size
- Variables CSS : ~2KB (minifié)
- Logique React : ~4KB (minifié + gzippé)
- Impact global : <1% sur le bundle total

## 🚨 Bonnes pratiques

### ✅ À faire
- Utiliser les classes `dark:` de Tailwind pour la plupart des cas
- Préférer les variables CSS pour les composants complexes
- Tester les thèmes clair et sombre
- Maintenir un contraste WCAG AA minimum

### ❌ À éviter
- Créer des couleurs hardcodées dans les composants
- Utiliser !important sur les variables de thème
- Ignorer les préférences système de l'utilisateur
- Oublier de tester les transitions

## 🔧 Maintenance

### Mise à jour des couleurs
1. Modifier `designTokens.ts`
2. Synchroniser avec `tailwind.config.js`
3. Vérifier `theme.css`
4. Tester visuellement

### Ajout de tokens
1. Ajouter dans `designTokens.ts`
2. Créer les variables CSS correspondantes
3. Documenter l'utilisation
4. Ajouter aux tests si nécessaire

---

**Dernière mise à jour** : 29/10/2025
**Version** : 1.0.0
**Auteur** : Claude Code Assistant