/**
 * Test script for Stripe integration
 * Run with: npx tsx scripts/test-stripe.ts
 */
import 'dotenv/config';

async function testStripe() {
  console.log('🔧 Testing Stripe Integration...\n');

  // Check environment variables
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  console.log('📋 Environment Variables:');
  console.log(
    `  STRIPE_SECRET_KEY: ${secretKey ? `${secretKey.substring(0, 12)}...` : '❌ NOT SET'}`,
  );
  console.log(
    `  STRIPE_WEBHOOK_SECRET: ${webhookSecret ? `${webhookSecret.substring(0, 12)}...` : '❌ NOT SET'}`,
  );

  if (!secretKey || secretKey.includes('YOUR_SECRET_KEY')) {
    console.log('\n❌ STRIPE_SECRET_KEY is not configured properly.');
    console.log('   Get your key from: https://dashboard.stripe.com/apikeys');
    process.exit(1);
  }

  console.log('\n🔌 Testing Stripe API connection...');

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(secretKey, {
      typescript: true,
      appInfo: {
        name: 'Soft Systems Studio Test',
        version: '1.0.0',
      },
    });

    // Test 1: Fetch account info
    console.log('\n📊 Test 1: Fetching account info...');
    const account = await stripe.accounts.retrieve();
    console.log(`  ✅ Connected to Stripe account`);
    console.log(`     Account ID: ${account.id}`);
    console.log(`     Country: ${account.country}`);
    console.log(`     Default Currency: ${account.default_currency?.toUpperCase()}`);

    // Test 2: List products
    console.log('\n📦 Test 2: Listing products...');
    const products = await stripe.products.list({ limit: 5 });
    if (products.data.length > 0) {
      console.log(`  ✅ Found ${products.data.length} product(s):`);
      products.data.forEach((p) => {
        console.log(`     - ${p.name} (${p.id})`);
      });
    } else {
      console.log('  ℹ️  No products found (this is OK for new accounts)');
    }

    // Test 3: List prices
    console.log('\n💰 Test 3: Listing prices...');
    const prices = await stripe.prices.list({ limit: 5, active: true });
    if (prices.data.length > 0) {
      console.log(`  ✅ Found ${prices.data.length} price(s):`);
      prices.data.forEach((p) => {
        const amount = p.unit_amount ? (p.unit_amount / 100).toFixed(2) : 'N/A';
        const interval = p.recurring?.interval || 'one-time';
        console.log(`     - ${p.id}: $${amount} ${p.currency.toUpperCase()} (${interval})`);
      });
    } else {
      console.log('  ℹ️  No prices found (create products in Stripe Dashboard)');
    }

    // Test 4: List customers
    console.log('\n👥 Test 4: Listing recent customers...');
    const customers = await stripe.customers.list({ limit: 3 });
    if (customers.data.length > 0) {
      console.log(`  ✅ Found ${customers.data.length} customer(s):`);
      customers.data.forEach((c) => {
        console.log(`     - ${c.email || 'No email'} (${c.id})`);
      });
    } else {
      console.log('  ℹ️  No customers found yet');
    }

    // Test 5: Check webhook endpoint (if secret is set)
    if (webhookSecret && !webhookSecret.includes('YOUR_WEBHOOK_SECRET')) {
      console.log('\n🔐 Test 5: Webhook secret configured');
      console.log('  ✅ Webhook secret is set');
      console.log('  ℹ️  To test webhooks, use Stripe CLI:');
      console.log('     stripe listen --forward-to localhost:5000/api/v1/stripe/webhook');
    } else {
      console.log('\n⚠️  Test 5: Webhook secret not configured');
      console.log('  Set STRIPE_WEBHOOK_SECRET after creating webhook endpoint');
    }

    console.log('\n✅ All Stripe tests passed!\n');
    console.log('Your Stripe integration is ready for:');
    console.log('  • Creating checkout sessions');
    console.log('  • Managing subscriptions');
    console.log('  • Processing payments');
    console.log('  • Handling webhooks');
  } catch (error) {
    const err = error as Error & { type?: string; code?: string };
    console.error('\n❌ Stripe test failed:', err.message);

    if (err.type === 'StripeAuthenticationError') {
      console.log('\n💡 Your API key appears to be invalid.');
      console.log('   Make sure you copied the full key from Stripe Dashboard.');
    } else if (err.code === 'ENOTFOUND') {
      console.log('\n💡 Network error - check your internet connection.');
    }

    process.exit(1);
  }
}

testStripe();
