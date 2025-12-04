/**
 * Test Upstash QStash connection
 * Run with: npx ts-node scripts/test-qstash.ts
 */

import 'dotenv/config';

async function testQStash() {
  console.log('🔍 Testing Upstash QStash connection...\n');

  const token = process.env.QSTASH_TOKEN;
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;

  if (!token) {
    console.error('❌ QSTASH_TOKEN not set');
    process.exit(1);
  }

  console.log(`  Token: ${token.substring(0, 20)}...`);
  console.log(
    `  Current Signing Key: ${currentSigningKey ? currentSigningKey.substring(0, 10) + '...' : 'not set'}`,
  );
  console.log(
    `  Next Signing Key: ${nextSigningKey ? nextSigningKey.substring(0, 10) + '...' : 'not set'}`,
  );

  try {
    // Import QStash client
    const { Client } = await import('@upstash/qstash');

    const client = new Client({
      token: token.replace(/"/g, ''),
    });

    // Test: List schedules (this verifies the connection)
    console.log('\n📋 Testing connection by listing schedules...');
    const schedules = await client.schedules.list();
    console.log(`  ✅ Connected! Found ${schedules.length} existing schedule(s)`);

    // Test: Publish a message to a test URL (using httpbin as echo service)
    console.log('\n📤 Testing message publishing...');
    const testUrl = 'https://httpbin.org/post';

    const result = await client.publishJSON({
      url: testUrl,
      body: {
        test: true,
        message: 'Hello from Soft Systems Studio QStash test!',
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`  ✅ Message published!`);
    console.log(`     Message ID: ${result.messageId}`);

    // Test: Get message status (optional, may take a moment to process)
    console.log('\n📊 Message has been queued for delivery to:', testUrl);
    console.log('   (QStash will retry automatically if delivery fails)');

    // Test Receiver setup (for webhook verification)
    if (currentSigningKey && nextSigningKey) {
      console.log('\n🔐 Testing Receiver setup...');
      const { Receiver } = await import('@upstash/qstash');

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _receiver = new Receiver({
        currentSigningKey: currentSigningKey.replace(/"/g, ''),
        nextSigningKey: nextSigningKey.replace(/"/g, ''),
      });

      console.log('  ✅ Receiver initialized (ready to verify webhook signatures)');
    }

    console.log('\n✅ All QStash tests passed!\n');
    console.log('Your QStash is ready for:');
    console.log('  • Background job processing');
    console.log('  • Scheduled tasks (cron jobs)');
    console.log('  • Webhook delivery with retries');
    console.log('  • Delayed message processing');

    console.log('\n📝 Example usage:');
    console.log(`
// Publish a background job
await client.publishJSON({
  url: 'https://your-api.com/api/webhooks/process-email',
  body: { userId: '123', action: 'send-welcome' },
  delay: 60, // delay 60 seconds
  retries: 3,
});

// Schedule a recurring job
await client.schedules.create({
  destination: 'https://your-api.com/api/cron/daily-cleanup',
  cron: '0 9 * * *', // Every day at 9am
});
`);
  } catch (error) {
    console.error('\n❌ QStash test failed:', error);
    process.exit(1);
  }
}

testQStash();
