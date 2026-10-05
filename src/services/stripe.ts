import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Get the Stripe instance (lazy loaded)
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (!key) {
      console.warn('Stripe public key not configured');
      stripePromise = Promise.resolve(null);
    } else {
      stripePromise = loadStripe(key);
    }
  }
  return stripePromise;
}

/**
 * Create a payment intent (would call your backend in production)
 * This is a simulation for development
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'kes'
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  // In production, this would call your backend API which would then call Stripe
  // For simulation, we return a mock client secret
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const paymentIntentId = `pi_${Math.random().toString(36).substr(2, 24)}`;
  const clientSecret = `${paymentIntentId}_secret_${Math.random().toString(36).substr(2, 24)}`;
  
  return {
    clientSecret,
    paymentIntentId,
  };
}

/**
 * Confirm a payment (simulation)
 */
export async function confirmPayment(
  clientSecret: string
): Promise<{ success: boolean; error?: string }> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 90% success rate for simulation
  const success = Math.random() > 0.1;
  
  if (success) {
    return { success: true };
  } else {
    return { 
      success: false, 
      error: 'Your card was declined. Please try a different payment method.' 
    };
  }
}

/**
 * Format amount for Stripe (converts to smallest currency unit)
 * For KES, this means multiplying by 100 (cents)
 */
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}
