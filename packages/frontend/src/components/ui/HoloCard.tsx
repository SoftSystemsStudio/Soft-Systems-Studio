import React from 'react';

interface HoloCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'lime' | 'cyan' | 'fuchsia';
  showScanLine?: boolean;
}

const glowColors = {
  lime: {
    border: 'border-brand-lime/30',
    shadow: 'shadow-brand-lime/20',
    scanBg: 'bg-brand-lime',
    scanGlow: 'via-brand-lime/80',
  },
  cyan: {
    border: 'border-glow-cyan/30',
    shadow: 'shadow-glow-cyan/20',
    scanBg: 'bg-glow-cyan',
    scanGlow: 'via-glow-cyan/80',
  },
  fuchsia: {
    border: 'border-glow-fuchsia/30',
    shadow: 'shadow-glow-fuchsia/20',
    scanBg: 'bg-glow-fuchsia',
    scanGlow: 'via-glow-fuchsia/80',
  },
};

export default function HoloCard({
  children,
  className = '',
  glowColor = 'lime',
  showScanLine = false,
}: HoloCardProps) {
  const colors = glowColors[glowColor];

  return (
    <div
      className={`
        relative overflow-hidden
        backdrop-blur-md bg-white/5
        border-t border-l ${colors.border}
        rounded-xl
        shadow-lg ${colors.shadow}
        ${className}
      `}
    >
      {/* Holographic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

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
