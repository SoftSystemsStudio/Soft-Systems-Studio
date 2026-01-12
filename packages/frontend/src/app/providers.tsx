'use client';

import { ClerkProvider } from '@clerk/nextjs';
import {
  SoundManagerProvider,
  ViewTransitionsProvider,
  viewTransitionStyles,
} from '@/components/ui';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <SoundManagerProvider>
        <ViewTransitionsProvider>
          {/* Inject view transition CSS */}
          <style dangerouslySetInnerHTML={{ __html: viewTransitionStyles }} />
          {children}
        </ViewTransitionsProvider>
      </SoundManagerProvider>
    </ClerkProvider>
  );
}
