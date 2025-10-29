import React, { useState, useEffect } from 'react';
import { CheckCircle, Home, CreditCard } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase/client';

interface Subscription {
  planName: string;
  status: string;
  priceId?: string;
  customerEmail?: string;
  sessionId?: string;
}

export const PaymentSuccess: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  console.log('🎯 PaymentSuccess: Page chargée');
  console.log('🎯 URL actuelle:', window.location.href);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        setLoading(true);

        // Récupérer le session_id depuis l'URL
        const urlParams = new URLSearchParams(location.search);
        const sessionId = urlParams.get('session_id');

        console.log('🎉 Page de succès - Session ID:', sessionId);

        if (!sessionId) {
          console.warn('⚠️ Pas de session_id trouvé, mise à jour basique du statut');
          // Même sans session_id, on essaie de mettre à jour le statut
          const planName = 'pro'; // Par défaut pro
          await updateSubscriptionStatus(planName);
          setSubscription({
            planName: planName === 'pro' ? 'Professionnel' : planName === 'entreprise' ? 'Enterprise' : 'Essai Gratuit',
            status: 'active'
          });
          return;
        }

        // Récupérer les détails de la session Stripe
        const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_STRIPE_PRIVATE_KEY}`
          }
        });

        if (!response.ok) {
          throw new Error('Impossible de récupérer les détails de la session');
        }

        const session = await response.json();
        console.log('📋 Détails de la session:', session);

        // Extraire les informations de la session
        const lineItems = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}/line_items`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_STRIPE_PRIVATE_KEY}`
          }
        }).then(res => res.json());

        const priceId = lineItems?.data?.[0]?.price?.id;
        const planName = getPlanNameFromPriceId(priceId);
        const customerEmail = session.customer_email || session.customer_details?.email;

        console.log('📝 Infos extraites:', { priceId, planName, customerEmail });

        // Mettre à jour le statut d'abonnement dans Supabase
        await updateSubscriptionStatus(planName);

        setSubscription({
          planName,
          status: 'active',
          priceId,
          customerEmail,
          sessionId
        });

      } catch (error) {
        console.error('❌ Erreur lors du traitement du succès:', error);
        setError('Une erreur est survenue lors de la confirmation de votre abonnement.');
      } finally {
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [location.search]);

  const updateSubscriptionStatus = async (planName?: string) => {
    try {
      if (!supabase) throw new Error('Client Supabase non initialisé');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Déterminer le statut basé sur le nom du plan
      
      const updates: Record<string, string | null> = {
        subscription_status: planName || null,
        updated_at: new Date().toISOString()
      };

      console.log('🔄 Mise à jour du profil avec:', updates);

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('❌ Erreur mise à jour profil:', error);
        throw error;
      }

      console.log('✅ Profil mis à jour avec succès');

    } catch (error) {
      console.error('❌ Erreur updateSubscriptionStatus:', error);
      throw error;
    }
  };

  const getPlanNameFromPriceId = (priceId?: string): string => {
    if (!priceId) return 'pro';

    if (priceId === 'price_1S8oFvRJzdsOzUaBLJYawIks') return 'pro';
    if (priceId === 'price_1S8oIsRJzdsOzUaBxbnROHLd') return 'entreprise';
    return 'pro';
  };

  const handleReturnHome = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-green-700 text-lg">Confirmation de votre abonnement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <CreditCard className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de traitement</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleReturnHome}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="text-green-500 mb-6">
          <CheckCircle className="w-20 h-20 mx-auto" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Paiement réussi !
        </h1>

        <p className="text-gray-600 mb-6">
          Votre abonnement <span className="font-semibold text-green-600">
            {String(subscription?.planName || 'Professionnel')}
          </span> est maintenant actif.
        </p>

        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-green-700">
            🎉 Merci pour votre confiance ! Vous pouvez maintenant profiter de toutes les fonctionnalités de votre plan.
          </p>
        </div>

        {subscription?.customerEmail && (
          <p className="text-sm text-gray-500 mb-6">
            Un email de confirmation a été envoyé à {String(subscription.customerEmail)}
          </p>
        )}

        <button
          onClick={handleReturnHome}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center justify-center mx-auto"
        >
          <Home className="w-5 h-5 mr-2" />
          Retourner à l'accueil
        </button>
      </div>
    </div>
  );
};
