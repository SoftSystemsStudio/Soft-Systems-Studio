import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Cron endpoint for cleaning up expired refresh tokens
 *
 * Configure in vercel.json:
 * ```json
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-tokens",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 * ```
 *
 * This endpoint is protected by Vercel's CRON_SECRET
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests (Vercel cron uses GET)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify the request is from Vercel Cron
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Call the backend API to cleanup tokens
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const response = await fetch(`${apiUrl}/api/v1/admin/cleanup-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pass cron secret to backend for verification
        ...(cronSecret && { Authorization: `Bearer ${cronSecret}` }),
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[cron/cleanup-tokens] Backend error:', error);
      return res.status(response.status).json({ error: 'Backend cleanup failed', details: error });
    }

    const result = await response.json();

    return res.status(200).json({
      ok: true,
      message: 'Token cleanup completed',
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error) {
    console.error('[cron/cleanup-tokens] Error:', error);
    return res.status(500).json({
      error: 'Cleanup failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
