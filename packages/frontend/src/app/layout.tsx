import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Space_Grotesk } from 'next/font/google';
import '../styles/globals.css';
import { AppProviders } from './providers';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://softsystemsstudiollc.com'),
  title: {
    default: 'Soft Systems Studio — Websites & AI Receptionist for Local Businesses',
    template: '%s | Soft Systems Studio',
  },
  description:
    'A flat $997 website build and a browser-based AI receptionist demo for service businesses in Phenix City & Smiths Station, AL, and Columbus, GA. Retainers from $150/month.',
  keywords: [
    'website design Phenix City AL',
    'AI receptionist for small business',
    'web designer Columbus GA',
    'local business website builder',
    'AI phone answering demo',
    'Smiths Station AL web design',
    'service business website',
    'affordable website build',
    'AI voice assistant demo',
    'website retainer plan',
  ],
  authors: [{ name: 'Soft Systems Studio LLC' }],
  creator: 'Soft Systems Studio LLC',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://softsystemsstudiollc.com',
    siteName: 'Soft Systems Studio',
    title: 'Websites & AI Receptionist for Local Businesses | Soft Systems Studio',
    description:
      'A flat $997 website build and a browser-based AI receptionist demo for service businesses near Phenix City, AL and Columbus, GA.',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Soft Systems Studio - Websites & AI Receptionist for Local Businesses',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Websites & AI Receptionist for Local Businesses | Soft Systems Studio',
    description:
      'A flat $997 website build and a browser-based AI receptionist demo for local service businesses.',
    images: ['/api/og'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className="antialiased min-h-screen bg-[#050505] text-gray-200 selection:bg-lime-400 selection:text-black">
        <AppProviders>
          <Suspense>
            <GoogleAnalytics />
          </Suspense>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
