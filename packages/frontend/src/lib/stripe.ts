/**
 * Stripe client-side utilities
 * @see https://stripe.com/docs/stripe-js
 */
import { loadStripe, type Stripe } from '@stripe/stripe-js';

// Environment variable for publishable key
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Singleton promise to avoid loading Stripe multiple times
let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Check if Stripe is properly configured
 */
export function isStripeEnabled(): boolean {
  return !!STRIPE_PUBLISHABLE_KEY && !STRIPE_PUBLISHABLE_KEY.includes('YOUR_PUBLISHABLE_KEY');
}

/**
 * Get the Stripe instance (lazy loaded)
 * @returns Promise<Stripe | null>
 */
export function getStripe(): Promise<Stripe | null> {
  if (!isStripeEnabled()) {
    console.warn(
      'Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment.'
    );
    return Promise.resolve(null);
  }

  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY!);
  }

  return stripePromise;
}

/**
 * Redirect to Stripe Checkout using window.location
 * This is the recommended approach for Checkout Sessions
 * @param checkoutUrl - The Checkout Session URL from your backend
 */
export function redirectToCheckout(checkoutUrl: string): void {
  window.location.href = checkoutUrl;
}

/**
 * Format amount for display (converts cents to dollars)
 * @param amount - Amount in cents
 * @param currency - Currency code (default: 'usd')
 */
export function formatAmount(amount: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

/**
 * Parse amount for Stripe (converts dollars to cents)
 * @param amount - Amount in dollars
 */
export function parseAmount(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Create a payment request button configuration
 * Useful for Apple Pay, Google Pay, etc.
 */
export async function createPaymentRequest(options: {
  country: string;
  currency: string;
  total: {
    label: string;
    amount: number;
  };
  requestPayerName?: boolean;
  requestPayerEmail?: boolean;
}) {
  const stripe = await getStripe();

  if (!stripe) {
    return null;
  }

  return stripe.paymentRequest({
    country: options.country,
    currency: options.currency,
    total: options.total,
    requestPayerName: options.requestPayerName,
    requestPayerEmail: options.requestPayerEmail,
  });
}
