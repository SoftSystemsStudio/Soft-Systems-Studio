/**
 * WebGL Capability Detector
 * Detects device capabilities for optimal performance tier selection
 */

export interface DeviceCapabilities {
  tier: 'desktop' | 'mobile' | 'legacy';
  particleCount: number;
  useFallback: boolean;
  hasWebGL2: boolean;
  isMobile: boolean;
  supportsWebGL: boolean;
}

/**
 * Detect device capabilities for performance optimization
 * Returns appropriate settings for particle counts and rendering quality
 */
export const detectCapabilities = (): DeviceCapabilities => {
  // Mobile detection
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent,
  );

  // WebGL support detection
  const canvas = document.createElement('canvas');
  const supportsWebGL = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  const hasWebGL2 = !!canvas.getContext('webgl2');

  // Determine performance tier
  let tier: 'desktop' | 'mobile' | 'legacy';
  let particleCount: number;
  let useFallback: boolean;

  if (!supportsWebGL) {
    // No WebGL support - use CSS fallback
    tier = 'legacy';
    particleCount = 0;
    useFallback = true;
  } else if (isMobile) {
    // Mobile device - reduce particle count significantly
    tier = 'mobile';
    particleCount = 2000;
    useFallback = !hasWebGL2; // Use fallback if no WebGL2 on mobile
  } else {
    // Desktop with WebGL support
    tier = 'desktop';
    particleCount = 30000;
    useFallback = false;
  }

  return {
    tier,
    particleCount,
    useFallback,
    hasWebGL2,
    isMobile,
    supportsWebGL,
  };
};

export interface QualitySettings {
  dpr: number;
  shadows: boolean;
  antialias: boolean;
  particleSize: number;
  enablePostProcessing: boolean;
  targetFPS: number;
}

/**
 * Get recommended quality settings based on device capabilities
 */
export const getQualitySettings = (capabilities: DeviceCapabilities): QualitySettings => {
  const { tier } = capabilities;

  switch (tier) {
    case 'desktop':
      return {
        dpr: Math.min(window.devicePixelRatio, 2), // Cap at 2x for performance
        shadows: true,
        antialias: true,
        particleSize: 2,
        enablePostProcessing: true,
        targetFPS: 60,
      };

    case 'mobile':
      return {
        dpr: 1, // Force 1x on mobile
        shadows: false,
        antialias: false,
        particleSize: 3, // Larger particles = less needed
        enablePostProcessing: false,
        targetFPS: 30,
      };

    case 'legacy':
      return {
        dpr: 1,
        shadows: false,
        antialias: false,
        particleSize: 4,
        enablePostProcessing: false,
        targetFPS: 30,
      };

    default:
      return {
        dpr: 1,
        shadows: false,
        antialias: false,
        particleSize: 3,
        enablePostProcessing: false,
        targetFPS: 30,
      };
  }
};

/**
 * Dynamic quality adjustment based on FPS
 * Reduces particle count if performance drops below target
 */
export const adjustQualityForFPS = (
  currentFPS: number,
  currentParticleCount: number,
  targetFPS: number = 30,
): number => {
  if (currentFPS < targetFPS && currentParticleCount > 500) {
    // Reduce by 25% if under target FPS
    return Math.floor(currentParticleCount * 0.75);
  }

  return currentParticleCount;
};
