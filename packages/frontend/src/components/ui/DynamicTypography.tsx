'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * DynamicTypography - Variable font that responds to scroll/mouse
 *
 * Uses canvas to render text with dynamic font variations
 * Weight and width change based on user interaction
 */

interface DynamicTypographyProps {
  /** Text to display */
  text: string;
  /** Base font size in pixels */
  fontSize?: number;
  /** Font family (must support variable weights) */
  fontFamily?: string;
  /** Minimum font weight */
  minWeight?: number;
  /** Maximum font weight */
  maxWeight?: number;
  /** Text color */
  color?: string;
  /** Tracking (letter spacing) in em */
  letterSpacing?: number;
  /** Whether to react to scroll position */
  reactToScroll?: boolean;
  /** Whether to react to mouse proximity */
  reactToMouse?: boolean;
  /** Additional className */
  className?: string;
  /** Optional click handler */
  onClick?: () => void;
}

export default function DynamicTypography({
  text,
  fontSize = 64,
  fontFamily = 'Space Grotesk',
  minWeight = 300,
  maxWeight = 700,
  color = '#ffffff',
  letterSpacing = -0.02,
  reactToScroll = true,
  reactToMouse = true,
  className = '',
  onClick,
}: DynamicTypographyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [weight, setWeight] = useState(minWeight);
  const [width, setWidth] = useState(100); // For variable width fonts
  const animationRef = useRef<number>(0);
  const mousePos = useRef({ x: 0, y: 0 });
  const scrollPos = useRef(0);

  // Calculate weight based on inputs
  const calculateWeight = useCallback(() => {
    let targetWeight = minWeight;
    let targetWidth = 100;

    if (reactToScroll && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const elementCenter = rect.top + rect.height / 2;
      const distanceFromCenter = Math.abs(viewportHeight / 2 - elementCenter);
      const maxDistance = viewportHeight / 2;
      const scrollInfluence = 1 - Math.min(distanceFromCenter / maxDistance, 1);

      targetWeight += (maxWeight - minWeight) * scrollInfluence * 0.5;
    }

    if (reactToMouse && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = mousePos.current.x - centerX;
      const dy = mousePos.current.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 300;

      const mouseInfluence = 1 - Math.min(distance / maxDist, 1);
      targetWeight += (maxWeight - minWeight) * mouseInfluence * 0.5;
      targetWidth = 100 - mouseInfluence * 10; // Slightly condense on hover
    }

    return { weight: Math.round(targetWeight), width: targetWidth };
  }, [minWeight, maxWeight, reactToScroll, reactToMouse]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const { weight: targetWeight, width: targetWidth } = calculateWeight();

      setWeight((prev) => prev + (targetWeight - prev) * 0.1);
      setWidth((prev) => prev + (targetWidth - prev) * 0.1);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [calculateWeight]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleScroll = () => {
      scrollPos.current = window.scrollY;
    };

    if (reactToMouse) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    if (reactToScroll) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [reactToMouse, reactToScroll]);

  // Character-level animation for extra effect
  const characters = text.split('');

  return (
    <div
      ref={containerRef}
      className={`inline-block ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <span
        style={{
          fontFamily: `"${fontFamily}", sans-serif`,
          fontSize: `${fontSize}px`,
          fontWeight: Math.round(weight),
          fontStretch: `${Math.round(width)}%`,
          color,
          letterSpacing: `${letterSpacing}em`,
          display: 'inline-flex',
          transition: 'font-weight 0.1s ease-out',
        }}
      >
        {characters.map((char, i) => (
          <CharacterSpan
            key={i}
            char={char}
            index={i}
            total={characters.length}
            baseWeight={weight}
            maxWeight={maxWeight}
            reactToMouse={reactToMouse}
          />
        ))}
      </span>
    </div>
  );
}

interface CharacterSpanProps {
  char: string;
  index: number;
  total: number;
  baseWeight: number;
  maxWeight: number;
  reactToMouse: boolean;
}

function CharacterSpan({
  char,
  index,
  total,
  baseWeight,
  maxWeight,
  reactToMouse,
}: CharacterSpanProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [localWeight, setLocalWeight] = useState(baseWeight);

  useEffect(() => {
    if (!reactToMouse) {
      setLocalWeight(baseWeight);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const maxDist = 80;
      const influence = 1 - Math.min(distance / maxDist, 1);
      const targetWeight = baseWeight + (maxWeight - baseWeight) * influence;

      setLocalWeight(targetWeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [baseWeight, maxWeight, reactToMouse]);

  // Add staggered animation delay
  const delay = index * 0.02;

  return (
    <span
      ref={ref}
      style={{
        fontWeight: Math.round(localWeight),
        transition: `font-weight 0.15s ease-out ${delay}s`,
        display: char === ' ' ? 'inline' : 'inline-block',
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  );
}

/**
 * Hook for dynamic typography effects
 * Can be used with any text element
 */
export function useDynamicTypography(
  options: {
    minWeight?: number;
    maxWeight?: number;
    reactToScroll?: boolean;
    reactToMouse?: boolean;
  } = {},
) {
  const { minWeight = 300, maxWeight = 700, reactToScroll = true, reactToMouse = true } = options;

  const [weight, setWeight] = useState(minWeight);
  const ref = useRef<HTMLElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let animationId: number;

    const animate = () => {
      let targetWeight = minWeight;

      if (ref.current) {
        if (reactToScroll) {
          const rect = ref.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const elementCenter = rect.top + rect.height / 2;
          const distanceFromCenter = Math.abs(viewportHeight / 2 - elementCenter);
          const maxDistance = viewportHeight / 2;
          const scrollInfluence = 1 - Math.min(distanceFromCenter / maxDistance, 1);
          targetWeight += (maxWeight - minWeight) * scrollInfluence * 0.5;
        }

        if (reactToMouse) {
          const rect = ref.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const dx = mousePos.current.x - centerX;
          const dy = mousePos.current.y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const mouseInfluence = 1 - Math.min(distance / 300, 1);
          targetWeight += (maxWeight - minWeight) * mouseInfluence * 0.5;
        }
      }

      setWeight((prev) => prev + (targetWeight - prev) * 0.1);
      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    animate();
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [minWeight, maxWeight, reactToScroll, reactToMouse]);

  return {
    ref,
    style: {
      fontWeight: Math.round(weight),
      transition: 'font-weight 0.1s ease-out',
    },
  };
}
