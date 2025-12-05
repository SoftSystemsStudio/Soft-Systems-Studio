/**
 * Google Analytics 4 Script Component
 *
 * Loads the GA4 tracking script and initializes tracking.
 * Include this component in _app.tsx or _document.tsx.
 */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import Script from 'next/script';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { GA_MEASUREMENT_ID, pageview, isGAEnabled } from '@/lib/gtag';

/**
 * Sanitize GA Measurement ID to prevent XSS injection.
 * Only allows valid GA4 measurement IDs (G-XXXXXXXXXX format).
 */
function sanitizeGaMeasurementId(id: unknown): string | null {
  if (!id || typeof id !== 'string') return null;
  // GA4 measurement IDs follow the pattern G-XXXXXXXXXX (alphanumeric after G-)
  const sanitized = id.trim();
  if (/^G-[A-Z0-9]{10,12}$/i.test(sanitized)) {
    return sanitized;
  }
  console.warn('Invalid GA Measurement ID format');
  return null;
}

/**
 * Google Analytics component that handles script loading and page view tracking
 */
export function GoogleAnalytics() {
  const router = useRouter();

  useEffect(() => {
    if (!isGAEnabled() || !router.events) return;

    // Track page views on route changes
    const handleRouteChange = (url: string) => {
      pageview(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Sanitize the measurement ID to prevent XSS
  const safeGaId = sanitizeGaMeasurementId(GA_MEASUREMENT_ID);

  // Don't render anything if GA is not configured or invalid
  if (!safeGaId) {
    return null;
  }

  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${safeGaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${safeGaId}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />
    </>
  );
}

export default GoogleAnalytics;
