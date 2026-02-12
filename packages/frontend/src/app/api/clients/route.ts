import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Mock clients data for now - replace with real DB/API call later
const mockClients = [
  {
    id: 'demo-client-1',
    companyName: 'Acme Corp',
    website: 'https://acme.example.com',
    industry: 'Technology',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-client-2',
    companyName: 'Globex Industries',
    website: 'https://globex.example.com',
    industry: 'Manufacturing',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function GET() {
  // Verify user is authenticated
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return mock clients for now
  // TODO: Replace with real database query
  return NextResponse.json(mockClients);
}
