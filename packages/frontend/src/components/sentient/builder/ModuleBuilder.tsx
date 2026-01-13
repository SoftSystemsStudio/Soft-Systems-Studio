'use client';

import { useState, useRef } from 'react';
import { useSprings, animated, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';

interface Module {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  icon: string;
  color: string;
  category: 'voice' | 'chat' | 'ecommerce' | 'custom';
}

interface PlacedModule extends Module {
  x: number;
  y: number;
}

const AVAILABLE_MODULES: Module[] = [
  {
    id: 'voice-ai',
    name: 'Voice AI',
    description: 'AI-powered voice receptionist with natural conversations',
    basePrice: 5000,
    icon: '🎙️',
    color: '#22d3ee',
    category: 'voice',
  },
  {
    id: 'chat-support',
    name: 'Chat Support',
    description: '24/7 AI chat support with context retention',
    basePrice: 3000,
    icon: '💬',
    color: '#a78bfa',
    category: 'chat',
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    description: 'Full-stack online store with payment integration',
    basePrice: 8000,
    icon: '🛒',
    color: '#c0ff6b',
    category: 'ecommerce',
  },
  {
    id: 'custom-app',
    name: 'Custom Web App',
    description: 'Bespoke application tailored to your needs',
    basePrice: 12000,
    icon: '🚀',
    color: '#fb923c',
    category: 'custom',
  },
];

const GRID_SIZE = 40;

function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

export default function ModuleBuilder() {
  const [placedModules, setPlacedModules] = useState<PlacedModule[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [springs, api] = useSprings(placedModules.length, (index) => ({
    x: placedModules[index]?.x || 0,
    y: placedModules[index]?.y || 0,
    scale: 1,
    config: config.wobbly,
  }));

  const bind = useDrag(
    ({ args: [index], down, movement: [mx, my], event }) => {
      event?.stopPropagation();

      if (down) {
        // While dragging
        api.start((i) => {
          if (i === index) {
            return {
              x: placedModules[index].x + mx,
              y: placedModules[index].y + my,
              scale: 1.1,
              immediate: true,
            };
          }
          return {};
        });
      } else {
        // On release - snap to grid
        const snappedX = snapToGrid(placedModules[index].x + mx);
        const snappedY = snapToGrid(placedModules[index].y + my);

        // Update state
        setPlacedModules((prev) => {
          const newModules = [...prev];
          // eslint-disable-next-line security/detect-object-injection
          newModules[index] = { ...newModules[index], x: snappedX, y: snappedY };
          return newModules;
        });

        // Animate to snapped position
        api.start((i) => {
          if (i === index) {
            return {
              x: snappedX,
              y: snappedY,
              scale: 1,
              immediate: false,
            };
          }
          return {};
        });
      }
    },
    {
      filterTaps: true,
    },
  );

  const handleAddModule = (module: Module) => {
    // Place new module at center of canvas
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const centerX = canvasRect ? canvasRect.width / 2 - 100 : 200;
    const centerY = canvasRect ? canvasRect.height / 2 - 75 : 200;

    const newModule: PlacedModule = {
      ...module,
      id: `${module.id}-${Date.now()}`, // Unique ID for multiple instances
      x: snapToGrid(centerX),
      y: snapToGrid(centerY),
    };

    setPlacedModules((prev) => [...prev, newModule]);
  };

  const handleRemoveModule = (index: number) => {
    setPlacedModules((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = (): number => {
    const subtotal = placedModules.reduce((sum, mod) => sum + mod.basePrice, 0);

    // Bundle discount: 2 modules = 5%, 3 modules = 10%, 4+ modules = 15%
    let discount = 0;
    if (placedModules.length >= 4) {
      discount = 0.15;
    } else if (placedModules.length === 3) {
      discount = 0.1;
    } else if (placedModules.length === 2) {
      discount = 0.05;
    }

    return Math.round(subtotal * (1 - discount));
  };

  const handleExportBlueprint = () => {
    if (placedModules.length === 0) return;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(24);
    doc.text('SENTIENT TERMINAL', 20, 20);
    doc.setFontSize(16);
    doc.text('Project Blueprint', 20, 30);

    // Date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 40);

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);

    // Module list
    doc.setFontSize(14);
    doc.text('Selected Modules:', 20, 55);

    let yPos = 65;
    placedModules.forEach((mod, i) => {
      doc.setFontSize(12);
      doc.text(`${i + 1}. ${mod.name}`, 25, yPos);
      doc.setFontSize(10);
      doc.text(mod.description, 25, yPos + 5);
      doc.text(`Price: $${mod.basePrice.toLocaleString()}`, 25, yPos + 10);
      yPos += 20;
    });

    // Pricing breakdown
    yPos += 10;
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    doc.setFontSize(12);
    const subtotal = placedModules.reduce((sum, mod) => sum + mod.basePrice, 0);
    doc.text(`Subtotal: $${subtotal.toLocaleString()}`, 25, yPos);

    if (placedModules.length >= 2) {
      yPos += 7;
      const discount = placedModules.length >= 4 ? 0.15 : placedModules.length === 3 ? 0.1 : 0.05;
      const discountAmount = subtotal * discount;
      doc.text(
        `Bundle Discount (${discount * 100}%): -$${Math.round(discountAmount).toLocaleString()}`,
        25,
        yPos,
      );
    }

    yPos += 10;
    doc.setFontSize(16);
    doc.text(`Total: $${calculateTotal().toLocaleString()}`, 25, yPos);

    // Footer
    doc.setFontSize(10);
    doc.text('Soft Systems Studio LLC', 20, 280);
    doc.text('hello@softsystems.studio', 20, 285);

    // Save PDF
    doc.save(`sentient-terminal-blueprint-${Date.now()}.pdf`);
  };

  return (
    <div className="relative min-h-screen bg-black py-16 px-4" id="architect">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(#c0ff6b 1px, transparent 1px),
            linear-gradient(90deg, #c0ff6b 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary-accent font-mono mb-4">
            THE ARCHITECT
          </h2>
          <p className="text-gray-400 font-mono text-sm mb-2">DRAG. DROP. BUILD YOUR SOLUTION.</p>
          <p className="text-gray-500 font-mono text-xs">
            Magnetic grid snapping • Bundle discounts • Instant pricing
          </p>
        </motion.div>

        {/* Module Palette */}
        <div className="mb-8">
          <h3 className="text-lg font-mono text-primary-accent mb-4">AVAILABLE MODULES:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AVAILABLE_MODULES.map((module) => (
              <motion.button
                key={module.id}
                onClick={() => handleAddModule(module)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative bg-black/80 border-2 rounded-lg p-4 text-left transition-all hover:shadow-lg"
                style={{ borderColor: module.color }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{module.icon}</span>
                  <h4 className="text-sm font-bold font-mono" style={{ color: module.color }}>
                    {module.name}
                  </h4>
                </div>
                <p className="text-xs text-gray-400 mb-2">{module.description}</p>
                <div className="text-xs font-mono text-gray-500">
                  ${module.basePrice.toLocaleString()}
                </div>

                {/* Glow effect */}
                <div
                  className="absolute inset-0 opacity-10 blur-xl pointer-events-none rounded-lg"
                  style={{ backgroundColor: module.color }}
                />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="relative">
          <div
            ref={canvasRef}
            className="relative bg-black/60 border-2 border-primary-accent rounded-lg overflow-hidden"
            style={{ minHeight: '500px', height: '60vh' }}
          >
            {/* Canvas label */}
            <div className="absolute top-4 left-4 text-xs font-mono text-gray-500 uppercase">
              DRAG ZONE
            </div>

            {/* Empty state */}
            {placedModules.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-primary-accent text-6xl mb-4 animate-pulse">↓</div>
                  <p className="text-gray-500 font-mono text-sm">
                    Drag modules here to start building
                  </p>
                </div>
              </div>
            )}

            {/* Placed modules */}
            {springs.map((style, index) => {
              // eslint-disable-next-line security/detect-object-injection
              const module = placedModules[index];
              if (!module) return null;

              return (
                <animated.div
                  key={module.id}
                  {...bind(index)}
                  style={{
                    ...style,
                    position: 'absolute',
                    touchAction: 'none',
                    cursor: 'grab',
                    width: '200px',
                  }}
                >
                  <div
                    className="relative bg-black border-2 rounded-lg p-4 backdrop-blur-sm"
                    style={{ borderColor: module.color }}
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveModule(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-xs font-bold hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{module.icon}</span>
                      <h4 className="text-sm font-bold font-mono" style={{ color: module.color }}>
                        {module.name}
                      </h4>
                    </div>

                    <div className="text-xs font-mono text-primary-accent">
                      ${module.basePrice.toLocaleString()}
                    </div>

                    {/* Glow effect */}
                    <div
                      className="absolute inset-0 opacity-20 blur-xl pointer-events-none rounded-lg"
                      style={{ backgroundColor: module.color }}
                    />
                  </div>
                </animated.div>
              );
            })}
          </div>
        </div>

        {/* Price Ticker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-black/80 border-2 border-primary-accent rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-mono text-gray-400 uppercase mb-2">TOTAL ESTIMATE</h3>
              <div className="flex items-baseline gap-2">
                <motion.div
                  key={calculateTotal()}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-4xl font-bold font-mono text-primary-accent"
                >
                  ${calculateTotal().toLocaleString()}
                </motion.div>
                {placedModules.length >= 2 && (
                  <span className="text-xs font-mono text-cyan-400">
                    (
                    {placedModules.length >= 4
                      ? '15% bundle discount'
                      : placedModules.length === 3
                        ? '10% bundle discount'
                        : '5% bundle discount'}
                    )
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono text-gray-500 mb-2">
                {placedModules.length} MODULE{placedModules.length !== 1 ? 'S' : ''}
              </div>
              <button
                onClick={handleExportBlueprint}
                disabled={placedModules.length === 0}
                className="px-6 py-3 bg-primary-accent text-black font-bold font-mono rounded hover:bg-primary-accent/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                EXPORT BLUEPRINT
              </button>
            </div>
          </div>

          {/* Module breakdown */}
          {placedModules.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="text-xs font-mono text-gray-400 uppercase mb-2">BREAKDOWN:</div>
              <div className="space-y-1">
                {placedModules.map((mod, i) => (
                  <div key={i} className="flex justify-between text-xs font-mono">
                    <span className="text-gray-500">
                      {mod.icon} {mod.name}
                    </span>
                    <span className="text-gray-400">${mod.basePrice.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <div className="inline-block bg-primary-accent/10 border border-primary-accent/30 rounded-lg px-6 py-4">
            <p className="text-primary-accent font-mono text-sm">
              💡 <strong>TIP:</strong> Multiple modules? Get up to 15% off!
            </p>
            <p className="text-gray-500 font-mono text-xs mt-2">
              2 modules = 5% • 3 modules = 10% • 4+ modules = 15%
            </p>
          </div>
        </motion.div>
      </div>

      {/* CRT Scanline Effect */}
      <div
        className="fixed inset-0 pointer-events-none z-20"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15) 0px,
            transparent 2px,
            transparent 4px
          )`,
          mixBlendMode: 'multiply',
        }}
      />
    </div>
  );
}
