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
    default: 'Soft Systems Studio — AI Receptionists for Local Businesses',
    template: '%s | Soft Systems Studio',
  },
  description:
    'AI receptionists and websites for plumbers, dentists, contractors, and local service businesses. Never miss a customer call again.',
  keywords: [
    'AI receptionist',
    'virtual receptionist',
    'plumber answering service',
    'dentist receptionist',
    'contractor phone service',
    'small business AI',
    'local business automation',
  ],
  authors: [{ name: 'Soft Systems Studio LLC' }],
  creator: 'Soft Systems Studio LLC',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://softsystemsstudiollc.com',
    siteName: 'Soft Systems Studio',
    title: 'Soft Systems Studio — AI Receptionists for Local Businesses',
    description:
      'AI receptionists and websites for plumbers, dentists, contractors, and local service businesses. Never miss a customer call again.',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Soft Systems Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Soft Systems Studio — AI Receptionists for Local Businesses',
    description:
      'AI receptionists and websites for plumbers, dentists, contractors, and local service businesses.',
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
