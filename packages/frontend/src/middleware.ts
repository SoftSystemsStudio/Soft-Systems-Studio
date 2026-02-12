import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/intake',
  '/privacy',
  '/terms',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/demo',
  '/api/cron/(.*)',
  '/api/intake',
  '/api/og',
  '/api/demo-call',
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
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
