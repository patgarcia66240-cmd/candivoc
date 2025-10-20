export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
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
          avatar_url?: string;
          created_at: string | null;
          updated_at: string | null;
          openai_api_key: string | null;
          subscription_status: string | null;
          subscription_id: string | null;
          stripe_customer_id: string | null;
          role: 'user' | 'admin' | 'moderator';
          is_active: boolean;
          created_by: string | null;
          last_login: string | null;
        };
        Insert: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
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
          avatar_url?: string;
          openai_api_key: string | null;
          subscription_status?: string | null;
          subscription_id: string | null;
          stripe_customer_id: string | null;
          role?: 'user' | 'admin' | 'moderator';
          is_active?: boolean;
          created_by: string | null;
        };
        Update: {
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          postal_code?: string | null;
          city?: string | null;
          country?: string | null;
          date_of_birth?: string | null;
          nationality?: string | null;
          linkedin?: string | null;
          website?: string | null;
          profession?: string | null;
          company?: string | null;
          avatar_url?: string;
          updated_at?: string | null;
          openai_api_key?: string | null;
          subscription_status?: string | null;
          subscription_id?: string | null;
          stripe_customer_id?: string | null;
          role?: 'user' | 'admin' | 'moderator';
          is_active?: boolean;
          last_login?: string | null;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          name: string;
          price: number;
          currency: string;
          interval: 'month' | 'year';
          features: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          price: number;
          currency: string;
          interval: 'month' | 'year';
          features: string[];
          is_active?: boolean;
        };
        Update: {
          name?: string;
          price?: number;
          currency?: string;
          interval?: 'month' | 'year';
          features?: string[];
          is_active?: boolean;
          updated_at?: string;
        };
      };
    };
    Views: {
      users: {
        Row: {
          instance_id: string | null;
          id: string;
          aud: string | null;
          role: string | null;
          email: string | null;
          encrypted_password: string | null;
          email_confirmed_at: string | null;
          invited_at: string | null;
          confirmation_token: string | null;
          confirmation_sent_at: string | null;
          recovery_token: string | null;
          recovery_sent_at: string | null;
          email_change_token_new: string | null;
          email_change: string | null;
          email_change_sent_at: string | null;
          last_sign_in_at: string | null;
          raw_app_meta_data: Record<string, any> | null;
          raw_user_meta_data: Record<string, any> | null;
          is_super_admin: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          phone: string | null;
          phone_confirmed_at: string | null;
          phone_change: string | null;
          phone_change_token: string | null;
          phone_change_sent_at: string | null;
          confirmed_at: string | null;
          email_change_token_current: string | null;
          email_change_confirm_status: number | null;
          banned_until: string | null;
          reauthentication_token: string | null;
          reauthentication_sent_at: string | null;
          is_sso_user: boolean;
          deleted_at: string | null;
          is_anonymous: boolean;
        };
        Insert: never; // Les utilisateurs sont créés via Supabase Auth
        Update: {
          email?: string | null;
          phone?: string | null;
          email_change?: string | null;
          banned_until?: string | null;
          // Les autres champs sont généralement gérés par Supabase Auth
        };
      };
    };
    Functions: {
      handle_new_user: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
  };
  auth: {
    Tables: {
      users: {
        Row: {
          instance_id: string | null;
          id: string;
          aud: string | null;
          role: string | null;
          email: string | null;
          encrypted_password: string | null;
          email_confirmed_at: string | null;
          invited_at: string | null;
          confirmation_token: string | null;
          confirmation_sent_at: string | null;
          recovery_token: string | null;
          recovery_sent_at: string | null;
          email_change_token_new: string | null;
          email_change: string | null;
          email_change_sent_at: string | null;
          last_sign_in_at: string | null;
          raw_app_meta_data: Record<string, any> | null;
          raw_user_meta_data: Record<string, any> | null;
          is_super_admin: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          phone: string | null;
          phone_confirmed_at: string | null;
          phone_change: string | null;
          phone_change_token: string | null;
          phone_change_sent_at: string | null;
          confirmed_at: string | null;
          email_change_token_current: string | null;
          email_change_confirm_status: number | null;
          banned_until: string | null;
          reauthentication_token: string | null;
          reauthentication_sent_at: string | null;
          is_sso_user: boolean;
          deleted_at: string | null;
          is_anonymous: boolean;
        };
        Insert: never; // Les utilisateurs sont créés via Supabase Auth
        Update: {
          email?: string | null;
          phone?: string | null;
          email_change?: string | null;
          banned_until?: string | null;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          created_at: string | null;
          updated_at: string | null;
          expires_at: string | null;
          token: string | null;
          provider_token: string | null;
          provider_refresh_token: string | null;
        };
        Insert: never; // Les sessions sont créées via Supabase Auth
        Update: {
          updated_at?: string | null;
          expires_at?: string | null;
          token?: string | null;
          provider_token?: string | null;
          provider_refresh_token?: string | null;
        };
      };
    };
  };
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
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
  avatarUrl?: string;
  createdAt: string | null;
  updatedAt: string | null;
  openai_api_key: string | null;
  subscription_status: string | null;
  subscription_id: string | null;
  stripe_customer_id: string | null;
  role: 'user' | 'admin' | 'moderator';
  is_active: boolean;
  created_by: string | null;
  last_login: string | null;
}

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: 'user' | 'admin' | 'moderator';
  avatarUrl?: string;
  profile?: Profile;
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'user' | 'admin' | 'moderator';
export type SubscriptionStatus = 'free' | 'premium' | 'cancelled' | 'expired';

// Types pour les utilisateurs Supabase Auth
// Supabase Auth User type (raw auth.users table structure)
export interface SupabaseAuthUser {
  instance_id: string | null;
  id: string;
  aud: string | null;
  role: string | null;
  email: string | null;
  encrypted_password: string | null;
  email_confirmed_at: string | null;
  invited_at: string | null;
  confirmation_token: string | null;
  confirmation_sent_at: string | null;
  recovery_token: string | null;
  recovery_sent_at: string | null;
  email_change_token_new: string | null;
  email_change: string | null;
  email_change_sent_at: string | null;
  last_sign_in_at: string | null;
  raw_app_meta_data: Record<string, any> | null;
  raw_user_meta_data: Record<string, any> | null;
  is_super_admin: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  phone: string | null;
  phone_confirmed_at: string | null;
  phone_change: string | null;
  phone_change_token: string | null;
  phone_change_sent_at: string | null;
  confirmed_at: string | null;
  email_change_token_current: string | null;
  email_change_confirm_status: number | null;
  banned_until: string | null;
  reauthentication_token: string | null;
  reauthentication_sent_at: string | null;
  is_sso_user: boolean;
  deleted_at: string | null;
  is_anonymous: boolean;
}

export interface AuthSession {
  id: string;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
  expires_at: string | null;
  token: string | null;
  provider_token: string | null;
  provider_refresh_token: string | null;
}

// Types pour l'email confirmation
export type EmailConfirmationStatus = 0 | 1 | 2; // 0: pending, 1: confirmed, 2: failed

// Types utilitaires pour l'authentification
export interface AuthMetadata {
  provider?: string;
  providers?: string[];
  [key: string]: any;
}

export interface UserActivity {
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  phone_confirmed_at: string | null;
  confirmed_at: string | null;
  banned_until: string | null;
  deleted_at: string | null;
}

// Types pour les tokens
export interface AuthTokens {
  confirmation_token: string | null;
  confirmation_sent_at: string | null;
  recovery_token: string | null;
  recovery_sent_at: string | null;
  email_change_token_new: string | null;
  email_change_sent_at: string | null;
  email_change_token_current: string | null;
  reauthentication_token: string | null;
  reauthentication_sent_at: string | null;
}
