'use client';

import { ClerkProvider } from '@clerk/nextjs';
import env from '@/lib/env';

export function AppProviders({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- false positive: ESLint cannot resolve @/ path alias
  if (!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }
  return <ClerkProvider>{children}</ClerkProvider>;
}
