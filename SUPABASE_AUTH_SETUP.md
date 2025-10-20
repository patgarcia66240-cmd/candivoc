# Configuration de l'Authentification Supabase

Ce document explique comment configurer l'authentification avec Supabase utilisant les tables `auth.users` et `public.profiles`.

## 🚀 Installation

### 1. Configuration de Supabase

1. Créez un compte sur [Supabase](https://supabase.com)
2. Créez un nouveau projet
3. Récupérez votre URL et clé anon depuis les paramètres du projet
4. Configurez votre fichier `.env.local` :

```bash
cp .env.example .env.local
```

Éditez `.env.local` avec vos clés Supabase :
```
VITE_SUPABASE_URL=votre_supabase_url
VITE_SUPABASE_ANON_KEY=votre_supabase_anon_key
```

### 2. Configuration de la base de données

Exécutez le fichier SQL `supabase-setup.sql` dans l'éditeur SQL de votre projet Supabase :

1. Allez dans le Dashboard Supabase
2. Cliquez sur "SQL Editor"
3. Copiez-collez le contenu de `supabase-setup.sql`
4. Cliquez sur "Run"

Cela créera :
- La table `public.profiles`
- Les politiques de sécurité (RLS)
- Les triggers et index nécessaires

## 📁 Structure des fichiers

```
src/
├── types/
│   └── supabase.ts           # Types TypeScript pour Supabase
├── services/
│   ├── supabase/
│   │   ├── client.ts         # Client Supabase
│   │   ├── auth.ts           # Service d'authentification
│   │   └── profile.ts        # Service de gestion des profils
│   └── auth/
│       └── authContext.tsx   # Contexte React pour l'auth
└── pages/
    └── Login.tsx             # Page de connexion/inscription
```

## 🔐 Fonctionnalités

### Authentification
- **Inscription** : Crée un utilisateur dans `auth.users` et un profil dans `public.profiles`
- **Connexion** : Authentification avec email/mot de passe
- **Déconnexion** : Suppression de la session
- **État persistant** : La session est sauvegardée localement

### Gestion des profils
- **Création automatique** : Un profil est créé lors de l'inscription
- **Mise à jour** : Les utilisateurs peuvent modifier leur profil
- **Rôles** : Support des rôles `candidate`, `recruiter`, `admin`
- **Avatar** : Support des URLs d'avatar

### Sécurité
- **Row Level Security (RLS)** activé sur la table `profiles`
- Les utilisateurs ne peuvent accéder qu'à leur propre profil
- Les admins peuvent voir tous les profils
- Validation des données côté serveur

## 🛠️ Utilisation

### Dans vos composants React

```tsx
import { useAuth } from '../services/auth/authContext';

function MonComposant() {
  const { user, isAuthenticated, login, logout, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;

  if (!isAuthenticated) {
    return <div>Veuillez vous connecter</div>;
  }

  return (
    <div>
      Bienvenue {user?.firstName} {user?.lastName}!
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
}
```

### Services disponibles

#### SupabaseAuth
```tsx
import { SupabaseAuth } from '../services/supabase/auth';

// Connexion
const { data, error } = await SupabaseAuth.signIn(email, password);

// Inscription
const { data, error } = await SupabaseAuth.signUp(
  email,
  password,
  firstName,
  lastName,
  role
);

// Déconnexion
const { error } = await SupabaseAuth.signOut();

// Utilisateur actuel
const { user, error } = await SupabaseAuth.getCurrentUser();
```

#### ProfileService
```tsx
import { ProfileService } from '../services/supabase/profile';

// Mettre à jour un profil
const { profile, error } = await ProfileService.updateProfile(userId, {
  firstName: 'Nouveau prénom',
  lastName: 'Nouveau nom'
});

// Récupérer un profil
const { profile, error } = await ProfileService.getProfileById(userId);
```

## 🔧 Personnalisation

### Ajouter des champs au profil

1. Modifiez le type `Profile` dans `src/types/supabase.ts`
2. Ajoutez les colonnes correspondantes dans la table `profiles`
3. Mettez à jour les services pour gérer les nouveaux champs

### Ajouter des méthodes d'authentification

Le service `SupabaseAuth` peut être étendu pour supporter :
- OAuth (Google, GitHub, etc.)
- Magic Links
- Téléphone/SMS
- SSO

Consultez la [documentation Supabase Auth](https://supabase.com/docs/guides/auth) pour plus d'options.

## 🐛 Dépannage

### Problèmes courants

1. **"Missing Supabase environment variables"**
   - Vérifiez que votre fichier `.env.local` est correctement configuré
   - Redémarrez votre serveur de développement

2. **"Profile fetch error"**
   - Assurez-vous que la table `profiles` existe
   - Vérifiez que les politiques RLS sont correctement configurées

3. **Erreur de connexion**
   - Vérifiez que l'email a été confirmé (si la confirmation est activée)
   - Consultez les logs dans le dashboard Supabase

### Debug

Activez les logs dans votre navigateur pour voir les erreurs détaillées :
```tsx
// Dans src/services/supabase/client.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    debug: true // Active le debug
  }
});
```

## 📚 Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Documentation Supabase Database](https://supabase.com/docs/guides/database)
- [React Context API](https://react.dev/reference/react/createContext)