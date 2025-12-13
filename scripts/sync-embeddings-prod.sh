#!/bin/bash
# Sync knowledge base embeddings to Qdrant in production
# This generates embeddings for all KB documents and uploads them to Qdrant

set -e

echo "🔄 Syncing knowledge base embeddings to Qdrant..."
echo ""

# Check required environment variables
if [ -z "$RAILWAY_DATABASE_URL" ]; then
  echo "❌ Error: RAILWAY_DATABASE_URL not set"
  exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
  echo "❌ Error: OPENAI_API_KEY not set"
  exit 1
fi

if [ -z "$QDRANT_URL" ] && [ -z "$QDRANT_HOST" ]; then
  echo "❌ Error: QDRANT_URL or QDRANT_HOST not set"
  echo "   Example: QDRANT_URL=https://<cluster>.cloud.qdrant.io:6333"
  exit 1
fi

if [ -z "$QDRANT_API_KEY" ]; then
  echo "❌ Error: QDRANT_API_KEY not set"
  exit 1
fi

export DATABASE_URL="$RAILWAY_DATABASE_URL"

# Navigate to agent-api
cd "$(dirname "$0")/../apps/agent-api"

echo "📦 Installing dependencies..."
pnpm install --silent

echo ""
echo "🧠 Generating embeddings and uploading to Qdrant..."
echo "   This may take a minute..."

# Create a Node script to sync embeddings
node <<'EOF'
const { PrismaClient } = require('@prisma/client');
const { OpenAI } = require('openai');
const https = require('https');

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const qdrantUrl = process.env.QDRANT_URL
  || (process.env.QDRANT_HOST
    ? (process.env.QDRANT_HOST.startsWith('http')
      ? process.env.QDRANT_HOST
      : `https://${process.env.QDRANT_HOST}:${process.env.QDRANT_PORT || 6333}`)
    : undefined);

const COLLECTION_NAME = 'kb'; // Hardcode to kb for production
const API_KEY = process.env.QDRANT_API_KEY;

// Helper to make Qdrant API requests
async function qdrantRequest(path, method = 'GET', body = null) {
  const url = new URL(path, qdrantUrl);
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'api-key': API_KEY,
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), options);
  if (!response.ok) {
    const text = await response.text();
    console.error(`Qdrant request failed: ${method} ${path} - ${response.status}`);
    console.error(`Response: ${text}`);
    throw new Error(`Qdrant request failed: ${response.status} ${text}`);
  }
  const result = await response.json();
  if (method !== 'GET') {
    console.log(`   ✓ ${method} ${path} - ${result.status}`);
  }
  return result;
}

async function syncEmbeddings() {
  try {
    console.log('📚 Fetching KB documents from database...');
    const documents = await prisma.kbDocument.findMany({
      where: { workspaceId: 'demo' },
      select: { id: true, title: true, content: true },
    });

    console.log(`   Found ${documents.length} documents`);

    if (documents.length === 0) {
      console.log('⚠️  No documents found. Run seed script first.');
      process.exit(1);
    }

    // Ensure collection exists
    console.log('🗄️  Checking Qdrant collection...');
    try {
      await qdrantRequest(`/collections/${COLLECTION_NAME}`, 'GET');
      console.log('   Collection already exists');
    } catch (e) {
      console.log('   Creating new collection');
      await qdrantRequest(`/collections/${COLLECTION_NAME}`, 'PUT', {
        vectors: { size: 1536, distance: 'Cosine' },
      });
    }

    console.log('🚀 Generating embeddings...');
    
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const text = `${doc.title}\n\n${doc.content}`;
      
      console.log(`   Embedding: ${doc.title.substring(0, 50)}...`);
      
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      const embedding = response.data[0].embedding;

      await qdrantRequest(`/collections/${COLLECTION_NAME}/points`, 'PUT', {
        points: [
          {
            id: i + 1, // Use numeric ID (1-based index)
            vector: embedding,
            payload: {
              documentId: doc.id,
              title: doc.title,
              content: doc.content,
              text: text, // Include full text for retrieval
              workspaceId: 'demo',
            },
          },
        ],
      });
    }

    console.log('');
    console.log(`✅ Successfully synced ${documents.length} documents to Qdrant!`);
    
  } catch (error) {
    const message = error?.message || String(error);
    if (String(message).toLowerCase().includes('forbidden')) {
      console.error('❌ Error syncing embeddings: Forbidden (Qdrant rejected credentials).');
      console.error('   Verify QDRANT_API_KEY and that it has write access for this cluster.');
    } else {
      console.error('❌ Error syncing embeddings:', message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

syncEmbeddings();
EOF

echo ""
echo "✅ Embeddings synced successfully!"
echo ""
echo "🎉 Test the chat:"
echo "   curl -X POST https://apps-agent-api-production.up.railway.app/api/v1/public/chat \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\":\"what services do you offer?\"}'"
