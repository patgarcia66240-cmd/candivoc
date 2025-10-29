import React, { useState } from "react";
import { Check, Star, Crown, Zap, Info } from "lucide-react";
import { supabase } from "../services/supabase/client";
import { createCheckoutSession } from "../lib/stripe";
import { useSubscription } from "../hooks/useSubscription";
import type { StripePrice } from "../services/stripe";

interface PricingCardProps {
  product: StripePrice;
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  loading?: boolean;
  onSubscribe: (priceId: string) => void;
}

function PricingCard({
  product,
  isPopular,
  isCurrentPlan,
  loading,
  onSubscribe,
}: PricingCardProps) {
  const isDisabled = isCurrentPlan || loading;

  return (
    <div
      className="relative rounded-2xl p-8 h-full flex flex-col shadow-lg transition-all duration-300 cursor-pointer"
      style={{
        background: isPopular
          ? 'linear-gradient(135deg, #fb923c, #f97316)'
          : product.id === "free"
          ? 'var(--bg-primary)'
          : 'linear-gradient(135deg, var(--bg-secondary), var(--bg-primary))',
        color: isPopular
          ? 'white'
          : 'var(--text-primary)',
        border: isPopular
          ? '2px solid rgba(251, 146, 60, 0.5)'
          : '1px solid var(--border-color)',
        boxShadow: isPopular
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        transform: 'translateY(0)'
      }}
      onMouseEnter={(e) => {
        if (!isPopular) {
          e.currentTarget.style.borderColor = '#fb923c';
          e.currentTarget.style.borderWidth = '2px';
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isPopular) {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.borderWidth = '1px';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
        }
      }}
    >
      {isCurrentPlan && (
        <div className="absolute -top-4 right-0">
          <span
            className="px-3 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center"
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white'
            }}
          >
            <Check className="w-4 h-4 mr-1" />
            Plan actuel
          </span>
        </div>
      )}

      <div className="text-center mb-6 relative">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 relative">
          {product.id === "free" && <Star className="w-8 h-8" style={{ color: 'var(--text-secondary)' }} />}
          {product.id === "price_1S8oFvRJzdsOzUaBLJYawIks" && (
            <Crown className="w-8 h-8 text-white" />
          )}
          {product.id === "price_1S8oIsRJzdsOzUaBxbnROHLd" && (
            <Zap className="w-8 h-8" style={{ color: '#a855f7' }} />
          )}
          {isPopular && (
            <div className="group absolute -top-2 -right-2">
              <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center cursor-help hover:bg-orange-500 transition-colors">
                <Info className="w-4 h-4 text-white" />
              </div>
              <div
                className="absolute bottom-full right-0 mb-2 w-32 p-2 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20"
                style={{
                  background: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div
                  className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                  style={{ borderTopColor: 'rgba(0, 0, 0, 0.9)' }}
                ></div>
                Plus populaire
              </div>
            </div>
          )}
        </div>
        <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
        <div className="mb-4">
          <span className="text-4xl font-bold">
            {product.price === 0 ? "0€" : `${product.price}€`}
          </span>
          <span className="text-lg opacity-80">/mois</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8 grow">
        {product.features.map((feature: string, index: number) => (
          <li key={index} className="flex items-start">
            <Check className="w-5 h-5 mr-3 mt-0.5 shrink-0 text-green-400" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSubscribe(product.id)}
        disabled={isDisabled}
        className="w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300"
        style={{
          backgroundColor: isDisabled
            ? 'var(--border-color)'
            : isPopular
            ? '#fb923c'
            : product.id === "price_1S8oIsRJzdsOzUaBxbnROHLd"
            ? '#fb923c'
            : 'var(--hover-bg)',
          color: isDisabled
            ? 'var(--text-secondary)'
            : 'white',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.6 : 1,
          border: isPopular || product.id === "price_1S8oIsRJzdsOzUaBxbnROHLd"
            ? '1px solid #f97316'
            : '1px solid var(--border-color)'
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = isPopular || product.id === "price_1S8oIsRJzdsOzUaBxbnROHLd"
              ? '#f97316'
              : 'var(--hover-bg)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 0, 0, 0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = isPopular || product.id === "price_1S8oIsRJzdsOzUaBxbnROHLd"
              ? '#fb923c'
              : 'var(--hover-bg)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        {isCurrentPlan
          ? "Plan actuel"
          : loading
          ? "Chargement..."
          : "S'abonner"}
      </button>
    </div>
  );
}

export const Pricing: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { subscription } = useSubscription();

  const handleSubscribe = async (priceId: string) => {
    // Vérifier que supabase est initialisé
    if (!supabase) {
      throw new Error(
        "Service Supabase non disponible. Veuillez vérifier votre configuration."
      );
    }

    if (priceId === "free") {
      // Mettre à jour le profil pour le plan gratuit
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from('profiles')
            .update({
              subscription_status: 'free',
              subscription_id: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          if (!error) {
            console.log('✅ Profil mis à jour pour le plan gratuit');
            // Recharger les données d'abonnement
            window.location.reload();
          } else {
            console.error('❌ Erreur mise à jour profil:', error);
          }
        }
      } catch (error) {
        console.error('❌ Erreur handleSubscribe free:', error);
      }
      return;
    }

    setLoading(true);

    try {
      // Vérifier que supabase est initialisé
      if (!supabase) {
        throw new Error(
          "Service Supabase non disponible. Veuillez vérifier votre configuration."
        );
      }

      // Récupérer l'utilisateur connecté
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      const result = await createCheckoutSession({
        priceId,
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/pricing`,
        mode: "subscription",
        customerEmail: user.email || "",
        clientReferenceId: user.id,
      });

      if (result.url) {
        console.log("🔗 Redirection vers Stripe:", result.url);
        window.location.href = result.url;
      } else {
        throw new Error("URL de session non retournée");
      }
    } catch (error) {
      console.error("Erreur création session checkout:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue";
      alert(
        `Erreur lors de la création de la session de paiement: ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Produits disponibles
  const products: StripePrice[] = [
    {
      id: "free",
      name: "Essai Gratuit",
      price: 0,
      currency: "EUR",
      interval: "month",
      features: [
        "5 sessions gratuites",
        "Accès aux scénarios de base",
        "Support par email",
        "Export des données",
        "Mises à jour automatiques",
      ],
    },
    {
      id: "price_1S8oFvRJzdsOzUaBLJYawIks",
      name: "Professionnel",
      price: 19.9,
      currency: "EUR",
      interval: "month",
      features: [
        "Sessions illimitées",
        "Accès à tous les scénarios",
        "Création de scénarios personnalisés",
        "Export des conversations",
        "Support prioritaire",
      ],
    },
    {
      id: "price_1S8oIsRJzdsOzUaBxbnROHLd",
      name: "Enterprise",
      price: 890.0,
      currency: "EUR",
      interval: "month",
      features: [
        "Tout le Professionnel",
        "Utilisateurs illimités",
        "API d'intégration",
        "Formation personnalisée",
        "SLA garanti",
        "Manager dédié",
      ],
    },
  ];

  return (
    <div className="min-h-full p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Choisissez votre formule
          </h1>
          <p
            className="text-xl max-w-3xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Découvrez nos tarifs adaptés à vos besoins. De l'essai gratuit aux
            solutions professionnelles, trouvez la formule qui vous correspond.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {products.map((product, index) => (
            <PricingCard
              key={product.id}
              product={product}
              isPopular={index === 1}
              isCurrentPlan={
                (product.name === "Essai Gratuit" && subscription?.subscriptionStatus === 'free') ||
                (product.name === "Professionnel" && subscription?.subscriptionStatus === 'pro') ||
                (product.name === "Enterprise" && subscription?.subscriptionStatus === 'entreprise')
              }
              loading={loading}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
