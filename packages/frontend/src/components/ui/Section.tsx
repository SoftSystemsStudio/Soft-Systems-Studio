import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  gradient?: 'none' | 'subtle' | 'dark';
}

const gradientClasses: Record<'none' | 'subtle' | 'dark', string> = {
  none: '',
  subtle: 'bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900',
  dark: 'bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950',
};

export default function Section({ children, id, className = '', gradient = 'none' }: SectionProps) {
  return (
    <section id={id} className={`py-24 ${gradientClasses[gradient]} ${className}`}>
      <div className="max-w-7xl mx-auto px-6">{children}</div>
    </section>
  );
}
