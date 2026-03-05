import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  gradient?: 'none' | 'subtle' | 'dark';
}

const gradientClasses: Record<'none' | 'subtle' | 'dark', string> = {
  none: '',
  subtle: 'bg-gradient-to-b from-black via-[#0a0a0a] to-black',
  dark: 'bg-gradient-to-b from-[#0a0a0a] via-black to-[#0a0a0a]',
};

export default function Section({ children, id, className = '', gradient = 'none' }: SectionProps) {
  // eslint-disable-next-line security/detect-object-injection -- gradient is a typed union, not user input
  const gradientClass = gradientClasses[gradient];
  return (
    <section id={id} className={`py-24 ${gradientClass} ${className}`}>
      <div className="max-w-7xl mx-auto px-6">{children}</div>
    </section>
  );
}
