import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { SupabaseAuth } from '../supabase/auth';
import type { Profile, UserRole } from '../../types/supabase';

// Extension de l'interface Window pour le client Supabase
declare global {
  interface Window {
    supabase?: any;
  }
}

// Interface utilisateur complète basée sur le profil Supabase enrichi
export interface User {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  avatarUrl?: string;
  phone: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  linkedin: string | null;
  website: string | null;
  profession: string | null;
  company: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  openai_api_key: string | undefined;
  subscription_status: string | null;
  subscription_id: string | null;
  stripe_customer_id: string | null;
  is_active: boolean;
  created_by: string | null;
  last_login: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, first_name: string, last_name: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  console.log('🔄 AuthReducer:', action.type, { loading: state.loading, user: !!state.user });

  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false, // ← Important: mettre loading à false
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
        error: null,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Fonction utilitaire pour transformer Profile en User
  const transformProfileToUser = (profile: Profile): User => ({
    id: profile.id,
    email: profile.email,
    first_name: profile.first_name,
    last_name: profile.last_name,
    role: profile.role,
    avatarUrl: profile.avatarUrl,
    phone: profile.phone,
    address: profile.address,
    postal_code: profile.postal_code,
    city: profile.city,
    country: profile.country,
    date_of_birth: profile.date_of_birth,
    nationality: profile.nationality,
    linkedin: profile.linkedin,
    website: profile.website,
    profession: profile.profession,
    company: profile.company,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    openai_api_key: profile.openai_api_key ?? undefined,
    subscription_status: profile.subscription_status,
    subscription_id: profile.subscription_id,
    stripe_customer_id: profile.stripe_customer_id,
    is_active: profile.is_active,
    created_by: profile.created_by,
    last_login: profile.last_login,
  });

  useEffect(() => {
    let mounted = true;
    let isInitialized = false;

    const initAuth = async () => {
      if (isInitialized) return; // Éviter la double initialisation
      isInitialized = true;

      try {
        console.log('🔍 Initializing auth...');

        // Plus de timeout d'initialisation - laisser le processus se faire naturellement

        const { user, error } = await SupabaseAuth.getCurrentUser();

        console.log('👤 Auth result:', {
          user: !!user,
          hasProfile: !!user?.profile,
          error: error?.message,
          userEmail: user?.email
        });

        if (mounted) {
          if (user && user.profile) {
            const transformedUser = transformProfileToUser(user.profile);
            dispatch({ type: 'AUTH_SUCCESS', payload: transformedUser });
            console.log('✅ User logged in:', transformedUser.email);
          } else if (user) {
            // Utilisateur Supabase sans profil - créer un utilisateur de base
            const basicUser: User = {
              id: user.id,
              email: user.email || null,
              first_name: user.user_metadata?.first_name ?? null,
              last_name: user.user_metadata?.last_name ?? null,
              role: user.user_metadata?.role || 'user',
              phone: null,
              address: null,
              postal_code: null,
              city: null,
              country: null,
              date_of_birth: null,
              nationality: null,
              linkedin: null,
              website: null,
              profession: null,
              company: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              openai_api_key: undefined,
              subscription_status: 'free',
              subscription_id: null,
              stripe_customer_id: null,
              is_active: true,
              created_by: null,
              last_login: new Date().toISOString(),
            };
            dispatch({ type: 'AUTH_SUCCESS', payload: basicUser });
            console.log('✅ Basic user created from Supabase:', basicUser.email);
          } else {
            dispatch({ type: 'LOGOUT' });
            console.log('👋 No user logged in - application ready');
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (mounted) {
          dispatch({ type: 'LOGOUT' });
        }
      }
    };

    // Démarrer l'initialisation avec un petit délai pour éviter les conflits
    const initTimeout = setTimeout(initAuth, 100);

    // Écouter les changements d'état d'authentification
    let subscription: any;
    try {
      const { data } = SupabaseAuth.onAuthStateChange(
        async (event, session) => {
          console.log('🔄 Auth state change:', event, !!session?.user);

          if (!mounted) return;

          if (event === 'SIGNED_IN' && session?.user) {
            console.log('🔍 SIGNED_IN detected - laissé au login de gérer');
            // Simplifié - le login gère déjà AUTH_SUCCESS
            // Pas de double traitement pour éviter les conflits
          } else if (event === 'SIGNED_OUT') {
            dispatch({ type: 'LOGOUT' });
            console.log('👋 User signed out');
          }
        }
      );
      subscription = data.subscription;
    } catch (error) {
      console.error('❌ Error setting up auth listener:', error);
      if (mounted) dispatch({ type: 'LOGOUT' });
    }

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔑 Starting login process for:', email);
    dispatch({ type: 'AUTH_START' });

    // Plus de timeout de login - laisser Supabase gérer les timeouts réseau

    try {
      const { data, error } = await SupabaseAuth.signIn(email, password);

      if (error) {
        console.error('❌ Login error:', error);
        dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Login failed' });
      } else if (data.user) {
        console.log('✅ Login successful for:', data.user.email);

        // Simple et direct - utilisateur minimaliste
        const simpleUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          first_name: 'User',
          last_name: 'Name',
          role: 'user',
          phone: null,
          address: null,
          postal_code: null,
          city: null,
          country: null,
          date_of_birth: null,
          nationality: null,
          linkedin: null,
          website: null,
          profession: null,
          company: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          openai_api_key: undefined,
          subscription_status: 'free',
          subscription_id: null,
          stripe_customer_id: null,
          is_active: true,
          created_by: null,
          last_login: new Date().toISOString(),
        };

        dispatch({ type: 'AUTH_SUCCESS', payload: simpleUser });
        console.log('✅ Simple AUTH_SUCCESS - User:', simpleUser.email);
      }
    } catch (error) {
      console.error('❌ Login exception:', error);
      dispatch({ type: 'AUTH_FAILURE', payload: 'Une erreur est survenue lors de la connexion' });
    }
  };

  const register = async (
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    role: UserRole = 'user'
  ) => {
    dispatch({ type: 'AUTH_START' });
    try {
      console.log('📝 Attempting registration:', { email, first_name, last_name, role });

      const { data, error } = await SupabaseAuth.signUp(
        email,
        password,
        first_name,
        last_name,
        role
      );

      console.log('📝 Registration result:', { data: !!data, error: error?.message });

      if (error) {
        // Messages d'erreur plus spécifiques
        let errorMessage = 'Registration failed';
        if (error.message.includes('already registered')) {
          errorMessage = 'Cet email est déjà utilisé';
        } else if (error.message.includes('Password')) {
          errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Adresse email invalide';
        } else if ((error as any)?.status === 422) {
          errorMessage = 'Données invalides. Vérifiez les champs obligatoires.';
        } else {
          errorMessage = error.message || 'Registration failed';
        }

        console.error('❌ Registration error:', error);
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      } else if (data?.user) {
        console.log('✅ Registration successful for:', data.user.email);
        // Récupérer le profil utilisateur après l'inscription
        const { user } = await SupabaseAuth.getCurrentUser();
        if (user && user.profile) {
          const transformedUser = transformProfileToUser(user.profile);
          dispatch({ type: 'AUTH_SUCCESS', payload: transformedUser });
          console.log('✅ User profile loaded:', transformedUser.email);
        } else if (user) {
          // Si pas de profil, créer un utilisateur de base
          const basicUser: User = {
            id: user.id,
            email: user.email || email,
            first_name: user.user_metadata?.first_name || first_name,
            last_name: user.user_metadata?.last_name || last_name,
            role: user.user_metadata?.role || role,
            phone: null,
            address: null,
            postal_code: null,
            city: null,
            country: null,
            date_of_birth: null,
            nationality: null,
            linkedin: null,
            website: null,
            profession: null,
            company: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            openai_api_key: undefined,
            subscription_status: 'free',
            subscription_id: null,
            stripe_customer_id: null,
            is_active: true,
            created_by: null,
            last_login: new Date().toISOString(),
          };
          dispatch({ type: 'AUTH_SUCCESS', payload: basicUser });
          console.log('✅ Basic user created from registration:', basicUser.email);
        }
      }
    } catch (error) {
      console.error('❌ Registration exception:', error);
      dispatch({ type: 'AUTH_FAILURE', payload: 'Une erreur est survenue lors de l\'inscription' });
    }
  };

  const logout = async () => {
    await SupabaseAuth.signOut();
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!state.user) {
      dispatch({ type: 'AUTH_FAILURE', payload: 'No user logged in' });
      return;
    }

    console.log('🔧 Updating profile for user:', state.user.id);
    console.log('📋 User current state:', state.user);
    console.log('📝 Data received:', data);

    try {
      // Transformer les données User en format Profile pour Supabase
      const profileData: any = {};

      // Inclure TOUS les champs même s'ils sont vides - CRUCIAL pour les mises à jour
      if ('first_name' in data) profileData.first_name = data.first_name;
      if ('last_name' in data) profileData.last_name = data.last_name;
      if ('email' in data) profileData.email = data.email;
      if ('phone' in data) profileData.phone = data.phone;
      if ('address' in data) profileData.address = data.address;
      if ('postal_code' in data) profileData.postal_code = data.postal_code;  // ← Toujours inclus si présent
      if ('city' in data) profileData.city = data.city;
      if ('country' in data) profileData.country = data.country;
      if ('date_of_birth' in data) profileData.date_of_birth = data.date_of_birth;
      if ('nationality' in data) profileData.nationality = data.nationality;
      if ('linkedin' in data) profileData.linkedin = data.linkedin;
      if ('website' in data) profileData.website = data.website;
      if ('profession' in data) profileData.profession = data.profession;
      if ('company' in data) profileData.company = data.company;
      if ('avatarUrl' in data) profileData.avatar_url = data.avatarUrl;
      if ('openai_api_key' in data) profileData.openai_api_key = data.openai_api_key;
      if ('subscription_status' in data) profileData.subscription_status = data.subscription_status;
      if ('subscription_id' in data) profileData.subscription_id = data.subscription_id;
      if ('stripe_customer_id' in data) profileData.stripe_customer_id = data.stripe_customer_id;
      if ('role' in data) profileData.role = data.role;
      if ('is_active' in data) profileData.is_active = data.is_active;
      if ('last_login' in data) profileData.last_login = data.last_login;

      // Toujours inclure updated_at
      profileData.updated_at = new Date().toISOString();

      console.log('📝 Profile data constructed for update:', {
        hasPostalCode: 'postal_code' in data,
        postalCodeValue: data.postal_code,
        postalCodeType: typeof data.postal_code,
        profileDataPostalCode: profileData.postal_code,
        allKeys: Object.keys(profileData),
        fullProfileData: profileData
      });

      // Importer ProfileService dynamiquement pour éviter les dépendances circulaires
      const { ProfileService } = await import('../supabase/profile');

      let profile, error;

      // Essayer de mettre à jour le profil via ProfileService
      console.log('📝 Attempting to update profile via ProfileService...');
      const updateResult = await ProfileService.updateProfile(state.user.id, profileData);
      profile = updateResult.profile;
      error = updateResult.error;

      // Si la mise à jour échoue parce que le profil n'existe pas, le créer
      if (error && error?.code === 'PGRST116') {
        console.log('📝 Profile not found, creating new profile...');
        const createResult = await ProfileService.createProfile({
          id: state.user.id,
          email: state.user.email || '',
          first_name: data.first_name || state.user.first_name || 'User',
          last_name: data.last_name || state.user.last_name || 'Name',
          role: data.role || state.user.role || 'user',
          phone: data.phone ?? state.user.phone ?? undefined,
          address: data.address ?? state.user.address ?? undefined,
          postal_code: data.postal_code ?? state.user.postal_code ?? undefined,
          city: data.city ?? state.user.city ?? undefined,
          country: data.country ?? state.user.country ?? undefined,
          date_of_birth: data.date_of_birth ?? state.user.date_of_birth ?? undefined,
          nationality: data.nationality ?? state.user.nationality ?? undefined,
          linkedin: data.linkedin ?? state.user.linkedin ?? undefined,
          website: (data.website ?? state.user.website) ?? undefined,
          profession: (data.profession ?? state.user.profession) ?? undefined,
          company: (data.company ?? state.user.company) ?? undefined,
          openai_api_key: data.openai_api_key || state.user.openai_api_key,
          avatarUrl: data.avatarUrl || state.user.avatarUrl,
        });
        profile = createResult.profile;
        error = createResult.error;
      }

      console.log('📊 ProfileService operation result:', {
        hasProfile: !!profile,
        error: error?.message,
        errorCode: error?.code,
        errorDetails: error?.details
      });

      // Si ProfileService échoue, essayer directement avec Supabase client
      if (!profile && error) {
        console.log('🔄 ProfileService failed, trying direct Supabase update...');
        try {
          const { supabase } = await import('../supabase/client');
          const { data: directResult, error: directError } = await supabase
            .from('profiles')
            .upsert({
              id: state.user.id,
              ...profileData,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          console.log('🔍 Direct Supabase result:', {
            hasData: !!directResult,
            error: directError?.message,
            errorCode: directError?.code
          });

          if (directResult && !directError) {
            // Transformer le résultat
            profile = {
              id: directResult.id,
              email: directResult.email,
              first_name: directResult.first_name,
              last_name: directResult.last_name,
              role: directResult.role,
              avatarUrl: directResult.avatar_url,
              phone: directResult.phone,
              address: directResult.address,
              postal_code: directResult.postal_code,
              city: directResult.city,
              country: directResult.country,
              date_of_birth: directResult.date_of_birth,
              nationality: directResult.nationality,
              linkedin: directResult.linkedin,
              website: directResult.website,
              profession: directResult.profession,
              company: directResult.company,
              openai_api_key: directResult.openai_api_key,
              subscription_status: directResult.subscription_status,
              subscription_id: directResult.subscription_id,
              stripe_customer_id: directResult.stripe_customer_id,
              createdAt: directResult.created_at,
              updatedAt: directResult.updated_at,
              is_active: directResult.is_active,
              created_by: directResult.created_by,
              last_login: directResult.last_login,
            };
            error = null;
          } else {
            error = directError;
          }
        } catch (directException) {
          console.error('❌ Direct Supabase update failed:', directException);
          error = { message: 'Direct update failed: ' + (directException as Error).message };
        }
      }

      if (error || !profile) {
        console.error('❌ Profile operation failed:', error);
        dispatch({ type: 'AUTH_FAILURE', payload: error?.message || 'Profile update failed' });
        return;
      }

      // Mettre à jour l'utilisateur dans l'état avec le profil transformé
      const updatedUser = transformProfileToUser(profile);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      console.log('✅ Profile updated successfully:', updatedUser.email);
      console.log('🔄 Dispatched UPDATE_USER with new user data:', {
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        phone: updatedUser.phone,
        email: updatedUser.email
      });
    } catch (error) {
      console.error('❌ Profile update exception:', error);
      dispatch({ type: 'AUTH_FAILURE', payload: 'Profile update failed' });
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
