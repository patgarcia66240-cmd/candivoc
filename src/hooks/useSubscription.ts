import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase/client';

export interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  planName: string;
  priceId: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  // Ajouter le statut de la base de données
  subscriptionStatus?: 'free' | 'pro' | 'entreprise' | string;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Récupérer le profil utilisateur
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_id, stripe_customer_id, cancel_at_period_end')
          .eq('id', user.id)
          .single();

          
        if (profile?.subscription_status ) {
          // Déterminer le nom du plan et le statut selon subscription_status
          let planName = 'Essai Gratuit';
          let status = 'active';

          if (profile.subscription_status === 'pro') {
            planName = 'Professionnel';
            status = 'active';
          } else if (profile.subscription_status === 'entreprise') {
            planName = 'Enterprise';
            status = 'active';
          } else if (profile.subscription_status === 'free') {
            planName = 'Essai Gratuit';
            status = 'active';
          }

          setSubscription({
            id: profile.subscription_id,
            status: status as 'active' | 'canceled' | 'past_due' | 'incomplete',
            planName,
            priceId: profile.subscription_id,
            currentPeriodEnd: '',
            cancelAtPeriodEnd: profile.cancel_at_period_end || false,
            subscriptionStatus: profile.subscription_status as 'free' | 'pro' | 'entreprise'
          });
        } else {
          // Plan gratuit par défaut
          setSubscription({
            id: 'free',
            status: 'active',
            planName: 'Essai Gratuit',
            priceId: 'free',
            currentPeriodEnd: '',
            cancelAtPeriodEnd: false
          });
        }
      } catch (error) {
        console.error('Erreur récupération abonnement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  return { subscription, loading };
}
