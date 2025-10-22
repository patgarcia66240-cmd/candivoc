# Mise à jour des champs de contenu des scénarios

Ce document explique comment ajouter les champs `context`, `mise_en_situation`, `questions_typiques`, et `objectifs` à la table `scenarios`.

## Nouveaux champs ajoutés

| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `context` | TEXT | Contexte général du scénario d'entretien | "Vous êtes développeur React senior..." |
| `mise_en_situation` | TEXT | Description détaillée de la situation | "L'entreprise recherche quelqu'un..." |
| `questions_typiques` | TEXT | Types de questions typiques | "Préparez-vous à parler de React..." |
| `objectifs` | TEXT | Objectifs d'apprentissage | "Démontrez votre expertise technique..." |

## Comment appliquer les migrations

### Option 1: Script complet (recommandé)

Utilisez le fichier `complete_scenario_content_update.sql` qui contient toutes les modifications en une seule fois :

1. Allez dans le dashboard Supabase
2. Cliquez sur "SQL Editor"
3. Copiez-collez le contenu de `complete_scenario_content_update.sql`
4. Exécutez le script

### Option 2: Migration par étapes

Si vous préférez exécuter les migrations séparément :

1. **Étape 1** - Ajouter les champs :
   ```sql
   -- Exécutez 003_add_scenario_content_fields.sql
   ```

2. **Étape 2** - Mettre à jour les données :
   ```sql
   -- Exécutez 004_update_scenarios_content.sql
   ```

### Option 3: Via CLI Supabase

```bash
# Si vous utilisez la CLI Supabase
supabase db push
```

## Données mises à jour

Les 5 scénarios existants seront automatiquement mis à jour avec :

### Scénario 1: Entretien technique React
- **Contexte**: "Vous êtes développeur React senior et vous passez un entretien pour un poste de Lead Developer."
- **Mise en situation**: "L'entreprise recherche quelqu'un pour diriger une équipe de 5 développeurs sur un projet de plateforme e-commerce."
- **Questions typiques**: "Préparez-vous à parler de votre expérience avec React, votre approche du leadership technique, et comment vous gérez les défis d'équipe."
- **Objectifs**: "Démontrez votre expertise technique, vos qualités de leadership, et votre capacité à résoudre des problèmes complexes."

### Scénario 2: Vente de solution SaaS
- **Contexte**: "Simulation d'un appel commercial pour vendre une solution SaaS à un client potentiel."
- **Mise en situation**: "Un prospect intéressé mais prudent, qui pose beaucoup de questions."
- **Questions typiques**: "Préparez-vous à présenter les avantages et à gérer les objections."
- **Objectifs**: "Entraînez-vous à présenter les avantages et à gérer les objections."

### Scénario 3: Présentation de projet
- **Contexte**: "Présentez un projet que vous avez réalisé."
- **Mise en situation**: "Un manager bienveillant qui s'intéresse à votre parcours et vos réalisations."
- **Questions typiques**: "Choisissez un projet significatif que vous avez réalisé et présentez-le de manière structurée : contexte, objectifs, méthodologie, résultats."
- **Objectifs**: "Cette simulation vous aidera à structurer votre présentation et à répondre aux questions."

### Scénario 4: Résolution de conflit
- **Contexte**: "Simulation d'une situation de conflit en équipe."
- **Mise en situation**: "Un collègue frustré mais ouvert à la discussion."
- **Questions typiques**: "Un conflit a éclaté dans votre équipe. Médiez la situation et proposez des solutions pour apaiser les tensions."
- **Objectifs**: "Apprenez à gérer les tensions et à trouver des solutions constructives."

### Scénario 5: Analyse de cas pratique
- **Contexte**: "Résolvez un problème complexe en expliquant votre raisonnement."
- **Mise en situation**: "Un consultant senior qui évalue votre capacité d'analyse"
- **Questions typiques**: "Analysez le cas présenté, identifiez les problèmes clés et proposez des solutions structurées avec justifications."
- **Objectifs**: "Idéal pour les postes d'analyse et de consulting."

## Mises à jour du code

Les fichiers suivants ont été mis à jour pour supporter ces nouveaux champs :

### Types TypeScript
- `src/types/scenarios.ts` : Interfaces mises à jour avec les nouveaux champs

### Services
- `src/services/supabase/scenarios.ts` : Méthodes CRUD mises à jour

### Migration de la page Session.tsx
La page `Session.tsx` utilise actuellement les données locales de `getScenariosData()`. Après l'application de ces migrations, vous pourrez remplacer ces données par des appels au service Supabase.

## Vérification

Après avoir appliqué la migration, vous pouvez vérifier que les données ont été correctement mises à jour avec cette requête :

```sql
SELECT
    id,
    title,
    context,
    mise_en_situation,
    questions_typiques,
    objectifs,
    updated_at
FROM scenarios
WHERE is_active = true
ORDER BY created_at;
```

## Impact

- ✅ **Rétrocompatible** : Les champs sont optionnels, donc les scénarios existants continuent de fonctionner
- ✅ **Données enrichies** : Contenu plus détaillé pour chaque scénario
- ✅ **Support complet** : Services et types mis à jour
- ✅ **Migration automatique** : Les 5 scénarios existants sont automatiquement enrichis