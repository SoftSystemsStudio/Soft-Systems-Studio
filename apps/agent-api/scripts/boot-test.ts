#!/usr/bin/env ts-node
/**
 * Boot test script - validates the service can start without crashing
 * Used in CI to catch missing dependencies or import errors early
 *
 * Usage: npx ts-node scripts/boot-test.ts
 * Or after build: node dist/scripts/boot-test.js
 */

function bootTest(): void {
  console.log('🔍 Running boot test...');

  // Set minimal required env vars for boot test (won't actually connect)
  process.env.NODE_ENV = 'test';
  process.env.PORT = '5000'; // Valid port for validation
  process.env.POSTGRES_URL = 'postgresql://test:test@localhost:5432/test';
  process.env.DATABASE_URL = process.env.POSTGRES_URL;
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.OPENAI_API_KEY = 'sk-test-key-for-boot-test';
  process.env.JWT_SECRET = 'test-jwt-secret-must-be-32-chars-long';

  try {
    // Test critical imports - these will throw if modules are missing
    console.log('  ✓ Testing module imports...');

    // Core dependencies
    require('express');
    console.log('    ✓ express');

    require('zod');
    console.log('    ✓ zod');

    require('@prisma/client');
    console.log('    ✓ @prisma/client');

    require('ioredis');
    console.log('    ✓ ioredis');

    require('jsonwebtoken');
    console.log('    ✓ jsonwebtoken');

    require('pino');
    console.log('    ✓ pino');

    // Test our own modules compile correctly
    console.log('  ✓ Testing internal modules...');

    require('../src/env');
    console.log('    ✓ env validation');

    require('../src/logger');
    console.log('    ✓ logger');

    console.log('\n✅ Boot test passed! All critical modules loaded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Boot test failed!');
    console.error(error);
    process.exit(1);
  }
}

bootTest();