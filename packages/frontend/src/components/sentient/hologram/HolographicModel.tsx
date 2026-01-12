'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface Floor {
  id: string;
  level: number;
  title: string;
  description: string;
  color: string;
  icon: string;
  features: string[];
}

const FLOORS: Floor[] = [
  {
    id: 'voice-ai',
    level: 0,
    title: 'Voice AI',
    description: 'Conversational voice agents powered by Vapi.ai',
    color: '#22d3ee', // cyan
    icon: '🎙️',
    features: ['Natural conversations', 'Real-time responses', 'Multi-language support'],
  },
  {
    id: 'chat-automation',
    level: 1,
    title: 'Chat Automation',
    description: 'Intelligent chatbots with context-aware responses',
    color: '#a78bfa', // purple
    icon: '💬',
    features: ['24/7 availability', 'Context retention', 'Multi-channel support'],
  },
  {
    id: 'workflow-automation',
    level: 2,
    title: 'Workflow Automation',
    description: 'End-to-end business process automation',
    color: '#c0ff6b', // green
    icon: '⚡',
    features: ['Process optimization', 'Integration APIs', 'Custom workflows'],
  },
  {
    id: 'web-design',
    level: 3,
    title: 'Web Design',
    description: 'Modern, responsive web applications',
    color: '#fb923c', // orange
    icon: '🎨',
    features: ['Responsive design', 'Performance optimized', 'SEO ready'],
  },
  {
    id: 'custom-apps',
    level: 4,
    title: 'Custom Applications',
    description: 'Bespoke software solutions for your business',
    color: '#f472b6', // pink
    icon: '🚀',
    features: ['Tailored solutions', 'Scalable architecture', 'Full-stack development'],
  },
];

interface BuildingGeometryProps {
  onFloorHover: (floorId: string | null) => void;
}

function BuildingGeometry({ onFloorHover }: BuildingGeometryProps) {
  const groupRef = useRef<THREE.Group>(null);
  const floorRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(() => {
    if (!groupRef.current) return;

    // Rotate building slowly
    groupRef.current.rotation.y += 0.001;

    // Pulse effect on floors based on hover
    floorRefs.current.forEach((floor, index) => {
      if (floor && floor.material) {
        const material = floor.material as THREE.MeshStandardMaterial;
        const baseEmissive = 0.3;
        const pulseAmount = Math.sin(Date.now() * 0.002 + index) * 0.2;
        material.emissiveIntensity = baseEmissive + pulseAmount;
      }
    });
  });

  const handlePointerOver = (floorId: string) => {
    onFloorHover(floorId);
  };

  const handlePointerOut = () => {
    onFloorHover(null);
  };

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Central pillar */}
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 10, 8]} />
        <meshStandardMaterial
          color="#c0ff6b"
          emissive="#c0ff6b"
          emissiveIntensity={0.5}
          wireframe
        />
      </mesh>

      {/* Floor platforms */}
      {FLOORS.map((floor, index) => {
        const yPos = index * 2.5 - 5;
        const scale = 1 + index * 0.1;

        return (
          <group key={floor.id} position={[0, yPos, 0]}>
            {/* Floor platform */}
            <mesh
              ref={(el) => {
                // eslint-disable-next-line security/detect-object-injection
                floorRefs.current[index] = el;
              }}
              onPointerOver={() => handlePointerOver(floor.id)}
              onPointerOut={handlePointerOut}
            >
              <boxGeometry args={[scale * 3, 0.1, scale * 3]} />
              <meshStandardMaterial
                color={floor.color}
                emissive={floor.color}
                emissiveIntensity={0.3}
                wireframe
                transparent
                opacity={0.6}
              />
            </mesh>

            {/* Corner posts */}
            {[-1, 1].map((x) =>
              [-1, 1].map((z) => (
                <mesh key={`${x}-${z}`} position={[x * scale * 1.5, 0, z * scale * 1.5]}>
                  <cylinderGeometry args={[0.05, 0.05, 2.5, 6]} />
                  <meshStandardMaterial
                    color={floor.color}
                    emissive={floor.color}
                    emissiveIntensity={0.4}
                    wireframe
                  />
                </mesh>
              )),
            )}

            {/* Data streams (particles) */}
            <DataStream color={floor.color} position={[scale * 1.2, 0, 0]} />
            <DataStream color={floor.color} position={[-scale * 1.2, 0, 0]} />
          </group>
        );
      })}

      {/* Top antenna */}
      <mesh position={[0, 10.5, 0]}>
        <coneGeometry args={[0.2, 1, 8]} />
        <meshStandardMaterial
          color="#c0ff6b"
          emissive="#c0ff6b"
          emissiveIntensity={0.8}
          wireframe
        />
      </mesh>
    </group>
  );
}

interface DataStreamProps {
  color: string;
  position: [number, number, number];
}

function DataStream({ color, position }: DataStreamProps) {
  const particlesRef = useRef<THREE.Points>(null);

  useFrame(() => {
    if (!particlesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += 0.02; // Move up

      // Reset when reaching top
      if (positions[i + 1] > 1) {
        positions[i + 1] = -1;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const particleCount = 20;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 0.1;
    positions[i * 3 + 1] = Math.random() * 2 - 1;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
  }

  return (
    <points ref={particlesRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={color} transparent opacity={0.8} />
    </points>
  );
}

function CameraController({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();

  useFrame(() => {
    // Camera orbits around the building based on scroll
    const radius = 15;
    const angle = scrollProgress * Math.PI * 2;
    const height = -5 + scrollProgress * 15; // Move from bottom to top

    camera.position.x = Math.sin(angle) * radius;
    camera.position.z = Math.cos(angle) * radius;
    camera.position.y = height;

    camera.lookAt(0, scrollProgress * 10 - 5, 0);
  });

  return null;
}

interface InteractiveZoneProps {
  floor: Floor;
  position: [number, number, number];
  isActive: boolean;
}

function InteractiveZone({ floor, position, isActive }: InteractiveZoneProps) {
  if (!isActive) return null;

  return (
    <Html position={position} center distanceFactor={10}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-black/90 border-2 p-4 rounded-lg backdrop-blur-sm min-w-[300px]"
        style={{ borderColor: floor.color }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{floor.icon}</span>
          <h3 className="text-lg font-bold font-mono" style={{ color: floor.color }}>
            {floor.title}
          </h3>
        </div>
        <p className="text-gray-300 text-sm mb-3">{floor.description}</p>
        <ul className="space-y-1">
          {floor.features.map((feature, i) => (
            <li key={i} className="text-xs text-gray-400 flex items-center gap-2">
              <span style={{ color: floor.color }}>▸</span>
              {feature}
            </li>
          ))}
        </ul>
      </motion.div>
    </Html>
  );
}

export default function HolographicModel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredFloor, setHoveredFloor] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Calculate scroll progress (0 to 1)
      const elementTop = rect.top;
      const elementHeight = rect.height;

      // Progress from when element enters viewport to when it leaves
      const progress = Math.max(
        0,
        Math.min(1, (viewportHeight - elementTop) / (viewportHeight + elementHeight)),
      );

      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeFloor = FLOORS.find((f) => f.id === hoveredFloor);

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black" id="hologram">
      {/* Section Header */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-primary-accent font-mono"
        >
          SYSTEM ARCHITECTURE
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 mt-2 font-mono text-sm"
        >
          Scroll to explore our technology stack
        </motion.p>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{
          position: [15, -5, 15],
          fov: 50,
        }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#000000']} />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#c0ff6b" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22d3ee" />

        {/* Building */}
        <BuildingGeometry onFloorHover={setHoveredFloor} />

        {/* Interactive Zones */}
        {activeFloor && (
          <InteractiveZone
            floor={activeFloor}
            position={[5, activeFloor.level * 2.5 - 5, 0]}
            isActive={true}
          />
        )}

        {/* Camera Controller */}
        <CameraController scrollProgress={scrollProgress} />

        {/* Optional: Manual controls for testing */}
        {/* <OrbitControls enableZoom={false} enablePan={false} /> */}
      </Canvas>

      {/* Floor Labels (2D overlay) */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 space-y-4">
        {FLOORS.map((floor, index) => {
          const isActive = scrollProgress > index * 0.18 && scrollProgress < (index + 1) * 0.22;

          return (
            <motion.div
              key={floor.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 transition-all ${
                isActive ? 'scale-110' : 'opacity-50'
              }`}
            >
              <span className="text-2xl">{floor.icon}</span>
              <div>
                <div
                  className="text-sm font-bold font-mono"
                  style={{ color: isActive ? floor.color : '#666' }}
                >
                  {floor.title}
                </div>
                <div className="text-xs text-gray-500">Level {floor.level + 1}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Scroll Progress Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="text-xs text-gray-500 font-mono">
          {Math.round(scrollProgress * 100)}% EXPLORED
        </div>
        <div className="w-32 h-1 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-accent"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
