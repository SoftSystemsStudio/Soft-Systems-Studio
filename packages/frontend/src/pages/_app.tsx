// packages/frontend/src/pages/_app.tsx
import type { AppProps } from 'next/app';
import { ClerkProvider } from '@clerk/nextjs';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import {
  SoundManagerProvider,
  ViewTransitionsProvider,
  viewTransitionStyles,
} from '@/components/ui';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider>
      <SoundManagerProvider>
        <ViewTransitionsProvider>
          {/* Inject view transition CSS */}
          <style jsx global>
            {viewTransitionStyles}
          </style>
          <GoogleAnalytics />
          <Component {...pageProps} />
        </ViewTransitionsProvider>
      </SoundManagerProvider>
    </ClerkProvider>
  );
}
