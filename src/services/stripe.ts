export interface StripePrice {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

export interface StripeSubscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  planName: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

class StripeService {
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Prix disponibles (simulés pour l'instant)
  static readonly PRICES: StripePrice[] = [
    {
      id: 'price_free',
      name: 'Essai Gratuit',
      price: 0,
      currency: 'EUR',
      interval: 'month',
      features: [
        '5 sessions gratuites',
        'Accès aux scénarios de base',
        'Support par email',
        'Export des données',
        'Mises à jour automatiques'
      ]
    },
    {
      id: 'price_pro',
      name: 'Professionnel',
      price: 29,
      currency: 'EUR',
      interval: 'month',
      features: [
        'Sessions illimitées',
        'Accès à tous les scénarios',
        'Création de scénarios personnalisés',
        'Export des conversations',
        'Support prioritaire'
      ]
    },
    {
      id: 'price_enterprise',
      name: 'Enterprise',
      price: 99,
      currency: 'EUR',
      interval: 'month',
      features: [
        'Tout le Professionnel',
        'Utilisateurs illimités',
        'API d\'intégration',
        'Formation personnalisée',
        'SLA garanti',
        'Manager dédié'
      ]
    }
  ];

  async createCheckoutSession(priceId: string): Promise<{ url: string }> {
    try {
      const response = await fetch(`${this.baseURL}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ priceId })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session de paiement');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur Stripe:', error);
      // Simulation pour le développement
      return {
        url: `https://checkout.stripe.com/pay/demo?price=${priceId}`
      };
    }
  }

  async getCurrentSubscription(): Promise<StripeSubscription | null> {
    try {
      const response = await fetch(`${this.baseURL}/stripe/subscription`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Erreur lors de la récupération de l\'abonnement');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur Stripe:', error);
      // Pour le développement, retourner null pour laisser le localStorage gérer l'état
      // Cela évite les conflits entre la simulation API et le localStorage
      return null;
    }
  }

  async updateSubscription(priceId: string): Promise<{ url: string }> {
    try {
      const response = await fetch(`${this.baseURL}/stripe/update-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ priceId })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de l\'abonnement');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur Stripe:', error);
      // Simulation pour le développement
      return {
        url: `https://checkout.stripe.com/pay/demo?update=${priceId}`
      };
    }
  }

  async cancelSubscription(): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/stripe/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'annulation de l\'abonnement');
      }
    } catch (error) {
      console.error('Erreur Stripe:', error);
    }
  }

  private getAuthToken(): string {
    // Récupérer le token d'authentification (à adapter selon votre système)
    return localStorage.getItem('authToken') || '';
  }

  // Méthodes utilitaires
  static getPriceById(priceId: string): StripePrice | undefined {
    return this.PRICES.find(price => price.id === priceId);
  }

  static formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(price / 100);
  }
}

export const stripeService = new StripeService();