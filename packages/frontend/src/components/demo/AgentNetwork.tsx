import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';

const AgentNode = ({
  position,
  label,
  color = '#00ff88',
}: {
  position: readonly [number, number, number] | [number, number, number];
  label: string;
  color?: string;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={color} wireframe />
      </mesh>
      <Html distanceFactor={10}>
        <div className="text-xs font-mono text-white bg-black/80 px-2 py-1 rounded border border-white/20 whitespace-nowrap">
          {label}
        </div>
      </Html>
    </group>
  );
};

const Connection = ({
  start,
  end,
}: {
  start: readonly [number, number, number] | [number, number, number];
  end: readonly [number, number, number] | [number, number, number];
}) => {
  const points = useMemo(
    () => [new THREE.Vector3(...start), new THREE.Vector3(...end)],
    [start, end],
  );

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
    </line>
  );
};

const NeuralNetwork = () => {
  const agents = [
    { id: 'orchestrator', pos: [0, 0, 0], label: 'ORCHESTRATOR', color: '#ff0088' },
    { id: 'sales', pos: [-4, 2, -2], label: 'SALES AGENT', color: '#00ffff' },
    { id: 'support', pos: [4, 2, -2], label: 'SUPPORT AGENT', color: '#00ff88' },
    { id: 'analyst', pos: [0, -3, 2], label: 'DATA ANALYST', color: '#ffff00' },
    { id: 'voice', pos: [-3, -2, 3], label: 'VOICE INT.', color: '#aa00ff' },
  ] as const;

  return (
    <group>
      {agents.map((agent) => (
        <AgentNode key={agent.id} position={agent.pos} label={agent.label} color={agent.color} />
      ))}
      {/* Connect everything to Orchestrator */}
      {agents.slice(1).map((agent, i) => (
        <Connection key={i} start={agents[0].pos} end={agent.pos} />
      ))}
    </group>
  );
};

export default function AgentNetwork() {
  return (
    <div className="w-full h-full min-h-[600px] bg-black rounded-lg overflow-hidden border border-white/10 relative shadow-2xl shadow-indigo-500/20">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <color attach="background" args={['#050510']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <NeuralNetwork />
        <OrbitControls autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      <div className="absolute bottom-4 left-4 text-white/50 text-xs font-mono pointer-events-none">
        <div>SYSTEM STATUS: ONLINE</div>
        <div>NODES: 5 ACTIVE</div>
        <div>LATENCY: 12ms</div>
      </div>
    </div>
  );
}
