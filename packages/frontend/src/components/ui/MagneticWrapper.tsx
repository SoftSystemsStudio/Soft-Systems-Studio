'use client';

import React, { useRef, useState, useCallback } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

interface MagneticWrapperProps {
  children: React.ReactNode;
  /** Strength of the magnetic pull (0-1, default 0.3) */
  strength?: number;
  /** Maximum distance in pixels for magnetic effect to activate */
  radius?: number;
  /** Spring stiffness for the magnetic animation */
  stiffness?: number;
  /** Spring damping for the magnetic animation */
  damping?: number;
  /** Whether to scale slightly on hover */
  scaleOnHover?: boolean;
  /** Additional className for the wrapper */
  className?: string;
  /** Disable magnetic effect */
  disabled?: boolean;
}

/**
 * MagneticWrapper - Creates a magnetic attraction effect for UI elements
 * Elements will physically pull toward the cursor when it gets close
 *
 * Usage:
 * <MagneticWrapper strength={0.4}>
 *   <Button>Click Me</Button>
 * </MagneticWrapper>
 */
export default function MagneticWrapper({
  children,
  strength = 0.3,
  radius = 150,
  stiffness = 150,
  damping = 15,
  scaleOnHover = true,
  className = '',
  disabled = false,
}: MagneticWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for smooth animation
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring physics for smooth, natural movement
  const springConfig = { stiffness, damping, mass: 1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Scale transform for hover effect
  const scale = useSpring(1, { stiffness: 300, damping: 20 });

  // Rotation based on movement (subtle tilt effect)
  const rotateX = useTransform(springY, [-30, 30], [5, -5]);
  const rotateY = useTransform(springX, [-30, 30], [-5, 5]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = event.clientX - centerX;
      const distanceY = event.clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance < radius) {
        // Calculate pull strength based on distance (stronger when closer)
        const pullStrength = (1 - distance / radius) * strength;

        x.set(distanceX * pullStrength);
        y.set(distanceY * pullStrength);
      }
    },
    [disabled, radius, strength, x, y],
  );

  const handleMouseEnter = useCallback(() => {
    if (disabled) return;
    setIsHovered(true);
    if (scaleOnHover) {
      scale.set(1.05);
    }
  }, [disabled, scaleOnHover, scale]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    // Reset position
    x.set(0);
    y.set(0);
    scale.set(1);
  }, [x, y, scale]);

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springX,
        y: springY,
        scale,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className={`will-change-transform ${className}`}
    >
      {/* Glow effect on hover */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 -z-10 blur-xl bg-gradient-to-r from-brand-lime to-cyan-400 rounded-full"
          style={{ scale: 1.2 }}
        />
      )}
      {children}
    </motion.div>
  );
}

/**
 * useMagnetic - Hook for adding magnetic effect to any element
 * For more control over the magnetic behavior
 */
export function useMagnetic(
  options: {
    strength?: number;
    radius?: number;
    stiffness?: number;
    damping?: number;
  } = {},
) {
  const { strength = 0.3, radius = 150, stiffness = 150, damping = 15 } = options;

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness, damping, mass: 1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const bind = useCallback(
    (element: HTMLElement | null) => {
      if (!element) return {};

      const handleMove = (event: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distanceX = event.clientX - centerX;
        const distanceY = event.clientY - centerY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        if (distance < radius) {
          const pullStrength = (1 - distance / radius) * strength;
          x.set(distanceX * pullStrength);
          y.set(distanceY * pullStrength);
        }
      };

      const handleLeave = () => {
        x.set(0);
        y.set(0);
      };

      element.addEventListener('mousemove', handleMove);
      element.addEventListener('mouseleave', handleLeave);

      return () => {
        element.removeEventListener('mousemove', handleMove);
        element.removeEventListener('mouseleave', handleLeave);
      };
    },
    [strength, radius, x, y],
  );

  return {
    x: springX,
    y: springY,
    bind,
  };
}
