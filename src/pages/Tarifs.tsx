import React, { useState, useEffect } from 'react';
import { Star, Crown, Zap } from 'lucide-react';
import { PricingCard } from '../components/ui/PricingCard';
import { SubscriptionStatus } from '../components/ui/SubscriptionStatus';
import { stripeService } from '../services/stripe';
import type { StripeSubscription } from '../services/stripe';

export const Tarifs: React.FC = () => {
  const [subscription, setSubscription] = useState<StripeSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const sub = await stripeService.getCurrentSubscription();
        setSubscription(sub);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'abonnement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const isCurrentPlan = (planName: string) => {
    // Vérifier d'abord le localStorage (priorité pour le développement)
    const localPlan = localStorage.getItem('currentPlan');
    if (localPlan) {
      console.log('Plan actuel depuis localStorage:', localPlan, 'vérifié contre:', planName);
      return localPlan === planName;
    }

    // Ensuite vérifier l'API
    const isCurrentFromAPI = subscription?.status === 'active' && subscription.planName === planName;
    console.log('Plan actuel depuis API:', {
      planName,
      subscriptionPlan: subscription?.planName,
      subscriptionStatus: subscription?.status,
      isCurrentFromAPI
    });

    return isCurrentFromAPI;
  };

  // Fonction pour réinitialiser l'état de test
  const resetTestState = () => {
    const currentPlan = localStorage.getItem('currentPlan');
    console.log('Réinitialisation. Plan actuel avant reset:', currentPlan);
    localStorage.removeItem('currentPlan');
    window.location.reload();
  };

  // Afficher l'état actuel pour le débogage
  React.useEffect(() => {
    const currentPlan = localStorage.getItem('currentPlan');
    console.log('=== ÉTAT ACTUEL ===');
    console.log('Plan depuis localStorage:', currentPlan);
    console.log('Plan depuis API:', subscription?.planName);
    console.log('Statut API:', subscription?.status);
    console.log('==================');
  }, [subscription]);

  return (
    <>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4 [text-shadow:_0_2px_4px_rgb(255_255_255_/_0.8)]">
              Choisissez votre formule
            </h1>
            <p className="text-xl text-slate-700 max-w-3xl mx-auto [text-shadow:_0_1px_2px_rgb(255_255_255_/_0.6)]">
              Découvrez nos tarifs adaptés à vos besoins. De l'essai gratuit aux solutions professionnelles,
              trouvez la formule qui vous correspond.
            </p>
          </div>

          {/* Cartes de tarifs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 items-stretch">
            {/* Carte Essai Gratuit */}
            <PricingCard
              title="Essai Gratuit"
              subtitle="Idéal pour découvrir"
              price="0€"
              period="/mois"
              features={[
                "5 sessions gratuites",
                "Accès aux scénarios de base",
                "Support par email",
                "Export des données",
                "Mises à jour automatiques"
              ]}
              buttonText="Commencer gratuitement"
              gradient="bg-gradient-to-br from-slate-100 to-slate-200"
              buttonGradient="bg-gradient-to-r from-slate-400 to-slate-600"
              textColor="gray"
              icon={<Star className="w-8 h-8 text-white" />}
              priceId="price_free"
              isCurrentPlan={isCurrentPlan('Essai Gratuit')}
            />

            {/* Carte Professionnel */}
            <PricingCard
              title="Professionnel"
              subtitle="Pour les créateurs actifs"
              price="29€"
              period="/mois"
              features={[
                "Sessions illimitées",
                "Accès à tous les scénarios",
                "Création de scénarios personnalisés",
                "Export des conversations",
                "Support prioritaire"
              ]}
              buttonText="S'abonner maintenant"
              isPopular={true}
              isHighlighted={true}
              gradient="bg-gradient-to-br from-slate-500 to-slate-700"
              buttonGradient="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white"
              textColor="white"
              icon={<Crown className="w-8 h-8 text-white" />}
              priceId="price_pro"
              isCurrentPlan={isCurrentPlan('Professionnel')}
            />

            {/* Carte Enterprise */}
            <PricingCard
              title="Enterprise"
              subtitle="Pour les équipes"
              price="99€"
              period="/mois"
              features={[
                "Tout le Professionnel",
                "Utilisateurs illimités",
                "API d'intégration",
                "Formation personnalisée",
                "SLA garanti",
                "Manager dédié"
              ]}
              buttonText="S'abonner"
              gradient="bg-gradient-to-br from-slate-800 to-slate-900"
              buttonGradient="bg-gradient-to-r from-slate-600 to-slate-700"
              textColor="white"
              icon={<Zap className="w-8 h-8 text-white" />}
              priceId="price_enterprise"
              isCurrentPlan={isCurrentPlan('Enterprise')}
            />
          </div>

          {/* Section FAQ */}
          <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-xl p-8 mb-8 border border-slate-300/50 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center [text-shadow:_0_2px_4px_rgb(255_255_255_/_0.9)]">
              Questions fréquentes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/40 p-6 rounded-xl backdrop-blur-sm border border-slate-200/50">
                <h3 className="text-lg font-semibold text-slate-800 mb-3 [text-shadow:_0_1px_2px_rgb(255_255_255_/_0.8)]">
                  Puis-je changer d'abonnement à tout moment ?
                </h3>
                <p className="text-slate-700 [text-shadow:_0_1px_2px_rgb(255_255_255_/_0.6)]">
                  Oui, vous pouvez passer à une formule supérieure ou inférieure à tout moment.
                  Le changement sera effectif dès le prochain cycle de facturation.
                </p>
              </div>

              <div className="bg-white/40 p-6 rounded-xl backdrop-blur-sm border border-slate-200/50">
                <h3 className="text-lg font-semibold text-slate-800 mb-3 [text-shadow:_0_1px_2px(rgb(255_255_255_/_0.8)]">
                  Y a-t-il un engagement minimum ?
                </h3>
                <p className="text-slate-700 [text-shadow:_0_1px_2px(rgb(255_255_255_/_0.6)]">
                  Non, tous nos abonnements sont sans engagement. Vous pouvez résilier votre
                  abonnement à tout moment.
                </p>
              </div>

              <div className="bg-white/40 p-6 rounded-xl backdrop-blur-sm border border-slate-200/50">
                <h3 className="text-lg font-semibold text-slate-800 mb-3 [text-shadow:_0_1px_2px(rgb(255_255_255_/_0.8)]">
                  Comment puis-je payer ?
                </h3>
                <p className="text-slate-700 [text-shadow:_0_1px_2px(rgb(255_255_255_/_0.6)]">
                  Nous acceptons les cartes de crédit, les virements bancaires et les paiements
                  par PayPal pour les formules Professionnel et Enterprise.
                </p>
              </div>

              <div className="bg-white/40 p-6 rounded-xl backdrop-blur-sm border border-slate-200/50">
                <h3 className="text-lg font-semibold text-slate-800 mb-3 [text-shadow:_0_1px_2px(rgb(255_255_255_/_0.8)]">
                  Mes données sont-elles sécurisées ?
                </h3>
                <p className="text-slate-700 [text-shadow:_0_1px_2px(rgb(255_255_255_/_0.6)]">
                  Absolument. Toutes vos données sont chiffrées et hébergées dans l'Union Européenne
                  en conformité avec le RGPD.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl p-8 text-white shadow-xl border border-slate-700/50 backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-4 [text-shadow:_0_2px_4px(rgb(0_0_0_/_0.4)]">
              Prêt à commencer votre aventure CandiVoc ?
            </h2>
            <p className="text-xl mb-6 text-slate-200 [text-shadow:_0_1px_2px(rgb(0_0_0_/_0.3)]">
              Rejoignez des milliers de créateurs qui utilisent déjà CandiVoc
            </p>
            <div className="flex justify-center">
              <button className="bg-white text-slate-700 px-8 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-all duration-300 shadow-lg hover:shadow-xl">
                Essayer gratuitement
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};