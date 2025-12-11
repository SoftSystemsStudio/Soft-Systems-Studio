#!/usr/bin/env node
/**
 * Migrate .env secrets to HashiCorp Vault
 * 
 * Usage:
 *   VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=root node scripts/migrate-env-to-vault.js
 * 
 * Options:
 *   --env-file=<path>      Path to .env file (default: .env)
 *   --vault-prefix=<path>  Vault path prefix (default: app/prod)
 *   --mount=<mount>        Vault mount point (default: secret)
 *   --dry-run              Print commands without executing
 *   --group-by=<strategy>  Group secrets: 'single' (all in one path) or 'service' (default: service)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Parse command line args
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  if (key.startsWith('--')) {
    acc[key.replace('--', '')] = value || true;
  }
  return acc;
}, {});

const envFile = args['env-file'] || '.env';
const vaultPrefix = args['vault-prefix'] || 'app/prod';
const mount = args.mount || 'secret';
const dryRun = args['dry-run'] === true;
const groupBy = args['group-by'] || 'service';

const VAULT_ADDR = process.env.VAULT_ADDR;
const VAULT_TOKEN = process.env.VAULT_TOKEN;

if (!VAULT_ADDR) {
  console.error('Error: VAULT_ADDR environment variable is required');
  process.exit(1);
}

if (!VAULT_TOKEN && !dryRun) {
  console.error('Error: VAULT_TOKEN environment variable is required (or use --dry-run)');
  process.exit(1);
}

// Secret grouping strategy
const SERVICE_GROUPS = {
  database: ['DATABASE_URL', 'POSTGRES_URL', 'POSTGRESQL_URL'],
  redis: ['REDIS_URL', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
  jwt: ['JWT_SECRET', 'JWT_ALGORITHM'],
  openai: ['OPENAI_API_KEY', 'OPENAI_ORG_ID'],
  stripe: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_PUBLISHABLE_KEY'],
  sentry: ['SENTRY_DSN', 'SENTRY_AUTH_TOKEN'],
  qdrant: ['QDRANT_URL', 'QDRANT_API_KEY'],
  qstash: ['QSTASH_URL', 'QSTASH_TOKEN', 'QSTASH_CURRENT_SIGNING_KEY', 'QSTASH_NEXT_SIGNING_KEY'],
  api: ['API_KEY', 'ADMIN_API_KEY', 'CRON_SECRET'],
};

function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const secrets = {};
  
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '');
      secrets[key] = cleanValue;
    }
  }
  
  return secrets;
}

function groupSecrets(secrets) {
  if (groupBy === 'single') {
    return { all: secrets };
  }
  
  const groups = {};
  const unmatched = {};
  
  for (const [key, value] of Object.entries(secrets)) {
    let grouped = false;
    for (const [service, keys] of Object.entries(SERVICE_GROUPS)) {
      if (keys.includes(key)) {
        groups[service] = groups[service] || {};
        groups[service][key] = value;
        grouped = true;
        break;
      }
    }
    if (!grouped) {
      unmatched[key] = value;
    }
  }
  
  if (Object.keys(unmatched).length > 0) {
    groups.misc = unmatched;
  }
  
  return groups;
}

async function writeToVault(vaultPath, data) {
  const url = new URL(`/v1/${vaultPath}`, VAULT_ADDR);
  const protocol = url.protocol === 'https:' ? https : http;
  
  return new Promise((resolve, reject) => {
    const req = protocol.request(url, {
      method: 'POST',
      headers: {
        'X-Vault-Token': VAULT_TOKEN,
        'Content-Type': 'application/json',
      },
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ ok: true, status: res.statusCode });
        } else {
          reject(new Error(`Vault write failed: ${res.statusCode} ${body}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(JSON.stringify({ data }));
    req.end();
  });
}

async function main() {
  console.log('🔐 Migrating .env to Vault\n');
  console.log(`Configuration:`);
  console.log(`  Env file: ${envFile}`);
  console.log(`  Vault address: ${VAULT_ADDR}`);
  console.log(`  Mount point: ${mount}`);
  console.log(`  Path prefix: ${vaultPrefix}`);
  console.log(`  Grouping: ${groupBy}`);
  console.log(`  Dry run: ${dryRun ? 'yes' : 'no'}\n`);
  
  // Parse .env file
  if (!fs.existsSync(envFile)) {
    console.error(`Error: ${envFile} not found`);
    process.exit(1);
  }
  
  const secrets = parseEnvFile(envFile);
  console.log(`📄 Found ${Object.keys(secrets).length} secrets in ${envFile}\n`);
  
  // Group secrets
  const groups = groupSecrets(secrets);
  
  // Generate VAULT_MAPPING
  const mapping = {};
  
  // Write to Vault
  for (const [groupName, groupSecrets] of Object.entries(groups)) {
    const relativePath = groupBy === 'single' ? 'secrets' : groupName;
    const fullPath = `${mount}/data/${vaultPrefix}/${relativePath}`;
    
    console.log(`📦 Group: ${groupName} (${Object.keys(groupSecrets).length} secrets)`);
    console.log(`   Path: ${fullPath}\n`);
    
    for (const [key, value] of Object.entries(groupSecrets)) {
      const displayValue = value.length > 20 ? `${value.substring(0, 20)}...` : value;
      console.log(`   ${key}=${displayValue}`);
      
      // Add to mapping (use the non-KV-v2 path format for mapping)
      mapping[key] = `${vaultPrefix}/${relativePath}#${key}`;
    }
    
    console.log();
    
    if (!dryRun) {
      try {
        await writeToVault(fullPath, groupSecrets);
        console.log(`   ✅ Wrote to Vault\n`);
      } catch (err) {
        console.error(`   ❌ Failed to write: ${err.message}\n`);
      }
    } else {
      console.log(`   (dry run - not written)\n`);
    }
  }
  
  // Print VAULT_MAPPING
  console.log('\n📋 Add this to your environment:\n');
  console.log(`export VAULT_ADDR="${VAULT_ADDR}"`);
  console.log(`export VAULT_MOUNT="${mount}"`);
  console.log(`export VAULT_MAPPING='${JSON.stringify(mapping, null, 2)}'`);
  
  // Print for .env.vault or similar
  console.log('\n📝 Or add to your .env.vault file:\n');
  console.log(`VAULT_ADDR=${VAULT_ADDR}`);
  console.log(`VAULT_MOUNT=${mount}`);
  console.log(`VAULT_MAPPING=${JSON.stringify(mapping)}`);
  
  console.log('\n✅ Migration complete!');
  
  if (dryRun) {
    console.log('\n⚠️  This was a dry run. Re-run without --dry-run to actually write secrets.');
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
