import React from 'react';

interface GlowTextProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'p';
  color?: 'lime' | 'cyan' | 'fuchsia';
  className?: string;
  mono?: boolean;
}

const colorClasses = {
  lime: 'text-brand-lime drop-shadow-[0_0_10px_rgba(192,255,107,0.5)]',
  cyan: 'text-glow-cyan drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]',
  fuchsia: 'text-glow-fuchsia drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]',
};

export default function GlowText({
  children,
  as: Component = 'span',
  color = 'lime',
  className = '',
  mono = false,
}: GlowTextProps) {
  return (
    <Component
      className={`
        ${colorClasses[color]}
        ${mono ? 'font-mono tracking-widest' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}
