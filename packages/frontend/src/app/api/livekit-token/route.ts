import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { AccessToken, RoomServiceClient, TrackSource } from 'livekit-server-sdk';
import { getEnv } from '@/lib/env';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

// The LiveKit Cloud free tier this demo runs on allows 5 concurrent agent
// sessions. Each demo room only ever holds one visitor + one agent, so the
// number of live "demo-*" rooms is a good proxy for slots in use.
const MAX_CONCURRENT_ROOMS = 5;
const ROOM_PREFIX = 'demo-';

// How long the agent lets the call run before it hangs up on its own
// (see agent.py in the sss-receptionist project). Returned to the client so
// the UI can surface it up front rather than the disconnect looking like a
// bug.
const DEMO_CAP_SECONDS = 180;

// Token TTL: comfortably longer than the demo cap plus connection overhead,
// but still short-lived. This only bounds how long the JWT can be used to
// *authenticate* — it doesn't cut the call short once connected.
const TOKEN_TTL_SECONDS = 5 * 60;

// Basic per-IP abuse protection. Best-effort (see lib/rateLimit.ts) — this is
// a low-traffic marketing site demo, not a service that needs airtight
// distributed rate limiting.
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  const env = getEnv();

  if (!env.LIVEKIT_URL || !env.LIVEKIT_API_KEY || !env.LIVEKIT_API_SECRET) {
    console.error(
      'LiveKit is not configured: LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET missing',
    );
    return NextResponse.json(
      { error: 'not_configured', message: 'The voice demo is not available right now.' },
      { status: 500 },
    );
  }

  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`livekit-token:${ip}`, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: 'rate_limited',
        message:
          "You've tried the demo a few times already — give it a minute before trying again.",
      },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds ?? 60) } },
    );
  }

  // Best-effort capacity check against the free-tier's concurrent-session cap.
  // Fails open: if listing rooms errors out, we don't block the demo on it —
  // the client's own "agent never joined" timeout is the backstop for that.
  try {
    const httpUrl = env.LIVEKIT_URL.replace(/^ws/, 'http');
    const roomService = new RoomServiceClient(httpUrl, env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET);
    const rooms = await roomService.listRooms();
    const activeDemoRooms = rooms.filter((r) => r.name.startsWith(ROOM_PREFIX));
    if (activeDemoRooms.length >= MAX_CONCURRENT_ROOMS) {
      return NextResponse.json(
        {
          error: 'busy',
          message:
            'The demo is busy right now — all AI receptionist lines are in use. Please try again in a minute.',
        },
        { status: 503 },
      );
    }
  } catch (err) {
    console.error('LiveKit capacity check failed, proceeding without it:', err);
  }

  // Unguessable, single-use room name — not sequential, not derived from
  // anything client-supplied.
  const roomName = `${ROOM_PREFIX}${randomBytes(12).toString('hex')}`;
  const identity = `visitor-${randomBytes(6).toString('hex')}`;

  const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
    identity,
    ttl: TOKEN_TTL_SECONDS,
  });

  // Scoped to exactly this one room, not a wildcard, and restricted to
  // publishing microphone audio only (no camera, no data channel).
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canPublishSources: [TrackSource.MICROPHONE],
    canSubscribe: true,
    canPublishData: false,
  });

  try {
    const token = await at.toJwt();
    return NextResponse.json({
      token,
      serverUrl: env.LIVEKIT_URL,
      roomName,
      capSeconds: DEMO_CAP_SECONDS,
    });
  } catch (err) {
    console.error('Failed to mint LiveKit token:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'Could not start the demo. Please try again.' },
      { status: 500 },
    );
  }
}
