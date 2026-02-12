import { NextRequest, NextResponse } from 'next/server';
import env from '@/lib/env';

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
export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  const cronSecret = env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Call the backend API to cleanup tokens
    const apiUrl = env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const response = await fetch(`${apiUrl}/api/v1/admin/cleanup-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pass cron secret to backend for verification
        ...(cronSecret && { Authorization: `Bearer ${cronSecret}` }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[cron/cleanup-tokens] Backend error:', errorText);
      return NextResponse.json(
        { error: 'Backend cleanup failed', details: errorText },
        { status: response.status },
      );
    }

    const result = (await response.json()) as Record<string, unknown>;

    return NextResponse.json({
      ok: true,
      message: 'Token cleanup completed',
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error) {
    console.error('[cron/cleanup-tokens] Error:', error);
    return NextResponse.json(
      {
        error: 'Cleanup failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
