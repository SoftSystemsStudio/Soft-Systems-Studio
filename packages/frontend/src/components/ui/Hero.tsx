import React from 'react';
import Button from './Button';

interface HeroProps {
  badge?: string;
  title: React.ReactNode;
  subtitle: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  className?: string;
}

export default function Hero({
  badge,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  className = '',
}: HeroProps) {
  return (
    <section className={`relative min-h-[90vh] flex items-center justify-center ${className}`}>
      {/* Ambient radial glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[120%] h-[600px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.25),transparent)]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {badge && (
          <span className="inline-block mb-4 text-xs uppercase tracking-widest text-indigo-400 font-medium">
            {badge}
          </span>
        )}

        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-white mb-6">
          {title}
        </h1>

        <p className="text-lg md:text-xl leading-relaxed text-gray-300 max-w-2xl mx-auto mb-10">
          {subtitle}
        </p>

        {(primaryCta || secondaryCta) && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {primaryCta && (
              <Button as="link" href={primaryCta.href} variant="primary" size="lg">
                {primaryCta.label}
              </Button>
            )}
            {secondaryCta && (
              <Button as="anchor" href={secondaryCta.href} variant="ghost" size="lg">
                {secondaryCta.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
