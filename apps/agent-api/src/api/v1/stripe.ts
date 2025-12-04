/**
 * Stripe Webhook Handler
 * Handles webhook events from Stripe for subscription and payment updates
 */
import { Router, Request, Response } from 'express';
import { logger } from '../../logger';
import { isStripeEnabled, verifyWebhookSignature } from '../../lib/stripe';
import { asyncHandler } from '../../middleware/errorHandler';
import type { Stripe } from 'stripe';

const router = Router();

/**
 * Stripe webhook endpoint
 * This must receive raw body (not JSON parsed) for signature verification
 */
router.post(
  '/webhook',
  // eslint-disable-next-line @typescript-eslint/require-await -- Required for asyncHandler pattern
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!isStripeEnabled()) {
      logger.warn('Stripe webhook received but Stripe is not configured');
      res.status(503).json({ error: 'Stripe is not configured' });
      return;
    }

    const signature = req.headers['stripe-signature'];

    if (!signature || typeof signature !== 'string') {
      logger.warn('Missing stripe-signature header');
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    let event: Stripe.Event;

    try {
      // req.body should be raw Buffer for webhook verification
      event = verifyWebhookSignature(req.body as string | Buffer, signature);
    } catch (err) {
      const error = err as Error;
      logger.error('Webhook signature verification failed', { error: error.message });
      res.status(400).json({ error: `Webhook Error: ${error.message}` });
      return;
    }

    // Handle the event
    handleStripeEvent(event);
    res.json({ received: true });
  }),
);

/**
 * Handle Stripe webhook events
 */
function handleStripeEvent(event: Stripe.Event): void {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      logger.info('Checkout session completed', {
        sessionId: session.id,
        customerId: session.customer,
        subscriptionId: session.subscription,
      });
      handleCheckoutComplete(session);
      break;
    }

    case 'customer.subscription.created': {
      const subscription = event.data.object;
      logger.info('Subscription created', {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        status: subscription.status,
      });
      handleSubscriptionCreated(subscription);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      logger.info('Subscription updated', {
        subscriptionId: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
      handleSubscriptionUpdated(subscription);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      logger.info('Subscription deleted', {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
      });
      handleSubscriptionDeleted(subscription);
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object;
      logger.info('Invoice paid', {
        invoiceId: invoice.id,
        customerId: invoice.customer,
        amountPaid: invoice.amount_paid,
      });
      handleInvoicePaid(invoice);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      logger.warn('Invoice payment failed', {
        invoiceId: invoice.id,
        customerId: invoice.customer,
        attemptCount: invoice.attempt_count,
      });
      handlePaymentFailed(invoice);
      break;
    }

    default:
      logger.debug('Unhandled webhook event type', { type: event.type });
  }
}

/**
 * Handle checkout session completion
 */
function handleCheckoutComplete(session: Stripe.Checkout.Session): void {
  // TODO: Update user's subscription status in database
  logger.info('Processing checkout completion', { sessionId: session.id });
}

/**
 * Handle new subscription created
 */
function handleSubscriptionCreated(subscription: Stripe.Subscription): void {
  // TODO: Create subscription record in database
  logger.info('Processing subscription creation', { subscriptionId: subscription.id });
}

/**
 * Handle subscription update
 */
function handleSubscriptionUpdated(subscription: Stripe.Subscription): void {
  // TODO: Update subscription status in database
  logger.info('Processing subscription update', {
    subscriptionId: subscription.id,
    status: subscription.status,
  });
}

/**
 * Handle subscription cancellation
 */
function handleSubscriptionDeleted(subscription: Stripe.Subscription): void {
  // TODO: Mark subscription as canceled in database
  logger.info('Processing subscription deletion', { subscriptionId: subscription.id });
}

/**
 * Handle successful invoice payment
 */
function handleInvoicePaid(invoice: Stripe.Invoice): void {
  // TODO: Update payment records
  logger.info('Processing paid invoice', { invoiceId: invoice.id });
}

/**
 * Handle failed invoice payment
 */
function handlePaymentFailed(invoice: Stripe.Invoice): void {
  // TODO: Notify user about payment failure
  logger.info('Processing failed payment', {
    invoiceId: invoice.id,
    attemptCount: invoice.attempt_count,
  });
}

export default router;
