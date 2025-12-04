/**
 * Google Analytics 4 (GA4) Integration
 *
 * This module provides utilities for tracking page views and custom events
 * using Google Analytics 4.
 *
 * @see https://developers.google.com/analytics/devguides/collection/ga4
 */

// Your GA4 Measurement ID (starts with G-)
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Check if GA is configured
export const isGAEnabled = (): boolean => {
  return typeof window !== 'undefined' && !!GA_MEASUREMENT_ID;
};

// Declare gtag on window for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>,
    ) => void;
    dataLayer: unknown[];
  }
}

/**
 * Track a page view
 * Called automatically on route changes
 */
export const pageview = (url: string): void => {
  if (!isGAEnabled()) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

/**
 * Track a custom event
 *
 * @example
 * // Track a button click
 * event({ action: 'click', category: 'engagement', label: 'hero_cta', value: 1 })
 *
 * // Track a form submission
 * event({ action: 'submit', category: 'lead', label: 'contact_form' })
 */
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}): void => {
  if (!isGAEnabled()) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

/**
 * Track a conversion event (for goals/conversions)
 */
export const conversion = (conversionId: string, value?: number): void => {
  if (!isGAEnabled()) return;

  window.gtag('event', 'conversion', {
    send_to: conversionId,
    value: value,
  });
};

/**
 * Set user properties for better segmentation
 */
export const setUserProperties = (properties: Record<string, string | number | boolean>): void => {
  if (!isGAEnabled()) return;

  window.gtag('set', 'user_properties', properties);
};
