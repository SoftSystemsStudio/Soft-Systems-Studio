'use client';

import { ClerkProvider } from '@clerk/nextjs';
import env from '@/lib/env';

export function AppProviders({ children }: { children: React.ReactNode }) {
  if (!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }
  return <ClerkProvider>{children}</ClerkProvider>;
}
