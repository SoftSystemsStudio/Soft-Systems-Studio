// packages/frontend/src/pages/_app.tsx
import type { AppProps } from 'next/app';
import { ClerkProvider } from '@clerk/nextjs';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider>
      <GoogleAnalytics />
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
