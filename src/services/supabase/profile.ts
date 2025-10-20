import { supabase } from './client';
import type { Profile, UserRole } from '../../types/supabase';

export class ProfileService {
  // Créer un profil utilisateur
  static async createProfile(data: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role?: UserRole;
    avatarUrl?: string;
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
    openai_api_key?: string;
    stripe_customer_id?: string;
    createdBy?: string;
  }): Promise<{ profile: Profile | null; error: any }> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          id: data.id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role || 'user',
          avatar_url: data.avatarUrl,
          phone: data.phone || null,
          address: data.address || null,
          postal_code: data.postal_code || null,
          city: data.city || null,
          country: data.country || 'France',
          date_of_birth: data.date_of_birth || null,
          nationality: data.nationality || 'Française',
          linkedin: data.linkedin || null,
          website: data.website || null,
          profession: data.profession || null,
          company: data.company || null,
          openai_api_key: data.openai_api_key || null,
          stripe_customer_id: data.stripe_customer_id || null,
          created_by: data.createdBy || null,
        })
        .select()
        .single();

      if (error) {
        return { profile: null, error };
      }

      const transformedProfile: Profile = {
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
      };

      return { profile: transformedProfile, error: null };
    } catch (error) {
      return { profile: null, error };
    }
  }

  // Mettre à jour un profil utilisateur
  static async updateProfile(
    userId: string,
    data: {
      first_name?: string;
      last_name?: string;
      email?: string;
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
      avatarUrl?: string;
      openai_api_key?: string;
      subscription_status?: string;
      subscription_id?: string;
      stripe_customer_id?: string;
      role?: UserRole;
      is_active?: boolean;
      last_login?: string;
    }
  ): Promise<{ profile: Profile | null; error: any }> {
    try {
      const updateData: any = {};
      if ('first_name' in data) updateData.first_name = data.first_name;
      if ('last_name' in data) updateData.last_name = data.last_name;
      if ('email' in data) updateData.email = data.email;
      if ('phone' in data) updateData.phone = data.phone;
      if ('address' in data) updateData.address = data.address;
      if ('postal_code' in data) updateData.postal_code = data.postal_code;
      if ('city' in data) updateData.city = data.city;
      if ('country' in data) updateData.country = data.country;
      if ('date_of_birth' in data) updateData.date_of_birth = data.date_of_birth;
      if ('nationality' in data) updateData.nationality = data.nationality;
      if ('linkedin' in data) updateData.linkedin = data.linkedin;
      if ('website' in data) updateData.website = data.website;
      if ('profession' in data) updateData.profession = data.profession;
      if ('company' in data) updateData.company = data.company;
      if ('avatarUrl' in data) updateData.avatar_url = data.avatarUrl;
      if ('openai_api_key' in data) updateData.openai_api_key = data.openai_api_key;
      if ('subscription_status' in data) updateData.subscription_status = data.subscription_status;
      if ('subscription_id' in data) updateData.subscription_id = data.subscription_id;
      if ('stripe_customer_id' in data) updateData.stripe_customer_id = data.stripe_customer_id;
      if ('role' in data) updateData.role = data.role;
      if ('is_active' in data) updateData.is_active = data.is_active;
      if ('last_login' in data) updateData.last_login = data.last_login;
      updateData.updated_at = new Date().toISOString();

      const { data: profile, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { profile: null, error };
      }

      const transformedProfile: Profile = {
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
      };

      return { profile: transformedProfile, error: null };
    } catch (error) {
      return { profile: null, error };
    }
  }

  // Récupérer un profil par ID
  static async getProfileById(userId: string): Promise<{ profile: Profile | null; error: any }> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { profile: null, error };
      }

      const transformedProfile: Profile = {
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
      };

      return { profile: transformedProfile, error: null };
    } catch (error) {
      return { profile: null, error };
    }
  }

  // Supprimer un profil utilisateur
  static async deleteProfile(userId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  // Lister tous les profils (pour les admins)
  static async getAllProfiles(): Promise<{ profiles: Profile[] | null; error: any }> {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { profiles: null, error };
      }

      const transformedProfiles: Profile[] = profiles.map(profile => ({
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
      }));

      return { profiles: transformedProfiles, error: null };
    } catch (error) {
      return { profiles: null, error };
    }
  }

  // Mettre à jour le statut d'abonnement
  static async updateSubscriptionStatus(
    userId: string,
    subscriptionId: string,
    status: string
  ): Promise<{ profile: Profile | null; error: any }> {
    return this.updateProfile(userId, {
      subscription_id: subscriptionId,
      subscription_status: status,
    });
  }

  // Mettre à jour la clé API OpenAI
  static async updateOpenAIKey(
    userId: string,
    apiKey: string
  ): Promise<{ profile: Profile | null; error: any }> {
    return this.updateProfile(userId, {
      openai_api_key: apiKey,
    });
  }

  // Activer/Désactiver un utilisateur
  static async toggleUserActive(
    userId: string,
    is_active: boolean
  ): Promise<{ profile: Profile | null; error: any }> {
    return this.updateProfile(userId, {
      is_active: is_active,
      last_login: new Date().toISOString(),
    });
  }

  // Rechercher des profils par critères
  static async searchProfiles(criteria: {
    role?: UserRole;
    is_active?: boolean;
    city?: string;
    profession?: string;
    company?: string;
  }): Promise<{ profiles: Profile[] | null; error: any }> {
    try {
      let query = supabase.from('profiles').select('*');

      if (criteria.role) {
        query = query.eq('role', criteria.role);
      }
      if (criteria.is_active !== undefined) {
        query = query.eq('is_active', criteria.is_active);
      }
      if (criteria.city) {
        query = query.ilike('city', `%${criteria.city}%`);
      }
      if (criteria.profession) {
        query = query.ilike('profession', `%${criteria.profession}%`);
      }
      if (criteria.company) {
        query = query.ilike('company', `%${criteria.company}%`);
      }

      const { data: profiles, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return { profiles: null, error };
      }

      const transformedProfiles: Profile[] = profiles.map(profile => ({
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
      }));

      return { profiles: transformedProfiles, error: null };
    } catch (error) {
      return { profiles: null, error };
    }
  }
}

export default ProfileService;