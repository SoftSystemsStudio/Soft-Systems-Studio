/**
 * Analytics utilities for Sentient Terminal
 * Provides type-safe event tracking for Google Analytics
 */

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

export type TerminalEvent =
  | 'terminal_loaded'
  | 'terminal_interaction'
  | 'hologram_loaded'
  | 'hologram_interaction'
  | 'pulse_loaded'
  | 'pulse_connection'
  | 'architect_loaded'
  | 'module_added'
  | 'module_removed'
  | 'blueprint_export'
  | 'section_view';

interface BaseEventParams {
  section?: string;
  device?: 'mobile' | 'desktop' | 'tablet';
  timestamp?: number;
}

interface TerminalLoadedParams extends BaseEventParams {
  particle_count?: number;
  webgl_version?: number;
  device_tier?: string;
}

interface TerminalInteractionParams extends BaseEventParams {
  input_length?: number;
  duration_seconds?: number;
}

interface HologramInteractionParams extends BaseEventParams {
  floor?: string;
  scroll_progress?: number;
}

interface PulseConnectionParams extends BaseEventParams {
  status?: 'connected' | 'disconnected';
  metrics_count?: number;
}

interface ModuleEventParams extends BaseEventParams {
  module_type?: string;
  module_count?: number;
}

interface BlueprintExportParams extends BaseEventParams {
  module_count: number;
  total_price: number;
  discount_percentage: number;
}

type EventParams =
  | TerminalLoadedParams
  | TerminalInteractionParams
  | HologramInteractionParams
  | PulseConnectionParams
  | ModuleEventParams
  | BlueprintExportParams;

/**
 * Track a custom event in Google Analytics
 * Only tracks if gtag is available (production)
 */
export function trackEvent(event: TerminalEvent, params?: EventParams): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, {
      ...params,
      timestamp: Date.now(),
    });
  }

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event, params);
  }
}

/**
 * Track page view for Sentient Terminal sections
 */
export function trackSectionView(section: string): void {
  trackEvent('section_view', {
    section,
    device: getDeviceType(),
  });
}

/**
 * Helper to detect device type
 */
function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;

  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Track performance metrics
 */
export function trackPerformance(metric: {
  name: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
}): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      rating: metric.rating,
      timestamp: Date.now(),
    });
  }
}

/**
 * Track errors
 */
export function trackError(error: {
  message: string;
  section?: string;
  stack?: string;
}): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'error', {
      error_message: error.message,
      error_section: error.section,
      error_stack: error.stack?.slice(0, 500), // Limit stack trace length
      timestamp: Date.now(),
    });
  }
}

/**
 * Initialize analytics for Sentient Terminal
 */
export function initializeAnalytics(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Initialized in development mode (logging only)');
  }

  // Track initial page load
  trackEvent('terminal_loaded', {
    device: getDeviceType(),
  });
}
