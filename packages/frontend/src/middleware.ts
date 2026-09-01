import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/intake',
  '/privacy',
  '/terms',
  '/digital-products', // Digital products section (redirects to homepage anchor)
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/demo(.*)', // All demo routes are public
  '/api/cron/(.*)',
  '/api/intake',
  '/api/og',
  '/api/livekit-token',
  '/api/send-email',
  '/api/test-email',
]);

// Skip Clerk middleware entirely when CLERK_SECRET_KEY is not configured
// (matches the conditional ClerkProvider in providers.tsx)
/* eslint-disable no-restricted-syntax -- middleware needs direct process.env access */
const clerkConfigured = Boolean(process.env.CLERK_SECRET_KEY);
/* eslint-enable no-restricted-syntax */

export default clerkConfigured
  ? clerkMiddleware(async (auth, request) => {
      if (!isPublicRoute(request)) {
        await auth.protect();
      }
    })
  : () => NextResponse.next();

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and metadata routes. Metadata
    // routes (robots.txt, sitemap.xml — and favicon/opengraph-image/
    // manifest.webmanifest if added later) are crawler-facing by definition
    // and must never require auth; excluding their extensions here means any
    // current or future metadata route is public automatically, rather than
    // needing its own entry in isPublicRoute below. (favicon/icon/opengraph-
    // image/webmanifest extensions were already covered before this change —
    // txt/xml are the two added now, for robots.txt/sitemap.xml. A future
    // manifest.json specifically would need its own '.json' addition here.)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|txt|xml)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
