import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/intake',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/cron/(.*)',
  '/api/intake',
  '/api/test-email',
  '/api/send-email',
  '/test-email',
  '/demo',
  '/about',
  '/terminal',
  '/hologram-test',
  '/pulse-test',
  '/architect-test',
  '/terminal-test',
  '/system-v1',
  '/god-tier',
  '/clients',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
