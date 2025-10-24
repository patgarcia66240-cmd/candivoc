import React from 'react';
import { Check } from 'lucide-react';
import { stripeService } from '../../services/stripe';

interface PricingCardProps {
  title: string;
  subtitle: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  buttonOnClick?: () => void;
  isPopular?: boolean;
  isHighlighted?: boolean;
  gradient: string;
  buttonGradient: string;
  textColor: string;
  icon: React.ReactNode;
  priceId?: string;
  isCurrentPlan?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  subtitle,
  price,
  period,
  features,
  buttonText,
  buttonOnClick,
  isPopular = false,
  isHighlighted = false,
  gradient,
  buttonGradient,
  textColor,
  icon,
  priceId,
  isCurrentPlan = false
}) => {
  // Normaliser les features pour que toutes les cartes aient le même nombre d'éléments
  const normalizedFeatures = [...features];
  while (normalizedFeatures.length < 6) {
    normalizedFeatures.push(''); // Ajouter des éléments vides pour maintenir la hauteur
  }

  const cardClasses = `
    ${gradient}
    rounded-2xl shadow-xl border border-slate-600/50 p-8
    hover:shadow-2xl hover:border-orange-400/70 hover:ring-4 hover:ring-orange-400/20 transition-all duration-300 backdrop-blur-sm
    flex flex-col h-full relative min-h-[600px]
    ${isHighlighted
      ? 'shadow-2xl border-2 border-orange-400/50 ring-4 ring-orange-400/20'
      : ''
    }
  `;

  const titleClasses = `
    text-2xl font-bold mb-2 [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.3)]
    ${textColor === 'white' ? 'text-white' : 'text-slate-800'}
  `;

  const subtitleClasses = `
    [text-shadow:_0_1px_2px_rgb(0_0_0_/_0.2)]
    ${textColor === 'white' ? 'text-slate-200' : 'text-slate-700'}
  `;

  const priceClasses = `
    text-4xl font-bold [text-shadow:_0_2px_4px(rgb(0_0_0_/_0.3)]
    ${textColor === 'white' ? 'text-white' : 'text-slate-900'}
  `;

  const periodClasses = `
    [text-shadow:_0_1px_2px(rgb(0_0_0_/_0.2)]
    ${textColor === 'white' ? 'text-slate-200' : 'text-slate-700'}
  `;

  const featureItemClasses = `
    flex items-start min-h-[28px]
    ${textColor === 'white' ? 'text-slate-100' : 'text-slate-800'}
  `;

  const checkIconClasses = textColor === 'white'
    ? 'w-5 h-5 text-slate-200 mr-3 mt-0.5 flex-shrink-0'
    : 'w-5 h-5 text-slate-600 mr-3 mt-0.5 flex-shrink-0';

  const featureTextClasses = textColor === 'white'
    ? '[text-shadow:_0_1px_2px(rgb(0_0_0_/_0.2)]'
    : '[text-shadow:_0_1px_2px(rgb(255_255_255_/_0.7)]';

  const handleSubscribe = async () => {
    if (buttonOnClick) {
      buttonOnClick();
      return;
    }

    if (!priceId) {
      console.error('Pas de priceId fourni');
      return;
    }

    console.log('=== handleSubscribe DÉBUT ===');
    console.log('handleSubscribe appelé avec:', {
      priceId,
      title,
      isCurrentPlan,
      hostname: window.location.hostname,
      isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    });

    try {
      if (priceId === 'price_free') {
        // Pour le plan gratuit, simplement l'activer et rester sur la page tarifs
        console.log('Plan gratuit sélectionné - Activation sans redirection');
        localStorage.setItem('currentPlan', title);
        console.log('Plan Free sauvegardé:', title);

        // Vérifier que la sauvegarde a bien fonctionné
        const saved = localStorage.getItem('currentPlan');
        console.log('Vérification sauvegarde plan Free:', saved);

        if (saved === title) {
          console.log('✅ Plan Free activé avec succès, rechargement de la page...');
          // Recharger seulement la page pour voir le changement, pas de redirection
          setTimeout(() => {
            window.location.reload();
          }, 100);
        } else {
          console.error('❌ Erreur de sauvegarde du plan Free');
        }
        return;
      } else if (isCurrentPlan) {
        // Si c'est déjà le plan actuel, afficher un message clair
        console.log('Plan déjà actuel:', title);
        console.log('=== handleSubscribe FIN (déjà actif) ===');
        return;
      } else {
        // Pour les changements d'abonnement (nouveau ou mise à jour)
        console.log('Nouveau changement d\'abonnement vers:', title, 'avec priceId:', priceId);

        // Simuler un changement immédiat pour le développement - sans confirmation
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.log('Mode développement détecté - Changement direct vers:', title);

          // Sauvegarder le nouveau plan directement
          localStorage.setItem('currentPlan', title);
          console.log('✅ Plan sauvegardé dans localStorage:', title);

          // Vérifier la sauvegarde
          const saved = localStorage.getItem('currentPlan');
          console.log('Vérification sauvegarde - Plan dans localStorage:', saved);

          if (saved === title) {
            console.log('✅ Changement réussi vers le plan:', title);

            // Rechargement immédiat pour voir le changement
            setTimeout(() => {
              console.log('Rechargement de la page...');
              window.location.reload(); // Recharger pour voir le changement
            }, 200);
          } else {
            console.error('❌ Erreur de sauvegarde dans localStorage');
          }
          console.log('=== handleSubscribe FIN (développement) ===');
          return;
        }

        // En production, utiliser Stripe
        console.log('Mode production - Utilisation de Stripe');
        const currentSubscription = await stripeService.getCurrentSubscription();
        let url: string;

        if (currentSubscription?.status === 'active') {
          // Mise à jour d'abonnement existant
          console.log('Mise à jour d\'abonnement existant');
          const result = await stripeService.updateSubscription(priceId);
          url = result.url;
        } else {
          // Nouvel abonnement
          console.log('Création d\'un nouvel abonnement');
          const result = await stripeService.createCheckoutSession(priceId);
          url = result.url;
        }

        console.log('Redirection vers Stripe:', url);
        window.location.href = url;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la souscription:', error);
      // Gérer l'erreur (afficher un message à l'utilisateur)
    }

    console.log('=== handleSubscribe FIN (erreur/fin) ===');
  };

  return (
    <div className={cardClasses}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
            Plus populaire
          </span>
        </div>
      )}

      {/* En-tête avec icône */}
      <div className="text-center mb-6 flex-shrink-0 relative">
        {isCurrentPlan && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Check className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg backdrop-blur-sm ${
          textColor === 'gray'
            ? 'bg-slate-700/90'
            : 'bg-white/20'
        }`}>
          {icon}
        </div>
        <h3 className={titleClasses}>{title}</h3>
        <p className={subtitleClasses}>{subtitle}</p>
      </div>

      {/* Prix */}
      <div className="text-center mb-6 flex-shrink-0">
        <span className={priceClasses}>{price}</span>
        <span className={periodClasses}>{period}</span>
      </div>

      {/* Liste des fonctionnalités */}
      <ul className="space-y-3 mb-8 flex-grow">
        {normalizedFeatures.map((feature, index) => (
          <li key={index} className={featureItemClasses}>
            {feature && (
              <>
                <Check className={checkIconClasses} />
                <span className={featureTextClasses}>{feature}</span>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Bouton */}
      <div className="mt-auto flex-shrink-0">
        <button
          onClick={handleSubscribe}
          disabled={isCurrentPlan}
          className={`w-full ${buttonGradient} text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
            isCurrentPlan
              ? 'opacity-50 cursor-not-allowed bg-gray-500'
              : buttonGradient.includes('white')
              ? 'hover:bg-slate-100 text-slate-700'
              : 'hover:opacity-90'
          }`}
        >
          {isCurrentPlan ? 'Plan actuel' : buttonText}
        </button>
      </div>
    </div>
  );
};