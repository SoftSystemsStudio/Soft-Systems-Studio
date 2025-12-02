'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Preload } from '@react-three/drei';

interface SceneProps {
  children: React.ReactNode;
  className?: string;
  cameraPosition?: [number, number, number];
  enableOrbit?: boolean;
  enableZoom?: boolean;
}

function Loader() {
  return null; // Silent loader - canvas appears when ready
}

export default function Scene({
  children,
  className = '',
  cameraPosition = [0, 0, 6],
  enableOrbit = false,
  enableZoom = false,
}: SceneProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: cameraPosition, fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          {children}
          {enableOrbit && <OrbitControls enableZoom={enableZoom} enablePan={false} />}
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
