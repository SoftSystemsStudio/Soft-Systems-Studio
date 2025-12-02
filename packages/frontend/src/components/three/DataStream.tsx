'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DataStreamProps {
  color?: string;
  secondaryColor?: string;
  particleCount?: number;
}

export default function DataStream({
  color = '#c0ff6b',
  secondaryColor = '#22d3ee',
  particleCount = 2000,
}: DataStreamProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    const primaryColor = new THREE.Color(color);
    const altColor = new THREE.Color(secondaryColor);

    for (let i = 0; i < particleCount; i++) {
      // Spiral stream distribution
      const t = i / particleCount;
      const angle = t * Math.PI * 8;
      const radius = 0.5 + t * 2;

      positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = (t - 0.5) * 6 + (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.5;

      // Velocities for animation
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = Math.random() * 0.05 + 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      // Color gradient
      const mixedColor = primaryColor.clone().lerp(altColor, Math.random());
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    velocitiesRef.current = velocities;

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return geo;
  }, [particleCount, color, secondaryColor]);

  useFrame(() => {
    if (!pointsRef.current || !velocitiesRef.current) return;

    const positionAttribute = pointsRef.current.geometry.attributes.position;
    const posArray = positionAttribute.array as Float32Array;
    const velocities = velocitiesRef.current;

    for (let i = 0; i < particleCount; i++) {
      // Move particles upward
      posArray[i * 3 + 1] += velocities[i * 3 + 1];

      // Reset particles that go too high
      if (posArray[i * 3 + 1] > 4) {
        posArray[i * 3 + 1] = -4;
      }

      // Subtle horizontal drift
      posArray[i * 3] += velocities[i * 3];
      posArray[i * 3 + 2] += velocities[i * 3 + 2];
    }

    positionAttribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial size={0.025} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}
