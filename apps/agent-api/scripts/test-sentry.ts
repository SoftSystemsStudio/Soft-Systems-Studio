/**
 * Test script for Sentry backend integration
 *
 * Run with: npx ts-node --transpile-only scripts/test-sentry.ts
 */

import * as Sentry from '@sentry/node';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const dsn = process.env.SENTRY_DSN;

if (!dsn) {
  console.error('❌ SENTRY_DSN is not set in .env');
  process.exit(1);
}

console.log('🔧 Initializing Sentry...');
console.log(`   DSN: ${dsn.substring(0, 30)}...`);
console.log(`   Environment: ${process.env.SENTRY_ENVIRONMENT || 'development'}`);

// Initialize Sentry for testing
Sentry.init({
  dsn,
  environment: process.env.SENTRY_ENVIRONMENT || 'development',
  tracesSampleRate: 1.0,
  debug: true, // Enable debug mode to see what's happening
});

async function testSentry() {
  console.log('\n📤 Sending test error to Sentry...');

  try {
    // Capture a test exception
    const eventId = Sentry.captureException(
      new Error('Test error from backend Sentry test script'),
    );
    console.log(`   Event ID: ${eventId}`);

    // Capture a test message
    const messageId = Sentry.captureMessage('Test message from backend Sentry test script', 'info');
    console.log(`   Message ID: ${messageId}`);

    // Flush to ensure events are sent
    console.log('\n⏳ Flushing events to Sentry...');
    await Sentry.flush(5000);

    console.log('\n✅ Sentry test completed!');
    console.log('   Check your Sentry dashboard for:');
    console.log('   - "Test error from backend Sentry test script"');
    console.log('   - "Test message from backend Sentry test script"');
    console.log(
      `\n   Dashboard: https://sentry.io/organizations/${process.env.SENTRY_ORG || 'your-org'}/issues/`,
    );
  } catch (error) {
    console.error('❌ Error during Sentry test:', error);
  }
}

testSentry();
