import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validation de l'URL
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Vérifier si les variables sont valides
const hasValidConfig = supabaseUrl &&
                     supabaseAnonKey &&
                     supabaseUrl !== 'votre_supabase_url' &&
                     supabaseAnonKey !== 'votre_supabase_anon_key' &&
                     isValidUrl(supabaseUrl);

let supabase: SupabaseClient | null = null;

// Créer le client seulement si la configuration est valide
if (hasValidConfig) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    supabase = null;
  }
}

export { supabase };
export default supabase;
