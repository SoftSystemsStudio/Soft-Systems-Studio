import React from 'react';

interface ScanLineProps {
  color?: 'lime' | 'cyan' | 'fuchsia';
  className?: string;
}

const colorClasses = {
  lime: 'bg-brand-lime via-brand-lime/80',
  cyan: 'bg-glow-cyan via-glow-cyan/80',
  fuchsia: 'bg-glow-fuchsia via-glow-fuchsia/80',
};

export default function ScanLine({ color = 'lime', className = '' }: ScanLineProps) {
  return (
    <div className={`h-px w-full overflow-hidden ${className}`}>
      <div
        className={`h-full w-1/4 bg-gradient-to-r from-transparent ${colorClasses[color]} to-transparent animate-scan`}
      />
    </div>
  );
}
