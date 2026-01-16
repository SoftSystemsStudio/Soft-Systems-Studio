'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HoloCard } from '@/components/ui';

interface Module {
  id: string;
  name: string;
  price: number;
  color: string;
  icon: string;
  description: string;
  category: 'ai' | 'web' | 'custom';
}

interface PlacedModule extends Module {
  x: number;
  y: number;
  placedAt: number;
}

const MODULES: Module[] = [
  {
    id: 'voice-ai',
    name: 'Voice Agent',
    price: 5000,
    color: '#A855F7',
    icon: '🎙️',
    description: 'AI-powered phone system with natural conversation',
    category: 'ai',
  },
  {
    id: 'chatbot',
    name: 'CRM Sync',
    price: 3000,
    color: '#8B5CF6',
    icon: '💬',
    description: 'Seamless CRM integration and sync',
    category: 'ai',
  },
  {
    id: 'workflow',
    name: 'Chat Bot',
    price: 4000,
    color: '#6366F1',
    icon: '⚡',
    description: '24/7 intelligent chat support',
    category: 'ai',
  },
  {
    id: 'website',
    name: 'Payments',
    price: 3500,
    color: '#3B82F6',
    icon: '💳',
    description: 'Payment processing and billing',
    category: 'web',
  },
  {
    id: 'ecommerce',
    name: 'Analytics',
    price: 8000,
    color: '#06B6D4',
    icon: '📊',
    description: 'Business intelligence and reporting',
    category: 'web',
  },
  {
    id: 'custom-app',
    name: 'Email Auto',
    price: 12000,
    color: '#10B981',
    icon: '📧',
    description: 'Email automation and campaigns',
    category: 'custom',
  },
];

export default function TheArchitect() {
  const [placedModules, setPlacedModules] = useState<PlacedModule[]>([]);
  const [draggedModule, setDraggedModule] = useState<Module | null>(null);
  const [email, setEmail] = useState('');
  const [showQuote, setShowQuote] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const totalPrice = placedModules.reduce((sum, mod) => sum + mod.price, 0);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Play snap sound
  const playSnapSound = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-unsafe-member-access
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 200;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }, []);

  const handleDragStart = (module: Module) => {
    setDraggedModule(module);
  };

  // Mobile: tap to add module to canvas
  const handleModuleTap = (module: Module) => {
    if (!isMobile) return;

    // Check if module already placed
    if (placedModules.find((m) => m.id === module.id)) {
      return;
    }

    // Find next available position in a grid pattern
    const startX = 40;
    const startY = 40;
    const spacing = 200;

    // Simple grid placement: place modules in rows
    const index = placedModules.length;
    const columns = 3;
    const row = Math.floor(index / columns);
    const col = index % columns;

    const x = startX + col * spacing;
    const y = startY + row * spacing;

    setPlacedModules((prev) => [
      ...prev,
      {
        ...module,
        x,
        y,
        placedAt: Date.now(),
      },
    ]);

    playSnapSound();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!draggedModule || !canvasRef.current) return;

    // Check if module already placed
    if (placedModules.find((m) => m.id === draggedModule.id)) {
      setDraggedModule(null);
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Snap to grid (20px grid)
    const snappedX = Math.round(x / 20) * 20;
    const snappedY = Math.round(y / 20) * 20;

    setPlacedModules((prev) => [
      ...prev,
      {
        ...draggedModule,
        x: snappedX,
        y: snappedY,
        placedAt: Date.now(),
      },
    ]);

    playSnapSound();
    setDraggedModule(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeModule = (id: string) => {
    setPlacedModules((prev) => prev.filter((m) => m.id !== id));
  };

  const handleGetQuote = () => {
    if (!email) {
      alert('Please enter your email to receive the quote');
      return;
    }
    setShowQuote(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Price Ticker */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-20 right-8 z-50 glass-card px-6 py-4"
      >
        <div className="text-xs text-gray-400 font-mono mb-1">TOTAL ESTIMATE</div>
        <motion.div
          key={totalPrice}
          initial={{ scale: 1.2, color: '#A855F7' }}
          animate={{ scale: 1, color: '#FFFFFF' }}
          className="text-3xl font-bold font-mono"
        >
          ${totalPrice.toLocaleString()}
        </motion.div>
        <div className="text-xs text-gray-500 font-mono mt-1">
          {placedModules.length} module{placedModules.length !== 1 ? 's' : ''}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Module Palette */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-bold text-white mb-4 font-mono">MODULE LIBRARY</h3>
          <div className="space-y-3">
            {MODULES.map((module) => {
              const isPlaced = placedModules.find((m) => m.id === module.id);
              return (
                <motion.div
                  key={module.id}
                  draggable={!isPlaced && !isMobile}
                  onDragStart={() => handleDragStart(module)}
                  onClick={() => handleModuleTap(module)}
                  className={`${isMobile ? 'cursor-pointer' : 'cursor-move'} ${isPlaced ? 'opacity-50 cursor-not-allowed' : ''}`}
                  whileHover={!isPlaced ? { scale: 1.05 } : {}}
                  whileTap={!isPlaced && isMobile ? { scale: 0.95 } : {}}
                >
                  <HoloCard
                    className="p-4"
                    glowColor={module.category === 'ai' ? 'purple' : 'blue'}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{module.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white mb-1">{module.name}</div>
                        <div className="text-xs text-gray-400 mb-2">{module.description}</div>
                        <div className="text-sm font-mono" style={{ color: module.color }}>
                          ${module.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </HoloCard>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 p-4 glass-card">
            <div className="text-xs text-purple-400 font-mono mb-2">💡 HINT</div>
            <div className="text-xs text-gray-500">
              {isMobile
                ? "Tap modules to add them to your stack. They'll arrange automatically."
                : 'Drag modules onto the canvas to build your custom stack. Modules snap to grid.'}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3">
          <h3 className="text-lg font-bold text-white mb-4 font-mono">BUILD YOUR STACK</h3>
          <div
            ref={canvasRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="relative w-full h-[600px] glass-card overflow-hidden"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(168, 85, 247, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(168, 85, 247, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          >
            {/* Drop Zone Hint */}
            {placedModules.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="text-4xl mb-4">🎯</div>
                  <div className="text-gray-500 font-mono text-sm">
                    {isMobile
                      ? 'Tap modules on the left to start building'
                      : 'Drop modules here to start building'}
                  </div>
                </div>
              </div>
            )}

            {/* Placed Modules */}
            <AnimatePresence>
              {placedModules.map((module) => (
                <motion.div
                  key={module.id}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 10, opacity: 0 }}
                  style={{
                    position: 'absolute',
                    left: module.x,
                    top: module.y,
                  }}
                  className="group"
                >
                  <div
                    className="relative glass-card p-4 min-w-[180px] shadow-lg"
                    style={{ borderColor: module.color, borderWidth: '1px' }}
                  >
                    {/* Remove Button */}
                    <button
                      onClick={() => removeModule(module.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{module.icon}</span>
                      <span className="text-xs font-bold text-white">{module.name}</span>
                    </div>
                    <div className="text-xs font-mono" style={{ color: module.color }}>
                      ${module.price.toLocaleString()}
                    </div>

                    {/* Connection Lines (visual only) */}
                    <div
                      className="absolute bottom-0 left-1/2 w-px h-4 bg-purple-500/30"
                      style={{ transform: 'translateX(-50%)' }}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-4">
            {placedModules.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors rounded-xl"
                />
                <button
                  onClick={handleGetQuote}
                  className="px-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Get Quote
                </button>
              </motion.div>
            )}

            {placedModules.length > 0 && (
              <button
                onClick={() => setPlacedModules([])}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                ← Clear Canvas
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quote Modal */}
      <AnimatePresence>
        {showQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowQuote(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="glass-card p-8 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-4">Your Custom Quote</h3>

              <div className="space-y-4 mb-6">
                <div className="p-4 glass-card">
                  <div className="text-sm text-gray-400 mb-2">Selected Modules:</div>
                  {placedModules.map((module) => (
                    <div key={module.id} className="flex justify-between items-center mb-2">
                      <span className="text-white">
                        {module.icon} {module.name}
                      </span>
                      <span className="font-mono" style={{ color: module.color }}>
                        ${module.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-white">Total Estimate:</span>
                    <span className="text-3xl font-bold text-gradient-purple font-mono">
                      ${totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  Quote sent to: <span className="text-white">{email}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowQuote(false)}
                  className="flex-1 px-6 py-3 glass-card text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  Build More
                </button>
                <button
                  onClick={() => (window.location.href = '/intake')}
                  className="flex-1 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Schedule Call →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
