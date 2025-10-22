import { supabase } from './client';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, UserRole } from '../../types/supabase';

export interface AuthUser extends User {
  profile?: Profile;
}

export interface AuthSession extends Session {
  user?: AuthUser;
}

export class SupabaseAuth {
  // Inscription
  static async signUp(
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    role: UserRole = 'user'
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: first_name,
          last_name: lastName,
          role: role,
        },
      },
    });

    if (!error && data.user) {
      // Créer le profil utilisateur dans la table public.profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          first_name: first_name,
          last_name: lastName,
          role: role,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Tenter de supprimer l'utilisateur auth créé si le profil échoue
        await supabase.auth.admin.deleteUser(data.user.id);
        return { data: null, error: profileError };
      }
    }

    return { data, error };
  }

  // Connexion
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  // Déconnexion
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  // Récupérer l'utilisateur actuel avec son profil
  static async getCurrentUser(): Promise<{ user: AuthUser | null; error: Error | null }> {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return { user: null, error };
    }

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return { user: null, error: profileError };
    }

    // Transformer le profil pour correspondre à l'interface attendue
    const userWithProfile: AuthUser = {
      ...data.user,
      profile: {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role,
        avatarUrl: profile.avatar_url,
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
        openai_api_key: profile.openai_api_key,
        subscription_status: profile.subscription_status,
        subscription_id: profile.subscription_id,
        stripe_customer_id: profile.stripe_customer_id,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        is_active: profile.is_active,
        created_by: profile.created_by,
        last_login: profile.last_login,
      },
    };

    return { user: userWithProfile, error: null };
  }

  // Récupérer la session actuelle
  static async getCurrentSession(): Promise<{ session: AuthSession | null; error: Error | null }> {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  }

  // Écouter les changements d'authentification
  static onAuthStateChange(callback: (event: string, session: AuthSession | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Mettre à jour le dernier login
  static async updateLastLogin(userId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  // Vérifier si l'utilisateur est actif
  static async isUserActive(userId: string): Promise<{ isActive: boolean; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_active')
        .eq('id', userId)
        .single();

      if (error) {
        return { isActive: false, error };
      }

      return { isActive: data.is_active, error: null };
    } catch (error) {
      return { isActive: false, error };
    }
  }

  // Récupérer le rôle de l'utilisateur
  static async getUserRole(userId: string): Promise<{ role: UserRole | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        return { role: null, error };
      }

      return { role: data.role, error: null };
    } catch (error) {
      return { role: null, error };
    }
  }

  // Créer un utilisateur avec profil complet
  static async signUpWithProfile(
    email: string,
    password: string,
    profileData: {
      first_name: string;
      last_name: string;
      role?: UserRole;
      phone?: string;
      address?: string;
      postal_code?: string;
      city?: string;
      country?: string;
      date_of_birth?: string;
      nationality?: string;
      linkedin?: string;
      website?: string;
      profession?: string;
      company?: string;
    }
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: profileData.first_name,
          last_name: profileData.lastName,
          role: profileData.role || 'user',
        },
      },
    });

    if (!error && data.user) {
      // Créer le profil utilisateur complet dans la table public.profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          first_name: profileData.first_name,
          last_name: profileData.lastName,
          role: profileData.role || 'user',
          phone: profileData.phone || null,
          address: profileData.address || null,
          postal_code: profileData.postal_code || null,
          city: profileData.city || null,
          country: profileData.country || 'France',
          date_of_birth: profileData.date_of_birth || null,
          nationality: profileData.nationality || 'Française',
          linkedin: profileData.linkedin || null,
          website: profileData.website || null,
          profession: profileData.profession || null,
          company: profileData.company || null,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Tenter de supprimer l'utilisateur auth créé si le profil échoue
        await supabase.auth.admin.deleteUser(data.user.id);
        return { data: null, error: profileError };
      }
    }

    return { data, error };
  }
}

export default SupabaseAuth;
