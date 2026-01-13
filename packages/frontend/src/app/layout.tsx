// packages/frontend/src/app/layout.tsx
import type { Metadata } from 'next';
import '../styles/globals.css';
import { AppProviders } from './providers';

export const metadata: Metadata = {
  title: 'Soft Systems Studio',
  description: 'AI-powered voice automation for modern businesses',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
