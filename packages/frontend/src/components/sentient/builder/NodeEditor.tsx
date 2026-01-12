'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useSounds } from '@/components/ui/SoundManager';

/**
 * NodeEditor - Full n8n-style node-based workflow configurator
 *
 * Features:
 * - Drag and drop nodes onto canvas
 * - Visual wire connections between nodes
 * - Real-time price calculation
 * - JSON export of workflow configuration
 * - Connection validation
 */

interface NodePort {
  id: string;
  type: 'input' | 'output';
  label: string;
  dataType: 'any' | 'data' | 'trigger' | 'api';
}

interface NodeDefinition {
  id: string;
  name: string;
  price: number;
  monthlyPrice?: number;
  color: string;
  icon: string;
  description: string;
  category: 'trigger' | 'ai' | 'integration' | 'output';
  inputs: NodePort[];
  outputs: NodePort[];
}

interface PlacedNode extends NodeDefinition {
  instanceId: string;
  x: number;
  y: number;
}

interface Connection {
  id: string;
  fromNode: string;
  fromPort: string;
  toNode: string;
  toPort: string;
}

// Node library
const NODE_DEFINITIONS: NodeDefinition[] = [
  {
    id: 'trigger-webhook',
    name: 'Webhook Trigger',
    price: 0,
    color: '#10b981',
    icon: '🔗',
    description: 'Start workflow from HTTP request',
    category: 'trigger',
    inputs: [],
    outputs: [{ id: 'out', type: 'output', label: 'Request', dataType: 'trigger' }],
  },
  {
    id: 'trigger-schedule',
    name: 'Schedule Trigger',
    price: 500,
    monthlyPrice: 25,
    color: '#f59e0b',
    icon: '⏰',
    description: 'Run on a schedule (cron)',
    category: 'trigger',
    inputs: [],
    outputs: [{ id: 'out', type: 'output', label: 'Tick', dataType: 'trigger' }],
  },
  {
    id: 'voice-ai',
    name: 'Voice AI Reception',
    price: 5000,
    monthlyPrice: 200,
    color: '#22d3ee',
    icon: '🎙️',
    description: 'AI-powered phone system',
    category: 'ai',
    inputs: [{ id: 'trigger', type: 'input', label: 'Trigger', dataType: 'trigger' }],
    outputs: [
      { id: 'transcript', type: 'output', label: 'Transcript', dataType: 'data' },
      { id: 'intent', type: 'output', label: 'Intent', dataType: 'data' },
    ],
  },
  {
    id: 'chatbot',
    name: 'AI Chatbot',
    price: 3000,
    monthlyPrice: 150,
    color: '#a78bfa',
    icon: '💬',
    description: '24/7 intelligent chat support',
    category: 'ai',
    inputs: [{ id: 'trigger', type: 'input', label: 'Message', dataType: 'trigger' }],
    outputs: [{ id: 'response', type: 'output', label: 'Response', dataType: 'data' }],
  },
  {
    id: 'gpt-process',
    name: 'GPT Processor',
    price: 2000,
    monthlyPrice: 100,
    color: '#8b5cf6',
    icon: '🧠',
    description: 'Process data with GPT-4',
    category: 'ai',
    inputs: [{ id: 'data', type: 'input', label: 'Input', dataType: 'data' }],
    outputs: [{ id: 'result', type: 'output', label: 'Result', dataType: 'data' }],
  },
  {
    id: 'stripe',
    name: 'Stripe Payment',
    price: 1500,
    color: '#6366f1',
    icon: '💳',
    description: 'Process payments via Stripe',
    category: 'integration',
    inputs: [{ id: 'order', type: 'input', label: 'Order', dataType: 'data' }],
    outputs: [
      { id: 'success', type: 'output', label: 'Success', dataType: 'data' },
      { id: 'failed', type: 'output', label: 'Failed', dataType: 'data' },
    ],
  },
  {
    id: 'crm-sync',
    name: 'CRM Sync',
    price: 1000,
    color: '#ec4899',
    icon: '👥',
    description: 'Sync data to your CRM',
    category: 'integration',
    inputs: [{ id: 'data', type: 'input', label: 'Data', dataType: 'data' }],
    outputs: [{ id: 'synced', type: 'output', label: 'Synced', dataType: 'data' }],
  },
  {
    id: 'email-send',
    name: 'Send Email',
    price: 500,
    color: '#14b8a6',
    icon: '📧',
    description: 'Send transactional emails',
    category: 'output',
    inputs: [{ id: 'content', type: 'input', label: 'Content', dataType: 'data' }],
    outputs: [{ id: 'sent', type: 'output', label: 'Sent', dataType: 'data' }],
  },
  {
    id: 'slack-notify',
    name: 'Slack Notification',
    price: 300,
    color: '#e879f9',
    icon: '🔔',
    description: 'Send Slack messages',
    category: 'output',
    inputs: [{ id: 'message', type: 'input', label: 'Message', dataType: 'data' }],
    outputs: [],
  },
  {
    id: 'database',
    name: 'Database Store',
    price: 800,
    color: '#fb923c',
    icon: '🗄️',
    description: 'Store data in database',
    category: 'output',
    inputs: [{ id: 'data', type: 'input', label: 'Data', dataType: 'data' }],
    outputs: [{ id: 'stored', type: 'output', label: 'Stored', dataType: 'data' }],
  },
];

export default function NodeEditor() {
  const [placedNodes, setPlacedNodes] = useState<PlacedNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [draggingConnection, setDraggingConnection] = useState<{
    fromNode: string;
    fromPort: string;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const sounds = useSounds();

  // Calculate pricing
  const pricing = useMemo(() => {
    const oneTime = placedNodes.reduce((sum, node) => sum + node.price, 0);
    const monthly = placedNodes.reduce((sum, node) => sum + (node.monthlyPrice || 0), 0);
    return { oneTime, monthly };
  }, [placedNodes]);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate unique instance ID
  const generateId = () => `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Handle node drop from palette
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const nodeId = e.dataTransfer.getData('nodeId');
      const nodeDef = NODE_DEFINITIONS.find((n) => n.id === nodeId);

      if (!nodeDef || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.round((e.clientX - rect.left - 90) / 20) * 20;
      const y = Math.round((e.clientY - rect.top - 40) / 20) * 20;

      const newNode: PlacedNode = {
        ...nodeDef,
        instanceId: generateId(),
        x: Math.max(0, x),
        y: Math.max(0, y),
      };

      setPlacedNodes((prev) => [...prev, newNode]);
      sounds.playSnap();
    },
    [sounds],
  );

  // Handle mobile tap to add
  const handleNodeTap = useCallback(
    (nodeDef: NodeDefinition) => {
      if (!isMobile) return;

      const index = placedNodes.length;
      const col = index % 2;
      const row = Math.floor(index / 2);

      const newNode: PlacedNode = {
        ...nodeDef,
        instanceId: generateId(),
        x: 20 + col * 220,
        y: 20 + row * 140,
      };

      setPlacedNodes((prev) => [...prev, newNode]);
      sounds.playSnap();
    },
    [isMobile, placedNodes.length, sounds],
  );

  // Handle node drag within canvas
  const handleNodeDrag = useCallback((instanceId: string, deltaX: number, deltaY: number) => {
    setPlacedNodes((prev) =>
      prev.map((node) =>
        node.instanceId === instanceId
          ? {
              ...node,
              x: Math.max(0, Math.round((node.x + deltaX) / 20) * 20),
              y: Math.max(0, Math.round((node.y + deltaY) / 20) * 20),
            }
          : node,
      ),
    );
  }, []);

  // Start creating a connection
  const handlePortMouseDown = useCallback(
    (nodeId: string, portId: string, e: React.MouseEvent) => {
      e.stopPropagation();

      const node = placedNodes.find((n) => n.instanceId === nodeId);
      const port = node?.outputs.find((p) => p.id === portId);

      if (!node || !port) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      setDraggingConnection({
        fromNode: nodeId,
        fromPort: portId,
        startX: node.x + 180,
        startY: node.y + 50,
        currentX: e.clientX - rect.left,
        currentY: e.clientY - rect.top,
      });
    },
    [placedNodes],
  );

  // Update dragging connection position
  useEffect(() => {
    if (!draggingConnection) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      setDraggingConnection((prev) =>
        prev
          ? {
              ...prev,
              currentX: e.clientX - rect.left,
              currentY: e.clientY - rect.top,
            }
          : null,
      );
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Check if we're over an input port
      const target = e.target as HTMLElement;
      const portElement = target.closest('[data-port-input]');

      if (portElement && draggingConnection) {
        const toNode = portElement.getAttribute('data-node-id');
        const toPort = portElement.getAttribute('data-port-id');

        if (toNode && toPort && toNode !== draggingConnection.fromNode) {
          // Check if connection already exists
          const exists = connections.some(
            (c) =>
              c.fromNode === draggingConnection.fromNode &&
              c.fromPort === draggingConnection.fromPort &&
              c.toNode === toNode &&
              c.toPort === toPort,
          );

          if (!exists) {
            setConnections((prev) => [
              ...prev,
              {
                id: generateId(),
                fromNode: draggingConnection.fromNode,
                fromPort: draggingConnection.fromPort,
                toNode,
                toPort,
              },
            ]);
            sounds.playSuccess();
          }
        }
      }

      setDraggingConnection(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingConnection, connections, sounds]);

  // Remove node
  const removeNode = useCallback(
    (instanceId: string) => {
      setPlacedNodes((prev) => prev.filter((n) => n.instanceId !== instanceId));
      setConnections((prev) =>
        prev.filter((c) => c.fromNode !== instanceId && c.toNode !== instanceId),
      );
      sounds.playClick();
    },
    [sounds],
  );

  // Remove connection
  const removeConnection = useCallback(
    (connectionId: string) => {
      setConnections((prev) => prev.filter((c) => c.id !== connectionId));
      sounds.playClick();
    },
    [sounds],
  );

  // Export workflow as JSON
  const exportWorkflow = useCallback(() => {
    const workflow = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      email,
      pricing,
      nodes: placedNodes.map((node) => ({
        id: node.instanceId,
        type: node.id,
        name: node.name,
        position: { x: node.x, y: node.y },
      })),
      connections: connections.map((conn) => ({
        from: { node: conn.fromNode, port: conn.fromPort },
        to: { node: conn.toNode, port: conn.toPort },
      })),
    };

    return JSON.stringify(workflow, null, 2);
  }, [placedNodes, connections, email, pricing]);

  // Calculate connection path (curved bezier)
  const getConnectionPath = useCallback(
    (fromNodeId: string, fromPortId: string, toNodeId: string, toPortId: string) => {
      const fromNode = placedNodes.find((n) => n.instanceId === fromNodeId);
      const toNode = placedNodes.find((n) => n.instanceId === toNodeId);

      if (!fromNode || !toNode) return '';

      const startX = fromNode.x + 180;
      const startY = fromNode.y + 50;
      const endX = toNode.x;
      const endY = toNode.y + 50;

      const dx = endX - startX;
      const controlOffset = Math.min(Math.abs(dx) / 2, 100);

      return `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;
    },
    [placedNodes],
  );

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Price Display */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-20 right-8 z-50 bg-black/95 border-2 border-brand-lime rounded-lg px-6 py-4 backdrop-blur-sm"
      >
        <div className="text-xs text-gray-400 font-mono mb-1">BUILD ESTIMATE</div>
        <motion.div
          key={pricing.oneTime}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-3xl font-bold font-mono text-brand-lime"
        >
          ${pricing.oneTime.toLocaleString()}
        </motion.div>
        {pricing.monthly > 0 && (
          <div className="text-sm font-mono text-cyan-400 mt-1">+${pricing.monthly}/mo</div>
        )}
        <div className="text-xs text-gray-500 font-mono mt-2">
          {placedNodes.length} nodes • {connections.length} connections
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Node Palette */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-white font-mono">NODE LIBRARY</h3>

          {['trigger', 'ai', 'integration', 'output'].map((category) => (
            <div key={category}>
              <div className="text-xs text-gray-500 font-mono uppercase mb-2">{category}</div>
              <div className="space-y-2">
                {NODE_DEFINITIONS.filter((n) => n.category === category).map((node) => (
                  <motion.div
                    key={node.id}
                    draggable={!isMobile}
                    onDragStart={(e) => {
                      // @ts-expect-error - accessing dataTransfer on drag event
                      e.dataTransfer?.setData('nodeId', node.id);
                    }}
                    onClick={() => handleNodeTap(node)}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`${isMobile ? 'cursor-pointer' : 'cursor-grab'} bg-gray-900/80 border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{node.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{node.name}</div>
                        <div className="text-xs font-mono" style={{ color: node.color }}>
                          ${node.price.toLocaleString()}
                          {node.monthlyPrice && (
                            <span className="text-gray-500"> +${node.monthlyPrice}/mo</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div className="lg:col-span-4">
          <h3 className="text-lg font-bold text-white font-mono mb-4">WORKFLOW CANVAS</h3>
          <div
            ref={canvasRef}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="relative w-full h-[600px] bg-black border-2 border-cyan-400/30 rounded-lg overflow-hidden"
            style={{
              backgroundImage: `
                radial-gradient(circle at 1px 1px, rgba(34, 211, 238, 0.15) 1px, transparent 0)
              `,
              backgroundSize: '20px 20px',
            }}
          >
            {/* SVG layer for connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c0ff6b" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>

              {/* Existing connections */}
              {connections.map((conn) => (
                <g key={conn.id}>
                  <path
                    d={getConnectionPath(conn.fromNode, conn.fromPort, conn.toNode, conn.toPort)}
                    fill="none"
                    stroke="url(#connectionGradient)"
                    strokeWidth="2"
                    className="pointer-events-auto cursor-pointer hover:stroke-red-500"
                    onClick={() => removeConnection(conn.id)}
                  />
                  {/* Animated flow */}
                  <circle r="3" fill="#c0ff6b">
                    <animateMotion
                      dur="2s"
                      repeatCount="indefinite"
                      path={getConnectionPath(
                        conn.fromNode,
                        conn.fromPort,
                        conn.toNode,
                        conn.toPort,
                      )}
                    />
                  </circle>
                </g>
              ))}

              {/* Dragging connection preview */}
              {draggingConnection && (
                <path
                  d={`M ${draggingConnection.startX} ${draggingConnection.startY} C ${draggingConnection.startX + 50} ${draggingConnection.startY}, ${draggingConnection.currentX - 50} ${draggingConnection.currentY}, ${draggingConnection.currentX} ${draggingConnection.currentY}`}
                  fill="none"
                  stroke="#c0ff6b"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.7"
                />
              )}
            </svg>

            {/* Empty state */}
            {placedNodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-4">🔧</div>
                  <div className="text-gray-500 font-mono">
                    {isMobile ? 'Tap nodes to add them' : 'Drag nodes here to build your workflow'}
                  </div>
                </div>
              </div>
            )}

            {/* Placed nodes */}
            <AnimatePresence>
              {placedNodes.map((node) => (
                <motion.div
                  key={node.instanceId}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  drag
                  dragMomentum={false}
                  onDrag={(_, info) => handleNodeDrag(node.instanceId, info.delta.x, info.delta.y)}
                  onClick={() => setSelectedNode(node.instanceId)}
                  style={{
                    position: 'absolute',
                    left: node.x,
                    top: node.y,
                  }}
                  className={`group cursor-move ${selectedNode === node.instanceId ? 'z-20' : 'z-10'}`}
                >
                  <div
                    className={`relative bg-gray-900 border-2 rounded-lg w-[180px] shadow-lg ${
                      selectedNode === node.instanceId ? 'ring-2 ring-white/50' : ''
                    }`}
                    style={{ borderColor: node.color }}
                  >
                    {/* Header */}
                    <div
                      className="px-3 py-2 rounded-t-md flex items-center gap-2"
                      style={{ backgroundColor: `${node.color}20` }}
                    >
                      <span className="text-lg">{node.icon}</span>
                      <span className="text-xs font-bold text-white truncate flex-1">
                        {node.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNode(node.instanceId);
                        }}
                        className="w-5 h-5 rounded-full bg-gray-800 text-gray-400 text-xs hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>

                    {/* Ports */}
                    <div className="px-3 py-2">
                      {/* Input ports */}
                      {node.inputs.map((port) => (
                        <div
                          key={port.id}
                          data-port-input
                          data-node-id={node.instanceId}
                          data-port-id={port.id}
                          className="flex items-center gap-2 mb-1 cursor-pointer group/port"
                        >
                          <div className="w-3 h-3 rounded-full border-2 border-gray-500 bg-gray-900 group-hover/port:border-cyan-400 group-hover/port:bg-cyan-400/20 transition-colors -ml-[18px]" />
                          <span className="text-xs text-gray-400">{port.label}</span>
                        </div>
                      ))}

                      {/* Output ports */}
                      {node.outputs.map((port) => (
                        <div key={port.id} className="flex items-center justify-end gap-2 mb-1">
                          <span className="text-xs text-gray-400">{port.label}</span>
                          <div
                            onMouseDown={(e) => handlePortMouseDown(node.instanceId, port.id, e)}
                            className="w-3 h-3 rounded-full border-2 border-gray-500 bg-gray-900 cursor-crosshair hover:border-brand-lime hover:bg-brand-lime/20 transition-colors -mr-[18px]"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Price tag */}
                    <div
                      className="px-3 py-1 text-xs font-mono text-right border-t border-gray-800"
                      style={{ color: node.color }}
                    >
                      ${node.price.toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-4">
            {placedNodes.length > 0 && (
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
                  className="flex-1 px-4 py-3 bg-black border-2 border-brand-lime/30 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-brand-lime transition-colors rounded-lg"
                />
                <button
                  onClick={() => setShowExport(true)}
                  className="px-8 py-3 bg-brand-lime text-black font-bold font-mono rounded-lg hover:bg-brand-lime/90 transition-colors"
                >
                  SUBMIT WORKFLOW
                </button>
              </motion.div>
            )}

            {placedNodes.length > 0 && (
              <button
                onClick={() => {
                  setPlacedNodes([]);
                  setConnections([]);
                }}
                className="text-xs text-gray-500 hover:text-white font-mono transition-colors"
              >
                ← Clear Canvas
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowExport(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-black border-2 border-brand-lime rounded-lg p-8 max-w-3xl w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-brand-lime font-mono mb-4">
                WORKFLOW SUBMITTED
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-gray-900 rounded-lg">
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-400">Setup Cost:</span>
                    <span className="text-2xl font-bold text-brand-lime font-mono">
                      ${pricing.oneTime.toLocaleString()}
                    </span>
                  </div>
                  {pricing.monthly > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Monthly Cost:</span>
                      <span className="text-lg font-bold text-cyan-400 font-mono">
                        ${pricing.monthly}/mo
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-900 rounded-lg">
                  <div className="text-sm text-gray-400 mb-2 font-mono">
                    WORKFLOW JSON (sent to our team):
                  </div>
                  <pre className="text-xs text-brand-lime font-mono overflow-auto max-h-64 bg-black p-4 rounded">
                    {exportWorkflow()}
                  </pre>
                </div>

                <div className="text-sm text-gray-400">
                  ✉️ We'll contact you at:{' '}
                  <span className="text-white">{email || 'No email provided'}</span>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowExport(false)}
                  className="flex-1 px-6 py-3 bg-gray-800 text-white font-mono rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Continue Building
                </button>
                <button
                  onClick={() => (window.location.href = '/intake')}
                  className="flex-1 px-6 py-3 bg-brand-lime text-black font-bold font-mono rounded-lg hover:bg-brand-lime/90 transition-colors"
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
