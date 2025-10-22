# Scenarios Database Schema

Ce document décrit la structure de la base de données pour les scénarios d'entretien et comment utiliser les migrations.

## Structure des tables

### Table principale : `scenarios`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique du scénario |
| `title` | TEXT | Titre du scénario |
| `description` | TEXT | Description détaillée |
| `category` | scenario_category | Catégorie (technical, commercial, presentation, etc.) |
| `difficulty` | scenario_difficulty | Niveau de difficulté (beginner, intermediate, advanced) |
| `duration` | INTEGER | Durée estimée en minutes |
| `language` | TEXT | Langue du scénario (défaut: 'fr') |
| `instructions` | TEXT | Instructions pour l'utilisateur |
| `ai_personality` | TEXT | Description de la personnalité de l'IA |
| `created_by` | UUID | Référence au profil créateur (peut être NULL) |
| `is_public` | BOOLEAN | Si le scénario est visible publiquement |
| `is_active` | BOOLEAN | Si le scénario est actif (soft delete) |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Date de dernière mise à jour |

### Table secondaire : `evaluation_criteria`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique du critère |
| `scenario_id` | UUID | Référence au scénario parent |
| `name` | TEXT | Nom du critère d'évaluation |
| `description` | TEXT | Description du critère |
| `weight` | INTEGER | Poids du critère (1-100) |
| `type` | criteria_type | Type de critère (semantic, emotional, etc.) |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Date de dernière mise à jour |

## Types énumérés

### `scenario_category`
- `technical` : Scénarios techniques (entretiens de code, etc.)
- `commercial` : Scénarios commerciaux (vente, négociation)
- `presentation` : Scénarios de présentation
- `problem-solving` : Scénarios de résolution de problèmes
- `communication` : Scénarios de communication

### `scenario_difficulty`
- `beginner` : Niveau débutant
- `intermediate` : Niveau intermédiaire
- `advanced` : Niveau avancé

### `criteria_type`
- `semantic` : Évaluation du contenu et de la sémantique
- `emotional` : Évaluation des aspects émotionnels
- `fluency` : Évaluation de la fluidité verbale
- `relevance` : Évaluation de la pertinence
- `timing` : Évaluation de la gestion du temps

## Sécurité (Row Level Security)

### Politiques pour `scenarios`
- **Lecture publique** : Tout le monde peut lire les scénarios publics
- **Lecture privée** : Chaque utilisateur peut lire ses propres scénarios
- **Création** : Les utilisateurs authentifiés peuvent créer des scénarios
- **Modification** : Les utilisateurs peuvent modifier uniquement leurs scénarios
- **Suppression** : Les utilisateurs peuvent supprimer uniquement leurs scénarios

### Politiques pour `evaluation_criteria`
- **Lecture** : Accès basé sur les permissions du scénario parent
- **CRUD** : Gestion basée sur les permissions du scénario parent

## Comment appliquer les migrations

### Méthode 1 : Via le dashboard Supabase

1. Allez dans le dashboard Supabase de votre projet
2. Cliquez sur "SQL Editor" dans la barre latérale
3. Copiez-collez le contenu de `001_create_scenarios.sql`
4. Cliquez sur "Run"
5. Faites de même avec `002_insert_scenarios_data.sql`

### Méthode 2 : Via la CLI Supabase

```bash
# Installer la CLI Supabase si ce n'est pas déjà fait
npm install -g supabase

# Se connecter à votre projet
supabase login
supabase link --project-ref VOTRE_PROJET_REF

# Appliquer les migrations
supabase db push
```

### Méthode 3 : Via psql

```bash
# Connectez-vous à votre base de données
psql -h VOTRE_HOST -U postgres -d postgres

# Copiez-collez le contenu des fichiers SQL
```

## Données initiales

La migration `002_insert_scenarios_data.sql` insère 5 scénarios de démonstration :

1. **Entretien technique React** - Avancé, 45 minutes
2. **Vente de solution SaaS** - Intermédiaire, 30 minutes
3. **Présentation de projet** - Débutant, 20 minutes
4. **Résolution de conflit** - Intermédiaire, 25 minutes
5. **Analyse de cas pratique** - Avancé, 40 minutes

## Utilisation avec le service TypeScript

Le service `ScenariosService` dans `src/services/supabase/scenarios.ts` fournit des méthodes pour interagir avec la base de données :

```typescript
// Récupérer tous les scénarios publics
const { data, error } = await ScenariosService.getScenarios({ is_public: true });

// Récupérer un scénario spécifique avec ses critères
const scenario = await ScenariosService.getScenarioById('uuid');

// Créer un nouveau scénario
const newScenario = await ScenariosService.createScenario({
  title: "Mon scénario",
  description: "Description...",
  category: "technical",
  difficulty: "intermediate",
  duration: 30,
  instructions: "Instructions...",
  ai_personality: "Personnalité IA...",
  evaluation_criteria: [
    {
      name: "Critère 1",
      description: "Description du critère",
      weight: 30,
      type: "semantic"
    }
  ]
});
```

## Index de performance

Des index sont créés pour optimiser les performances :
- `idx_scenarios_category` : Filtrage par catégorie
- `idx_scenarios_difficulty` : Filtrage par difficulté
- `idx_scenarios_created_by` : Scénarios d'un utilisateur
- `idx_scenarios_is_public` : Scénarios publics
- `idx_scenarios_is_active` : Scénarios actifs
- `idx_evaluation_criteria_scenario_id` : Critères d'un scénario