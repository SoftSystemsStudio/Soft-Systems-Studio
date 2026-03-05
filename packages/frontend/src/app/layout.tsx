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
    default: 'Soft Systems Studio — Digital Products, AI Websites & Automation for Entrepreneurs',
    template: '%s | Soft Systems Studio',
  },
  description:
    'Ready-to-use templates ($19-29), AI-powered websites ($799+), and intelligent automation for entrepreneurs who refuse to waste time. No fluff, just tools that work.',
  keywords: [
    'digital products for entrepreneurs',
    'AI website design',
    'solopreneur templates',
    'business automation tools',
    'SaaS templates',
    'AI business tools',
    'entrepreneur productivity',
    'custom website development',
    'AI-powered websites',
    'startup templates',
  ],
  authors: [{ name: 'Soft Systems Studio LLC' }],
  creator: 'Soft Systems Studio LLC',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://softsystemsstudiollc.com',
    siteName: 'Soft Systems Studio',
    title: 'Digital Products, AI Websites & Automation | Soft Systems Studio',
    description:
      'Ready-to-use templates ($19-29), AI-powered websites ($799+), and intelligent automation for entrepreneurs. Ship faster, launch smarter.',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Soft Systems Studio - Digital Products and AI Automation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Products, AI Websites & Automation | Soft Systems Studio',
    description:
      'Ready-to-use templates, AI-powered websites, and intelligent automation for entrepreneurs who refuse to waste time.',
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
