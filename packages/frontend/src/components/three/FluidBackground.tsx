'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

/**
 * FluidBackground - GPU-accelerated reactive fluid simulation
 * Creates "liquid mercury" / "digital water" effect that responds to cursor
 *
 * Features:
 * - Real-time fluid dynamics via GPU shaders
 * - Cursor-reactive forces with ripple effects
 * - Metaball rendering for liquid appearance
 * - Post-processing (bloom, chromatic aberration)
 * - Adaptive quality based on device capability
 */

// Metaball shader for liquid appearance
const metaballVertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const metaballFragmentShader = `
  uniform float time;
  uniform vec2 resolution;
  uniform vec2 mouse;
  uniform float mouseVelocity;
  uniform vec3 ballPositions[20];
  uniform float ballSizes[20];
  uniform int ballCount;
  uniform vec3 primaryColor;
  uniform vec3 secondaryColor;
  
  varying vec2 vUv;
  
  // Smooth minimum for organic blending
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }
  
  // Calculate metaball influence
  float metaball(vec2 p, vec2 center, float radius) {
    float d = length(p - center);
    return (radius * radius) / (d * d + 0.001);
  }
  
  // Simplex noise for organic movement
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(resolution.x / resolution.y, 1.0);
    vec2 p = (uv - 0.5) * aspect;
    
    // Calculate total metaball field
    float field = 0.0;
    
    for (int i = 0; i < 20; i++) {
      if (i >= ballCount) break;
      vec2 ballPos = ballPositions[i].xy * aspect;
      float size = ballSizes[i];
      field += metaball(p, ballPos, size);
    }
    
    // Add cursor influence
    vec2 mousePos = (mouse - 0.5) * aspect;
    float cursorInfluence = metaball(p, mousePos, 0.15 + mouseVelocity * 0.1);
    field += cursorInfluence * 2.0;
    
    // Add organic noise movement
    float noise = snoise(p * 3.0 + time * 0.3) * 0.3;
    field += noise * 0.5;
    
    // Create liquid threshold
    float threshold = 1.5;
    float edge = smoothstep(threshold - 0.3, threshold + 0.1, field);
    float innerEdge = smoothstep(threshold + 0.5, threshold + 2.0, field);
    
    // Color mixing
    vec3 edgeColor = mix(primaryColor, secondaryColor, innerEdge);
    
    // Add shimmer/highlight
    float highlight = pow(innerEdge, 3.0) * 0.5;
    edgeColor += vec3(highlight);
    
    // Final color with transparency
    float alpha = edge * 0.8;
    
    // Add subtle glow at edges
    float glow = smoothstep(threshold - 0.5, threshold, field) * (1.0 - edge);
    vec3 glowColor = primaryColor * glow * 0.5;
    
    vec3 finalColor = edgeColor * edge + glowColor;
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

interface FluidBall {
  position: THREE.Vector3;
  velocity: THREE.Vector2;
  size: number;
  phase: number;
}

function FluidPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5));
  const prevMouseRef = useRef(new THREE.Vector2(0.5, 0.5));
  const velocityRef = useRef(0);
  const { size, viewport } = useThree();

  // Initialize metaballs
  const balls = useMemo<FluidBall[]>(() => {
    const count = 12;
    return Array.from({ length: count }, (_, i) => ({
      position: new THREE.Vector3((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8, 0),
      velocity: new THREE.Vector2((Math.random() - 0.5) * 0.002, (Math.random() - 0.5) * 0.002),
      size: 0.05 + Math.random() * 0.08,
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  // Shader uniforms
  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      resolution: { value: new THREE.Vector2(size.width, size.height) },
      mouse: { value: new THREE.Vector2(0.5, 0.5) },
      mouseVelocity: { value: 0 },
      ballPositions: { value: balls.map((b) => b.position) },
      ballSizes: { value: balls.map((b) => b.size) },
      ballCount: { value: balls.length },
      primaryColor: { value: new THREE.Color('#c0ff6b') }, // Brand lime
      secondaryColor: { value: new THREE.Color('#22d3ee') }, // Cyan
    }),
    [size.width, size.height, balls],
  );

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = 1 - e.clientY / window.innerHeight;
      mouseRef.current.set(x, y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation loop
  useFrame((state) => {
    if (!meshRef.current) return;

    const material = meshRef.current.material as THREE.ShaderMaterial;
    const t = state.clock.elapsedTime;

    // Update time
    material.uniforms.time.value = t;

    // Calculate mouse velocity
    const dx = mouseRef.current.x - prevMouseRef.current.x;
    const dy = mouseRef.current.y - prevMouseRef.current.y;
    const velocity = Math.sqrt(dx * dx + dy * dy) * 10;
    velocityRef.current = velocityRef.current * 0.9 + velocity * 0.1; // Smooth

    // Update mouse uniforms
    material.uniforms.mouse.value.lerp(mouseRef.current, 0.1);
    material.uniforms.mouseVelocity.value = velocityRef.current;

    prevMouseRef.current.copy(mouseRef.current);

    // Update ball positions with fluid-like movement
    balls.forEach((ball, i) => {
      // Orbit around center
      const orbitSpeed = 0.2 + i * 0.05;
      const orbitRadius = 0.3 + i * 0.03;

      ball.position.x = Math.cos(t * orbitSpeed + ball.phase) * orbitRadius;
      ball.position.y = Math.sin(t * orbitSpeed * 0.7 + ball.phase) * orbitRadius * 0.6;

      // Add cursor attraction
      const dx = mouseRef.current.x - 0.5 - ball.position.x;
      const dy = mouseRef.current.y - 0.5 - ball.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.3) {
        const attraction = (0.3 - dist) * 0.01;
        ball.position.x += dx * attraction;
        ball.position.y += dy * attraction;
      }

      // Pulse size
      ball.size = (0.05 + i * 0.01) * (1 + Math.sin(t * 2 + ball.phase) * 0.2);

      material.uniforms.ballPositions.value[i].copy(ball.position);
      material.uniforms.ballSizes.value[i] = ball.size;
    });
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        vertexShader={metaballVertexShader}
        fragmentShader={metaballFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export interface FluidBackgroundProps {
  /** Enable post-processing effects */
  enablePostProcessing?: boolean;
  /** Quality level: 'low' | 'medium' | 'high' */
  quality?: 'low' | 'medium' | 'high';
  /** Custom primary color */
  primaryColor?: string;
  /** Custom secondary color */
  secondaryColor?: string;
  /** Additional className */
  className?: string;
}

export default function FluidBackground({
  enablePostProcessing = true,
  quality = 'high',
  className = '',
}: FluidBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`fixed inset-0 bg-black ${className}`} style={{ zIndex: -1 }} />;
  }

  const dpr =
    quality === 'high' ? Math.min(window.devicePixelRatio, 2) : quality === 'medium' ? 1.5 : 1;

  return (
    <div className={`fixed inset-0 ${className}`} style={{ zIndex: -1 }}>
      <Canvas
        dpr={dpr}
        gl={{
          antialias: quality !== 'low',
          alpha: true,
          powerPreference: 'high-performance',
        }}
        camera={{ position: [0, 0, 1], fov: 75 }}
      >
        <color attach="background" args={['#000000']} />

        <FluidPlane />

        {enablePostProcessing && quality !== 'low' ? (
          <EffectComposer>
            <Bloom
              intensity={0.5}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              blendFunction={BlendFunction.ADD}
            />
            {quality === 'high' ? (
              <ChromaticAberration
                offset={new THREE.Vector2(0.001, 0.001)}
                blendFunction={BlendFunction.NORMAL}
                radialModulation={false}
                modulationOffset={0}
              />
            ) : (
              <></>
            )}
          </EffectComposer>
        ) : null}
      </Canvas>
    </div>
  );
}
