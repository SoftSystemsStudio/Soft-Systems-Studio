import React from 'react';

interface HoloCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'purple' | 'blue' | 'cyan';
  showScanLine?: boolean;
}

const glowColors = {
  purple: {
    border: 'border-purple-500/20',
    shadow: 'shadow-purple-500/10',
    scanBg: 'bg-purple-500',
    scanGlow: 'via-purple-500/80',
    hoverBorder: 'hover:border-purple-500/40',
  },
  blue: {
    border: 'border-blue-500/20',
    shadow: 'shadow-blue-500/10',
    scanBg: 'bg-blue-500',
    scanGlow: 'via-blue-500/80',
    hoverBorder: 'hover:border-blue-500/40',
  },
  cyan: {
    border: 'border-cyan-500/20',
    shadow: 'shadow-cyan-500/10',
    scanBg: 'bg-cyan-500',
    scanGlow: 'via-cyan-500/80',
    hoverBorder: 'hover:border-cyan-500/40',
  },
};

export default function HoloCard({
  children,
  className = '',
  glowColor = 'purple',
  showScanLine = false,
}: HoloCardProps) {
  const colors = glowColors[glowColor];

  return (
    <div
      className={`
        relative overflow-hidden
        backdrop-blur-sm bg-white/5
        border ${colors.border} ${colors.hoverBorder}
        rounded-2xl
        shadow-lg ${colors.shadow}
        transition-all duration-300
        ${className}
      `}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />

      {/* Optional scanning line animation */}
      {showScanLine && (
        <div className="absolute inset-x-0 top-0 h-px overflow-hidden">
          <div
            className={`h-full w-1/3 bg-gradient-to-r from-transparent ${colors.scanGlow} to-transparent animate-scan`}
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
