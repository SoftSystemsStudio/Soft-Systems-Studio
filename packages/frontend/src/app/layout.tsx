// packages/frontend/src/app/layout.tsx
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { SoundManagerProvider, ViewTransitionsProvider, viewTransitionStyles } from '@/components/ui';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Soft Systems Studio',
  description: 'AI-powered voice automation for modern businesses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Inject view transition CSS */}
        <style dangerouslySetInnerHTML={{ __html: viewTransitionStyles }} />
      </head>
      <body>
        <ClerkProvider>
          <SoundManagerProvider>
            <ViewTransitionsProvider>
              <GoogleAnalytics />
              {children}
            </ViewTransitionsProvider>
          </SoundManagerProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
