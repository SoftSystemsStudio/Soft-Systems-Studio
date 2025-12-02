'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NeuralSphereProps {
  color?: string;
  secondaryColor?: string;
  particleCount?: number;
  radius?: number;
}

export default function NeuralSphere({
  color = '#c0ff6b',
  secondaryColor = '#22d3ee',
  particleCount = 800,
  radius = 2.5,
}: NeuralSphereProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Generate sphere points and geometry
  const { pointsGeometry, lineGeometry } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const primaryColor = new THREE.Color(color);
    const altColor = new THREE.Color(secondaryColor);

    for (let i = 0; i < particleCount; i++) {
      // Fibonacci sphere distribution for even spacing
      const phi = Math.acos(1 - (2 * (i + 0.5)) / particleCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      // Add some noise for organic feel
      const noise = 0.1;
      positions[i * 3] = x + (Math.random() - 0.5) * noise;
      positions[i * 3 + 1] = y + (Math.random() - 0.5) * noise;
      positions[i * 3 + 2] = z + (Math.random() - 0.5) * noise;

      // Gradient colors based on position
      const t = (y / radius + 1) / 2;
      const mixedColor = primaryColor.clone().lerp(altColor, t);
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    // Generate connection lines
    const lines: number[] = [];
    const connectionDistance = radius * 0.4;

    for (let i = 0; i < particleCount; i++) {
      const x1 = positions[i * 3];
      const y1 = positions[i * 3 + 1];
      const z1 = positions[i * 3 + 2];

      for (let j = i + 1; j < particleCount; j++) {
        const x2 = positions[j * 3];
        const y2 = positions[j * 3 + 1];
        const z2 = positions[j * 3 + 2];

        const distance = Math.sqrt(
          Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2),
        );

        if (distance < connectionDistance && Math.random() > 0.7) {
          lines.push(x1, y1, z1, x2, y2, z2);
        }
      }
    }

    const linePositions = new Float32Array(lines);

    // Create points geometry
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Create lines geometry
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    return { pointsGeometry: pGeo, lineGeometry: lGeo };
  }, [particleCount, radius, color, secondaryColor]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.1;
      pointsRef.current.rotation.x = Math.sin(time * 0.05) * 0.1;
    }

    if (linesRef.current) {
      linesRef.current.rotation.y = time * 0.1;
      linesRef.current.rotation.x = Math.sin(time * 0.05) * 0.1;
    }
  });

  return (
    <group>
      {/* Neural network connection lines */}
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial color={color} transparent opacity={0.15} />
      </lineSegments>

      {/* Data points */}
      <points ref={pointsRef} geometry={pointsGeometry}>
        <pointsMaterial size={0.04} vertexColors transparent opacity={0.9} sizeAttenuation />
      </points>
    </group>
  );
}
