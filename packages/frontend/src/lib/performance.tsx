'use client';

import dynamic from 'next/dynamic';
import { Suspense, lazy, ComponentType } from 'react';

/**
 * Performance Optimization Utilities for Lighthouse 100/100/100/100
 *
 * Features:
 * - Lazy loading for heavy 3D components
 * - Intersection observer for visibility-based loading
 * - Preloading strategies
 * - Memory management utilities
 */

// Loading fallback component
function LoadingFallback({ height = 400 }: { height?: number }) {
  return (
    <div className="flex items-center justify-center bg-black/50" style={{ height }}>
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-brand-lime animate-pulse"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Lazy load Three.js components (heavy WebGL)
 */
export const LazyFluidBackground = dynamic(() => import('@/components/three/FluidBackground'), {
  ssr: false,
  loading: () => <LoadingFallback height={800} />,
});

export const LazyNodeEditor = dynamic(() => import('@/components/sentient/builder/NodeEditor'), {
  ssr: false,
  loading: () => <LoadingFallback height={700} />,
});

export const LazyROICalculator = dynamic(() => import('@/components/estimator/ROICalculator'), {
  ssr: false,
  loading: () => <LoadingFallback height={600} />,
});

export const LazyAIConcierge = dynamic(
  () => import('@/components/sentient/concierge/AIConcierge'),
  {
    ssr: false,
    loading: () => <LoadingFallback height={500} />,
  },
);

export const LazyRealTimePulse = dynamic(
  () => import('@/components/sentient/pulse/RealTimePulse'),
  {
    ssr: false,
    loading: () => <LoadingFallback height={400} />,
  },
);

/**
 * Visibility-based loader using Intersection Observer
 */
interface VisibilityLoaderProps<T extends object> {
  component: ComponentType<T>;
  componentProps: T;
  rootMargin?: string;
  threshold?: number;
  fallback?: React.ReactNode;
  minHeight?: number;
}

export function VisibilityLoader<T extends object>({
  component: Component,
  componentProps,
  rootMargin = '200px',
  threshold = 0.1,
  fallback,
  minHeight = 400,
}: VisibilityLoaderProps<T>) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div ref={ref} style={{ minHeight: isVisible ? 'auto' : minHeight }}>
      {isVisible ? (
        <Suspense fallback={fallback || <LoadingFallback height={minHeight} />}>
          <Component {...componentProps} />
        </Suspense>
      ) : (
        fallback || <LoadingFallback height={minHeight} />
      )}
    </div>
  );
}

/**
 * Prefetch component on hover/focus
 */
export function usePrefetch(importFn: () => Promise<{ default: ComponentType<unknown> }>) {
  const prefetched = useRef(false);

  const prefetch = useCallback(() => {
    if (!prefetched.current) {
      prefetched.current = true;
      importFn().catch(() => {
        // Silent fail for prefetch
        prefetched.current = false;
      });
    }
  }, [importFn]);

  return {
    onMouseEnter: prefetch,
    onFocus: prefetch,
  };
}

/**
 * Image optimization wrapper
 */
interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
}: OptimizedImageProps) {
  // Use Next.js Image component for automatic optimization
  const Image = require('next/image').default;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      className={className}
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    />
  );
}

/**
 * Critical CSS extraction helper
 * Call this in _document.tsx to inline critical CSS
 */
export function getCriticalCSS(): string {
  return `
    /* Critical above-the-fold CSS */
    :root {
      --brand-lime: #c0ff6b;
      --brand-bg: #02040a;
      --brand-surface: #050816;
    }
    
    body {
      background-color: var(--brand-bg);
      color: white;
      font-family: 'Space Grotesk', system-ui, sans-serif;
    }
    
    /* Prevent layout shift */
    .hero-section {
      min-height: 100vh;
    }
    
    /* Critical loading states */
    .loading-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;
}

/**
 * Memory cleanup utility for Three.js
 */
export function cleanupThreeJS(scene: THREE.Scene): void {
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();

      if (object.material instanceof THREE.Material) {
        cleanupMaterial(object.material);
      } else if (Array.isArray(object.material)) {
        object.material.forEach(cleanupMaterial);
      }
    }
  });

  scene.clear();
}

function cleanupMaterial(material: THREE.Material): void {
  material.dispose();

  // Cleanup textures
  const materialWithTextures = material as unknown as Record<string, unknown>;
  for (const key in materialWithTextures) {
    const value = materialWithTextures[key];
    if (value instanceof THREE.Texture) {
      value.dispose();
    }
  }
}

// Import necessary hooks
import { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

/**
 * Resource hints for preloading
 */
export function getResourceHints(): React.ReactNode {
  return (
    <>
      {/* Preconnect to CDNs */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

      {/* DNS prefetch for API */}
      <link rel="dns-prefetch" href="https://api.softsystems.studio" />

      {/* Preload critical fonts */}
      <link
        rel="preload"
        href="/fonts/SpaceGrotesk-Variable.woff2"
        as="font"
        type="font/woff2"
        crossOrigin=""
      />
    </>
  );
}

/**
 * Service Worker registration for caching
 */
export async function registerServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
  } catch (error) {
    console.error('Service worker registration failed:', error);
  }
}

/**
 * Detect slow network and reduce quality
 */
export function useNetworkQuality(): 'fast' | 'medium' | 'slow' {
  const [quality, setQuality] = useState<'fast' | 'medium' | 'slow'>('fast');

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { effectiveType: string } })
      .connection;

    if (connection) {
      const effectiveType = connection.effectiveType;

      if (effectiveType === '4g') {
        setQuality('fast');
      } else if (effectiveType === '3g') {
        setQuality('medium');
      } else {
        setQuality('slow');
      }
    }
  }, []);

  return quality;
}
