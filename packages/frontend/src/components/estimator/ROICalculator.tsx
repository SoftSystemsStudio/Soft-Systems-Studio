'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ROICalculator - Interactive split-screen ROI comparison
 *
 * Features:
 * - Slider to adjust human hours/wage
 * - 3D money pile visualization
 * - Real-time savings calculation
 * - Animated comparisons
 */

export interface ROICalculatorProps {
  /** Base setup cost for automation */
  setupCost?: number;
  /** Monthly cost for automation */
  monthlyCost?: number;
  /** Efficiency multiplier (how much faster automation is) */
  efficiencyMultiplier?: number;
}

// 3D Money Pile Component
function MoneyPile({ value, maxValue }: { value: number; maxValue: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const coinsRef = useRef<THREE.InstancedMesh>(null);

  const normalizedValue = Math.min(value / maxValue, 1);
  const coinCount = Math.floor(normalizedValue * 100) + 10;

  // Generate coin positions
  const coinData = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const rotations: THREE.Euler[] = [];

    for (let i = 0; i < 150; i++) {
      // Pile up coins in a rough pyramid
      const layer = Math.floor(i / 20);
      const radius = 2 - layer * 0.3;
      const angle = (i % 20) * ((Math.PI * 2) / 20) + layer * 0.3;

      positions.push(
        new THREE.Vector3(
          Math.cos(angle) * radius * Math.random(),
          layer * 0.15 + Math.random() * 0.1,
          Math.sin(angle) * radius * Math.random(),
        ),
      );

      rotations.push(
        new THREE.Euler(Math.random() * 0.3, Math.random() * Math.PI * 2, Math.random() * 0.3),
      );
    }

    return { positions, rotations };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Gentle floating animation
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  useEffect(() => {
    if (!coinsRef.current) return;

    const dummy = new THREE.Object3D();

    for (let i = 0; i < 150; i++) {
      const visible = i < coinCount;

      dummy.position.copy(coinData.positions[i]);
      dummy.rotation.copy(coinData.rotations[i]);
      dummy.scale.setScalar(visible ? 1 : 0);
      dummy.updateMatrix();

      coinsRef.current.setMatrixAt(i, dummy.matrix);
    }

    coinsRef.current.instanceMatrix.needsUpdate = true;
  }, [coinCount, coinData]);

  return (
    <group ref={groupRef}>
      {/* Coins */}
      <instancedMesh ref={coinsRef} args={[undefined, undefined, 150]}>
        <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
        <meshStandardMaterial color="#c0ff6b" metalness={0.8} roughness={0.2} />
      </instancedMesh>

      {/* Glow effect */}
      <pointLight
        position={[0, 2, 0]}
        color="#c0ff6b"
        intensity={normalizedValue * 2}
        distance={5}
      />
    </group>
  );
}

export default function ROICalculator({
  setupCost = 8000,
  monthlyCost = 200,
  efficiencyMultiplier = 10,
}: ROICalculatorProps) {
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [hourlyWage, setHourlyWage] = useState(25);
  const [yearsToProject, setYearsToProject] = useState(1);

  // Calculations
  const calculations = useMemo(() => {
    const weeksPerYear = 52;
    const hoursPerYear = hoursPerWeek * weeksPerYear * yearsToProject;

    // Human cost
    const humanCostPerYear = hoursPerWeek * hourlyWage * weeksPerYear;
    const totalHumanCost = humanCostPerYear * yearsToProject;

    // Automation cost
    const totalAutomationCost = setupCost + monthlyCost * 12 * yearsToProject;

    // Savings
    const savings = totalHumanCost - totalAutomationCost;
    const savingsPercentage = ((totalHumanCost - totalAutomationCost) / totalHumanCost) * 100;

    // Time saved (automation is X times faster)
    const timeSavedHours = hoursPerYear * (1 - 1 / efficiencyMultiplier);

    // Break-even point (months)
    const monthlyHumanCost = hoursPerWeek * hourlyWage * 4.33;
    const breakEvenMonths =
      monthlyHumanCost > monthlyCost ? setupCost / (monthlyHumanCost - monthlyCost) : Infinity;

    return {
      humanCostPerYear,
      totalHumanCost,
      totalAutomationCost,
      savings,
      savingsPercentage: Math.max(0, savingsPercentage),
      timeSavedHours,
      breakEvenMonths: Math.ceil(breakEvenMonths),
      hoursPerYear,
    };
  }, [hoursPerWeek, hourlyWage, yearsToProject, setupCost, monthlyCost, efficiencyMultiplier]);

  // Keep spring animation for future use (intentionally suppressed)
  useSpring(calculations.savings, { stiffness: 100, damping: 20 });

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white font-mono mb-4">ROI CALCULATOR</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          See how much you could save by automating your repetitive tasks. Adjust the sliders to
          match your current situation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Human Cost */}
        <div className="bg-gray-900/80 border border-red-500/30 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">👤</span>
            <h3 className="text-xl font-bold text-white font-mono">CURRENT HUMAN COST</h3>
          </div>

          {/* Hours per week slider */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-400 font-mono">
                Hours per week on repetitive tasks
              </label>
              <span className="text-brand-lime font-mono font-bold">{hoursPerWeek}h</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>

          {/* Hourly wage slider */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-400 font-mono">Hourly wage (fully loaded)</label>
              <span className="text-brand-lime font-mono font-bold">${hourlyWage}/hr</span>
            </div>
            <input
              type="range"
              min="15"
              max="100"
              value={hourlyWage}
              onChange={(e) => setHourlyWage(Number(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>

          {/* Time period */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-400 font-mono">Time period</label>
              <span className="text-brand-lime font-mono font-bold">
                {yearsToProject} year{yearsToProject > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 5].map((year) => (
                <button
                  key={year}
                  onClick={() => setYearsToProject(year)}
                  className={`flex-1 py-2 rounded-lg font-mono text-sm transition-colors ${
                    yearsToProject === year
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {year}Y
                </button>
              ))}
            </div>
          </div>

          {/* Human cost display */}
          <div className="border-t border-gray-800 pt-6">
            <div className="text-sm text-gray-400 font-mono mb-2">TOTAL HUMAN COST</div>
            <motion.div
              className="text-4xl font-bold text-red-400 font-mono"
              key={calculations.totalHumanCost}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
            >
              ${calculations.totalHumanCost.toLocaleString()}
            </motion.div>
            <div className="text-sm text-gray-500 mt-2">
              {calculations.hoursPerYear.toLocaleString()} hours over {yearsToProject} year
              {yearsToProject > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Right: Automation Cost */}
        <div className="bg-gray-900/80 border border-brand-lime/30 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🤖</span>
            <h3 className="text-xl font-bold text-white font-mono">SOFT SYSTEM COST</h3>
          </div>

          {/* Fixed costs display */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Setup (one-time)</span>
              <span className="text-brand-lime font-mono font-bold">
                ${setupCost.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Monthly maintenance</span>
              <span className="text-brand-lime font-mono font-bold">${monthlyCost}/mo</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">
                Total over {yearsToProject} year{yearsToProject > 1 ? 's' : ''}
              </span>
              <span className="text-cyan-400 font-mono font-bold">
                ${calculations.totalAutomationCost.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 3D Money visualization */}
          <div className="h-48 rounded-lg overflow-hidden bg-black/50 mb-6">
            <Canvas camera={{ position: [0, 3, 5], fov: 50 }}>
              <ambientLight intensity={0.3} />
              <directionalLight position={[5, 5, 5]} intensity={1} />
              <MoneyPile value={calculations.savings} maxValue={100000} />
            </Canvas>
          </div>

          {/* Automation cost display */}
          <div className="border-t border-gray-800 pt-6">
            <div className="text-sm text-gray-400 font-mono mb-2">TOTAL AUTOMATION COST</div>
            <motion.div
              className="text-4xl font-bold text-brand-lime font-mono"
              key={calculations.totalAutomationCost}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
            >
              ${calculations.totalAutomationCost.toLocaleString()}
            </motion.div>
            <div className="text-sm text-gray-500 mt-2">
              Break-even in {calculations.breakEvenMonths} months
            </div>
          </div>
        </div>
      </div>

      {/* Savings Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 bg-gradient-to-r from-brand-lime/10 to-cyan-400/10 border border-brand-lime/30 rounded-2xl p-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Total Savings */}
          <div className="text-center">
            <div className="text-sm text-gray-400 font-mono mb-2">TOTAL SAVINGS</div>
            <motion.div
              className={`text-5xl font-bold font-mono ${
                calculations.savings > 0 ? 'text-brand-lime' : 'text-red-400'
              }`}
            >
              {calculations.savings > 0 ? '+' : '-'}$
              {Math.abs(calculations.savings).toLocaleString()}
            </motion.div>
            <div className="text-sm text-gray-500 mt-2">
              over {yearsToProject} year{yearsToProject > 1 ? 's' : ''}
            </div>
          </div>

          {/* Percentage Saved */}
          <div className="text-center">
            <div className="text-sm text-gray-400 font-mono mb-2">COST REDUCTION</div>
            <div className="text-5xl font-bold text-cyan-400 font-mono">
              {calculations.savingsPercentage.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-500 mt-2">less than human labor</div>
          </div>

          {/* Time Saved */}
          <div className="text-center">
            <div className="text-sm text-gray-400 font-mono mb-2">TIME SAVED</div>
            <div className="text-5xl font-bold text-purple-400 font-mono">
              {Math.round(calculations.timeSavedHours).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mt-2">hours you get back</div>
          </div>
        </div>

        {/* CTA */}
        {calculations.savings > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-8"
          >
            <button
              onClick={() => (window.location.href = '/intake')}
              className="px-8 py-4 bg-brand-lime text-black font-bold font-mono rounded-lg hover:bg-brand-lime/90 transition-colors text-lg"
            >
              START SAVING ${Math.round(calculations.savings / yearsToProject).toLocaleString()}
              /YEAR →
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
