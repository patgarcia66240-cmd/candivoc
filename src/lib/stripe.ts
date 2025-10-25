export interface CheckoutSessionParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  mode?: 'payment' | 'subscription';
  customerEmail?: string;
  clientReferenceId?: string;
}

export async function createCheckoutSession(params: CheckoutSessionParams) {
  try {
    console.log('🛒 Création session checkout Stripe:', params);

    // Créer une session via l'API REST Stripe
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_STRIPE_PRIVATE_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[0]': 'card',
        'line_items[0][price]': params.priceId,
        'line_items[0][quantity]': '1',
        'mode': params.mode || 'subscription',
        'success_url': params.successUrl,
        'cancel_url': params.cancelUrl,
        'customer_email': params.customerEmail || '',
        'client_reference_id': params.clientReferenceId || '',
      }).toString()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur API Stripe: ${error}`);
    }

    const session = await response.json();
    console.log('✅ Session Stripe créée:', session.id);

    return { url: session.url };

  } catch (error) {
    console.error('❌ Erreur création session checkout:', error);
    throw error;
  }
}