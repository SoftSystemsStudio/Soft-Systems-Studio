/**
 * Vapi Setup Script
 *
 * This script creates the Prattville Midwifery voice assistant in Vapi
 * and configures the end-of-call webhook to send data to n8n.
 *
 * Usage:
 *   VAPI_API_KEY=your_key N8N_INTAKE_WEBHOOK_URL=your_url npx ts-node setup-vapi.ts
 */

import fs from 'fs';
import path from 'path';

const VAPI_API_BASE = 'https://api.vapi.ai';

interface VapiAssistant {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface VapiPhoneNumber {
  id: string;
  number: string;
  [key: string]: unknown;
}

async function main() {
  const apiKey = process.env.VAPI_API_KEY;
  const n8nWebhookUrl = process.env.N8N_INTAKE_WEBHOOK_URL;

  if (!apiKey) {
    console.error('❌ VAPI_API_KEY environment variable is required');
    process.exit(1);
  }

  if (!n8nWebhookUrl) {
    console.error('❌ N8N_INTAKE_WEBHOOK_URL environment variable is required');
    process.exit(1);
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  // Load assistant configuration
  const configPath = path.join(__dirname, 'assistant-config.json');
  const assistantConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  // Add the server URL for webhooks
  assistantConfig.serverUrl = n8nWebhookUrl;

  console.log('🚀 Creating Vapi Assistant...');

  // Create the assistant
  const assistantResponse = await fetch(`${VAPI_API_BASE}/assistant`, {
    method: 'POST',
    headers,
    body: JSON.stringify(assistantConfig),
  });

  if (!assistantResponse.ok) {
    const error = await assistantResponse.text();
    console.error('❌ Failed to create assistant:', error);
    process.exit(1);
  }

  const assistant: VapiAssistant = await assistantResponse.json();
  console.log(`✅ Assistant created: ${assistant.name} (ID: ${assistant.id})`);

  // List available phone numbers to purchase
  console.log('\n📞 Fetching available phone numbers...');

  // Buy a phone number (US)
  const phoneResponse = await fetch(`${VAPI_API_BASE}/phone-number`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      provider: 'vapi',
      // Request a US number - Vapi will assign one
      assistantId: assistant.id,
      name: 'Prattville Midwifery Line',
    }),
  });

  if (!phoneResponse.ok) {
    const error = await phoneResponse.text();
    console.error('❌ Failed to create phone number:', error);
    console.log('\n💡 You can manually assign a phone number in the Vapi dashboard.');
    console.log(`   Assistant ID: ${assistant.id}`);
  } else {
    const phoneNumber: VapiPhoneNumber = await phoneResponse.json();
    console.log(`✅ Phone number assigned: ${phoneNumber.number}`);
    console.log(`   Phone ID: ${phoneNumber.id}`);
  }

  // Output summary
  console.log('\n' + '='.repeat(60));
  console.log('🎉 SETUP COMPLETE');
  console.log('='.repeat(60));
  console.log(`\nAssistant ID: ${assistant.id}`);
  console.log(`\nNext steps:`);
  console.log('1. Go to https://dashboard.vapi.ai');
  console.log('2. Verify the assistant configuration');
  console.log('3. If no phone number was assigned, buy one and link it to the assistant');
  console.log('4. Test by calling the assigned number');
  console.log('\nWebhook Configuration:');
  console.log(`- End-of-call data will be sent to: ${n8nWebhookUrl}`);
  console.log('\nSave this assistant ID for future reference:');
  console.log(`VAPI_ASSISTANT_ID=${assistant.id}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
