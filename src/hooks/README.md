# 📊 Guide de Migration vers React Query

Ce guide explique comment migrer les appels API existants vers React Query pour améliorer les performances et l'expérience utilisateur.

---

## 🎯 Pourquoi React Query ?

### Avantages principaux :
- **Cache intelligent** : Les données sont mises en cache automatiquement
- **Background updates** : Les données se rafraîchissent en arrière-plan
- **Optimistic updates** : UI instantanée avec rollback si erreur
- **Retry automatique** : Gestion intelligente des erreurs réseau
- **DevTools** : Debug complet des requêtes et mutations

---

## 🔄 Exemple de Migration

### ❌ Avant (sans React Query)

```typescript
// Dans un composant classique
const [scenarios, setScenarios] = useState<Scenario[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchScenarios = async () => {
    setLoading(true);
    try {
      const response = await scenariosService.getAllScenarios();
      if (response.success) {
        setScenarios(response.data || []);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  fetchScenarios();
}, []);

const handleCreate = async (scenario: CreateScenarioInput) => {
  try {
    const response = await scenariosService.createScenario(scenario);
    if (response.success) {
      setScenarios(prev => [...prev, response.data!]);
    }
  } catch (err) {
    console.error(err);
  }
};
```

### ✅ Après (avec React Query)

```typescript
// Avec les hooks React Query
import { useScenarios, useCreateScenario } from '@/hooks/useScenarios';

const MyComponent = () => {
  const {
    data: scenarios = [],
    isLoading,
    error,
    refetch
  } = useScenarios({ category: 'technical' });

  const createScenarioMutation = useCreateScenario();

  const handleCreate = async (scenario: CreateScenarioInput) => {
    createScenarioMutation.mutate(scenario);
  };

  // Le reste du composant...
};
```

---

## 🚀 Points Clés de la Migration

### 1. Remplacer `useState` + `useEffect` par `useQuery`

```typescript
// ❌ Ancienne méthode
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
useEffect(() => {
  // fetch logic...
}, []);

// ✅ Nouvelle méthode
const { data = [], isLoading, error } = useQuery({
  queryKey: ['key'],
  queryFn: fetchData
});
```

### 2. Utiliser les mutations pour les actions

```typescript
// ❌ Ancienne méthode
const handleAction = async () => {
  setLoading(true);
  try {
    await apiCall();
    // mettre à jour l'état manuellement
  } finally {
    setLoading(false);
  }
};

// ✅ Nouvelle méthode
const mutation = useMutation({
  mutationFn: apiCall,
  onSuccess: () => {
    // invalidation automatique
    queryClient.invalidateQueries(['key']);
  }
});

const handleAction = () => mutation.mutate();
```

### 3. Profiter du cache et du préchargement

```typescript
// Précharger des données
const prefetchData = usePrefetchScenarios();
prefetchData(userId);

// Cache configuré automatiquement
const { data } = useQuery({
  queryKey: ['key'],
  queryFn: fetchData,
  staleTime: 1000 * 60 * 5 // 5 minutes de cache
});
```

---

## 📚 Hooks Disponibles

### Scénarios
- `useScenarios(filters?)` - Liste des scénarios
- `useScenario(id)` - Scénario spécifique
- `useScenariosByCategory(category)` - Scénarios par catégorie
- `useScenariosByDifficulty(difficulty)` - Scénarios par difficulté
- `useCreateScenario()` - Créer un scénario
- `useUpdateScenario()` - Mettre à jour un scénario
- `useDeleteScenario()` - Supprimer un scénario

### Sessions
- `useUserSessions(userId)` - Sessions utilisateur
- `useSession(id)` - Session spécifique
- `useSessionEvaluation(sessionId)` - Évaluation de session
- `useCreateSession()` - Créer une session
- `useUpdateSession()` - Mettre à jour une session
- `useEndSession()` - Terminer une session
- `useGenerateEvaluation()` - Générer une évaluation

---

## 🎯 Bonnes Pratiques

### 1. Clés de requête cohérentes
```typescript
// ✅ Bon
export const SCENARIO_KEYS = {
  all: ['scenarios'],
  lists: () => [...SCENARIO_KEYS.all, 'list'],
  detail: (id: string) => [...SCENARIO_KEYS.all, 'detail', id]
}

// ❌ Éviter les clés dynamiques non structurées
queryKey: ['scenarios', Date.now()] // ne sera jamais en cache
```

### 2. Gestion des erreurs
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['key'],
  queryFn: fetchData,
  retry: (failureCount, error) => {
    if (error.status === 404) return false; // pas de retry pour 404
    return failureCount < 3;
  }
});
```

### 3. Loading states optimisés
```typescript
// ✅ Skeleton de chargement spécifique
const Component = () => {
  const { data, isLoading } = useQuery({...});

  if (isLoading) return <ComponentSkeleton />;

  return <div>{data}</div>;
};
```

### 4. Optimistic updates
```typescript
const mutation = useMutation({
  mutationFn: updateItem,
  onMutate: async (newItem) => {
    // Annuler les requêtes en cours
    await queryClient.cancelQueries(['items']);

    // Snapshot du cache précédent
    const previousItems = queryClient.getQueryData(['items']);

    // Update optimiste
    queryClient.setQueryData(['items'], (old) =>
      old?.map(item =>
        item.id === newItem.id ? newItem : item
      )
    );

    return { previousItems };
  },
  onError: (err, newItem, context) => {
    // Rollback en cas d'erreur
    queryClient.setQueryData(['items'], context?.previousItems);
  },
  onSettled: () => {
    // Reforcer la synchronisation
    queryClient.invalidateQueries(['items']);
  }
});
```

---

## 🔧 Debug et Monitoring

### React Query DevTools
```typescript
// Déjà intégré dans App.tsx
{import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
```

### Indicateurs de cache
```typescript
// Ajouter dans les composants pour voir l'état du cache
{import.meta.env.DEV && (
  <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs">
    <div>Status: {isLoading ? 'Loading' : isFetching ? 'Refreshing' : 'Fresh'}</div>
    <div>Last Updated: {new Date(dataUpdatedAt).toLocaleTimeString()}</div>
  </div>
)}
```

---

## 📈 Performance Tips

1. **Configurer `staleTime`** : Éviter les requêtes inutiles
2. **Utiliser `select`** : Transformer les données côté client
3. **Précharger** : Charger les données avant qu'elles ne soient nécessaires
4. **Pagination** : Utiliser `useInfiniteQuery` pour les grandes listes
5. **Deduplication** : React Query évite automatiquement les doublons

---

## 🚨 Migration Étape par Étape

1. **Installer les dépendances** ✅
2. **Configurer le client** ✅
3. **Créer les hooks de base** ✅
4. **Migrer un composant simple** (ex: ScenarioList)
5. **Tester avec DevTools**
6. **Migrer les autres composants**
7. **Ajouter les tests unitaires**

---

*Pour toute question sur la migration, n'hésitez pas à consulter les [exemples dans les composants](../components/scenarios/ScenarioListOptimized.tsx)*