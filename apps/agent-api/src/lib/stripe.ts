/**
 * Stripe server-side utilities
 * @see https://stripe.com/docs/api
 */
import Stripe from 'stripe';
import { env } from '../env';
import { logger } from '../logger';

// Initialize Stripe with the secret key
let stripeInstance: Stripe | null = null;

/**
 * Check if Stripe is properly configured
 */
export function isStripeEnabled(): boolean {
  const secretKey = env.STRIPE_SECRET_KEY;
  return (
    typeof secretKey === 'string' && secretKey.length > 0 && !secretKey.includes('YOUR_SECRET_KEY')
  );
}

/**
 * Get the Stripe instance (singleton)
 * @throws Error if Stripe is not configured
 */
export function getStripe(): Stripe {
  if (!isStripeEnabled()) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in your environment.');
  }

  if (!stripeInstance) {
    const secretKey = env.STRIPE_SECRET_KEY as string;

    stripeInstance = new Stripe(secretKey, {
      typescript: true,
      appInfo: {
        name: 'Soft Systems Studio',
        version: '1.0.0',
      },
    });
    logger.info('Stripe client initialized');
  }

  return stripeInstance;
}

/**
 * Create a Checkout Session
 */
export async function createCheckoutSession(params: {
  priceId: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
  mode?: 'payment' | 'subscription' | 'setup';
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: params.mode || 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    customer: params.customerId,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
  });

  logger.info('Created checkout session', { sessionId: session.id });
  return session;
}

/**
 * Create a Customer Portal session
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripe();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  logger.info('Created portal session', { customerId });
  return session;
}

/**
 * Create or retrieve a customer
 */
export async function getOrCreateCustomer(
  email: string,
  metadata?: Record<string, string>,
): Promise<Stripe.Customer> {
  const stripe = getStripe();

  // Check if customer already exists
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  const existingCustomer = existingCustomers.data[0];
  if (existingCustomer) {
    logger.info('Found existing customer', { customerId: existingCustomer.id });
    return existingCustomer;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata,
  });

  logger.info('Created new customer', { customerId: customer.id });
  return customer;
}

/**
 * Verify a webhook signature
 */
export function verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Get a subscription
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately = false,
): Promise<Stripe.Subscription> {
  const stripe = getStripe();

  if (immediately) {
    return stripe.subscriptions.cancel(subscriptionId);
  }

  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Retrieve an invoice
 */
export async function getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
  const stripe = getStripe();
  return stripe.invoices.retrieve(invoiceId);
}

// Export Stripe types for convenience
export type { Stripe };
