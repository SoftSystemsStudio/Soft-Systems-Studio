'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  sparklineData?: number[];
}

export default function MetricCard({
  title,
  value,
  unit = '',
  icon,
  color,
  trend,
  trendValue,
  sparklineData = [],
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef(value);

  // Animate counter when value changes
  useEffect(() => {
    const startValue = previousValueRef.current;
    const endValue = value;
    const duration = 1000; // 1 second animation
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValue + (endValue - startValue) * eased;
      setDisplayValue(Math.round(currentValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValueRef.current = endValue;
      }
    };

    animate();
  }, [value]);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'stable':
        return '→';
      default:
        return '';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#22d3ee'; // cyan (positive)
      case 'down':
        return '#fb923c'; // orange (warning)
      case 'stable':
        return '#6b7280'; // gray
      default:
        return color;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, borderColor: color }}
      className="relative bg-black/80 border-2 border-gray-800 rounded-lg p-6 backdrop-blur-sm overflow-hidden transition-all"
      style={{ borderColor: color }}
    >
      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 2px,
            ${color} 2px,
            ${color} 4px
          )`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider">{title}</h3>
          </div>

          {trend && (
            <div
              className="flex items-center gap-1 text-xs font-mono"
              style={{ color: getTrendColor() }}
            >
              <span>{getTrendIcon()}</span>
              {trendValue !== undefined && <span>{trendValue}%</span>}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-4">
          <motion.div
            key={displayValue}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold font-mono"
            style={{ color }}
          >
            {displayValue.toLocaleString()}
            {unit && <span className="text-2xl ml-1 text-gray-500">{unit}</span>}
          </motion.div>
        </div>

        {/* Sparkline */}
        {sparklineData.length > 0 && (
          <div className="h-12 flex items-end gap-1">
            {sparklineData.slice(-20).map((dataPoint, i) => {
              const maxValue = Math.max(...sparklineData);
              const height = (dataPoint / maxValue) * 100;

              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.02 }}
                  className="flex-1 rounded-sm opacity-60"
                  style={{ backgroundColor: color }}
                />
              );
            })}
          </div>
        )}

        {/* Glow effect */}
        <div
          className="absolute inset-0 opacity-10 blur-2xl pointer-events-none"
          style={{ backgroundColor: color }}
        />
      </div>
    </motion.div>
  );
}
