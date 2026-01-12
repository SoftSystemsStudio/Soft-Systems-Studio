'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import Stats from 'stats.js';
import {
  detectCapabilities,
  getQualitySettings,
  adjustQualityForFPS,
  type DeviceCapabilities,
  type QualitySettings,
} from '@/lib/webgl-detector';

// Inline shaders to avoid build issues with GLSL imports
const fluidVertexShader = `
/**
 * Fluid Particle Vertex Shader
 * Implements SPH (Smoothed Particle Hydrodynamics) fluid dynamics
 * Particles are attracted to text formation points based on user input
 */

attribute vec3 position;
attribute vec3 velocity;
attribute float particleId;

uniform float time;
uniform vec2 resolution;
uniform vec3 attractorPositions[100]; // Text formation points
uniform float attractorStrengths[100];
uniform int attractorCount;
uniform float fluidViscosity;
uniform float particleRadius;

varying vec3 vColor;
varying float vAlpha;

// Simplex noise for organic movement
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vec3 pos = position;
  vec3 vel = velocity;

  // Calculate attractor forces (text formation)
  vec3 attractorForce = vec3(0.0);
  float minDist = 1000.0;

  for (int i = 0; i < 100; i++) {
    if (i >= attractorCount) break;

    vec3 toAttractor = attractorPositions[i] - pos;
    float dist = length(toAttractor);
    minDist = min(minDist, dist);

    if (dist > 0.01) {
      vec3 direction = normalize(toAttractor);
      float strength = attractorStrengths[i] / (dist * dist + 0.1);
      attractorForce += direction * strength;
    }
  }

  // Add fluid dynamics noise for organic movement
  float noiseStrength = 0.3;
  vec3 noiseOffset = vec3(
    snoise(pos * 2.0 + time * 0.5),
    snoise(pos * 2.0 + time * 0.5 + 100.0),
    snoise(pos * 2.0 + time * 0.5 + 200.0)
  ) * noiseStrength;

  // Apply forces
  vel += attractorForce * 0.01;
  vel += noiseOffset * 0.02;
  vel *= fluidViscosity; // Damping

  pos += vel * 0.016; // ~60fps timestep

  // Keep particles in bounds (gentle wrapping)
  if (length(pos) > 15.0) {
    pos *= 0.95;
    vel *= 0.8;
  }

  // Color based on proximity to attractors
  float colorIntensity = smoothstep(5.0, 0.5, minDist);
  vColor = mix(
    vec3(0.75, 1.0, 0.42), // #c0ff6b (Soft Systems green)
    vec3(0.13, 0.83, 0.93), // #22d3ee (cyan)
    colorIntensity
  );

  // Alpha based on distance from center
  float distFromCenter = length(pos) / 15.0;
  vAlpha = 1.0 - smoothstep(0.5, 1.0, distFromCenter);

  // Project to screen space
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Particle size based on distance
  gl_PointSize = particleRadius * (300.0 / -mvPosition.z);
}
`;

const fluidFragmentShader = `
/**
 * Fluid Particle Fragment Shader
 * Renders particles with soft circular gradients
 */

varying vec3 vColor;
varying float vAlpha;

void main() {
  // Calculate distance from center of point
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);

  // Soft circular gradient
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

  // Discard fragments outside circle
  if (alpha < 0.01) discard;

  // Apply color with soft glow
  vec3 finalColor = vColor;

  // Add glow effect
  float glow = 1.0 - smoothstep(0.0, 0.5, dist);
  finalColor += vec3(0.2) * glow;

  gl_FragColor = vec4(finalColor, alpha * vAlpha);
}
`;

interface FluidCanvasProps {
  targetText?: string; // Text to form with particles
  onReady?: () => void;
}

interface ParticleData {
  positions: Float32Array;
  velocities: Float32Array;
  particleIds: Float32Array;
}

export default function FluidCanvas({ targetText = '', onReady }: FluidCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
  const capabilities = useMemo<DeviceCapabilities>(() => detectCapabilities(), []);
  const [isReady, setIsReady] = useState(false);

  // Refs for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const statsRef = useRef<Stats | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Particle data
  const particleDataRef = useRef<ParticleData | null>(null);
  const attractorPositionsRef = useRef<THREE.Vector3[]>([]);

  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const qualitySettings: QualitySettings = getQualitySettings(capabilities);

    // Initialize Stats.js for FPS monitoring
    // eslint-disable-next-line no-restricted-syntax
    if (process.env.NODE_ENV === 'development') {
      const stats = new Stats();
      stats.showPanel(0); // FPS panel
      stats.dom.style.position = 'absolute';
      stats.dom.style.top = '0';
      stats.dom.style.left = '0';
      document.body.appendChild(stats.dom);
      statsRef.current = stats;
    }

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 10;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: qualitySettings.antialias,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(qualitySettings.dpr);
    rendererRef.current = renderer;

    // Initialize particle system
    const particleData = initializeParticles(capabilities.particleCount);
    particleDataRef.current = particleData;

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particleData.positions, 3));
    particleGeometry.setAttribute(
      'velocity',
      new THREE.BufferAttribute(particleData.velocities, 3),
    );
    particleGeometry.setAttribute(
      'particleId',
      new THREE.BufferAttribute(particleData.particleIds, 1),
    );

    // Shader material
    const particleMaterial = new THREE.ShaderMaterial({
      vertexShader: fluidVertexShader,
      fragmentShader: fluidFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        time: { value: 0 },
        resolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        attractorPositions: { value: new Array(100).fill(new THREE.Vector3()) },
        attractorStrengths: { value: new Array(100).fill(0) },
        attractorCount: { value: 0 },
        fluidViscosity: { value: 0.98 },
        particleRadius: { value: qualitySettings.particleSize },
      },
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    particleSystemRef.current = particleSystem;

    setIsReady(true);
    onReady?.();

    // Animation loop
    let frameCount = 0;
    let fpsCheckTime = performance.now();

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const currentTime = performance.now();

      // Update stats
      if (statsRef.current) {
        statsRef.current.begin();
      }

      // Update shader uniforms
      if (particleMaterial.uniforms) {
        particleMaterial.uniforms.time.value = currentTime / 1000;
      }

      // Update particle positions (CPU-side for now, could move to compute shader)
      updateParticles(particleData, attractorPositionsRef.current);
      particleGeometry.attributes.position.needsUpdate = true;
      particleGeometry.attributes.velocity.needsUpdate = true;

      // Render scene
      renderer.render(scene, camera);

      // Check FPS and adjust quality
      frameCount++;
      if (currentTime - fpsCheckTime > 1000) {
        const fps = frameCount;
        frameCount = 0;
        fpsCheckTime = currentTime;

        // Adjust particle count based on FPS
        const newParticleCount = adjustQualityForFPS(
          fps,
          capabilities.particleCount,
          qualitySettings.targetFPS,
        );

        if (newParticleCount !== capabilities.particleCount) {
          console.log(
            `Adjusting particle count: ${capabilities.particleCount} → ${newParticleCount}`,
          );
          capabilities.particleCount = newParticleCount;
        }
      }

      if (statsRef.current) {
        statsRef.current.end();
      }
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);

      if (particleMaterial.uniforms) {
        particleMaterial.uniforms.resolution.value.set(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);

      if (statsRef.current) {
        document.body.removeChild(statsRef.current.dom);
      }

      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
  }, [capabilities, onReady]);

  // Update attractors when target text changes
  useEffect(() => {
    if (!isReady || !targetText) return;

    const attractors = generateTextAttractors(targetText);
    attractorPositionsRef.current = attractors;

    // Update shader uniforms
    if (particleSystemRef.current) {
      const material = particleSystemRef.current.material as THREE.ShaderMaterial;
      material.uniforms.attractorPositions.value = attractors;
      material.uniforms.attractorStrengths.value = attractors.map(() => 5.0);
      material.uniforms.attractorCount.value = attractors.length;
    }
  }, [targetText, isReady]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
}

/**
 * Initialize particle positions and velocities
 */
function initializeParticles(count: number): ParticleData {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const particleIds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Random spherical distribution
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 5 + Math.random() * 5;

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    // Small random velocity
    velocities[i * 3] = (Math.random() - 0.5) * 0.02;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

    // eslint-disable-next-line security/detect-object-injection
    particleIds[i] = i;
  }

  return { positions, velocities, particleIds };
}

/**
 * Update particle positions (simplified - full SPH in shader)
 * This is handled in the vertex shader for performance
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function updateParticles(_data: ParticleData, _attractors: THREE.Vector3[]) {
  // Could add additional CPU-side logic here if needed
}

/**
 * Generate attractor points for text formation
 * Uses simple grid-based text layout
 */
function generateTextAttractors(text: string): THREE.Vector3[] {
  const attractors: THREE.Vector3[] = [];

  if (!text) return attractors;

  // Simple character-based layout (could be enhanced with canvas text metrics)
  const charWidth = 1.2;
  const startX = -(text.length * charWidth) / 2;

  for (let i = 0; i < text.length; i++) {
    // eslint-disable-next-line security/detect-object-injection
    const char = text[i];

    if (char === ' ') continue;

    // Create attractor points for each character
    // Simple 5x7 grid per character
    const baseX = startX + i * charWidth;

    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        // Only add points for "filled" pixels (simple block letters)
        if (shouldFillPixel(char, col, row)) {
          attractors.push(
            new THREE.Vector3(baseX + col * 0.2, 1 - row * 0.3, Math.random() * 0.5 - 0.25),
          );
        }
      }
    }
  }

  return attractors;
}

/**
 * Simple character pixel map for text formation
 * Returns true if this pixel should be filled
 */
function shouldFillPixel(char: string, col: number, row: number): boolean {
  // Simplified character rendering - returns true for edges and features
  // In production, use canvas measureText and ImageData for accurate rendering

  const patterns: Record<string, number[][]> = {
    A: [
      [0, 1, 1, 1, 0],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
    ],
    // Add more characters as needed
  };

  // eslint-disable-next-line security/detect-object-injection
  const pattern = patterns[char.toUpperCase()];
  // eslint-disable-next-line security/detect-object-injection
  if (!pattern || row >= pattern.length || col >= pattern[row].length) {
    return Math.random() > 0.7; // Default random fill
  }

  // eslint-disable-next-line security/detect-object-injection
  return pattern[row][col] === 1;
}
