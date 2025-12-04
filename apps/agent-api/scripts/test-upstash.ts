/**
 * Test Upstash Redis connection
 * Run with: npx ts-node scripts/test-upstash.ts
 */

import 'dotenv/config';

async function testUpstash() {
  console.log('🔍 Testing Upstash Redis connection...\n');

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.error('❌ UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set');
    process.exit(1);
  }

  console.log(`  URL: ${url}`);
  console.log(`  Token: ${token.substring(0, 10)}...`);

  try {
    // Import Upstash Redis
    const { Redis } = await import('@upstash/redis');

    const redis = new Redis({
      url: url.replace(/"/g, ''), // Remove any quotes
      token: token.replace(/"/g, ''),
    });

    // Test PING
    console.log('\n📡 Testing PING...');
    const pong = await redis.ping();
    console.log(`  ✅ PING response: ${pong}`);

    // Test SET
    console.log('\n📝 Testing SET...');
    await redis.set('test:connection', 'Hello from Soft Systems Studio!');
    console.log('  ✅ SET successful');

    // Test GET
    console.log('\n📖 Testing GET...');
    const value = await redis.get('test:connection');
    console.log(`  ✅ GET response: ${value}`);

    // Test INCR (for rate limiting)
    console.log('\n🔢 Testing INCR (rate limiting simulation)...');
    const count = await redis.incr('test:counter');
    console.log(`  ✅ Counter value: ${count}`);

    // Test EXPIRE
    console.log('\n⏰ Testing EXPIRE...');
    await redis.expire('test:counter', 60);
    const ttl = await redis.ttl('test:counter');
    console.log(`  ✅ TTL set: ${ttl} seconds`);

    // Cleanup
    console.log('\n🧹 Cleaning up test keys...');
    await redis.del('test:connection', 'test:counter');
    console.log('  ✅ Cleanup complete');

    console.log('\n✅ All Upstash Redis tests passed!\n');
    console.log('Your Upstash Redis is ready for:');
    console.log('  • Caching');
    console.log('  • Rate limiting');
    console.log('  • Session storage');
    console.log('  • Queue state management');
  } catch (error) {
    console.error('\n❌ Upstash Redis test failed:', error);
    process.exit(1);
  }
}

testUpstash();
