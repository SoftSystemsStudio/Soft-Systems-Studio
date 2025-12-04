import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';

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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify user is authenticated
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // Return mock clients for now
    // TODO: Replace with real database query
    return res.status(200).json(mockClients);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
