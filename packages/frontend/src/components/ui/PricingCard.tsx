import React from 'react';
import Button from './Button';

interface PricingCardProps {
  name: string;
  scope: string;
  complexity: string;
  description: string;
  features?: string[];
  ctaText?: string;
  ctaHref?: string;
  highlighted?: boolean;
  badge?: string;
  className?: string;
  // Legacy support
  price?: string;
}

export default function PricingCard({
  name,
  scope,
  complexity,
  description,
  features = [],
  ctaText = 'Get started',
  ctaHref = '/intake',
  highlighted = false,
  badge,
  className = '',
  price, // Legacy support
}: PricingCardProps) {
  const baseClasses = 'relative flex flex-col p-8 rounded-2xl transition-all duration-300';
  const normalClasses =
    'bg-white/5 border border-white/10 backdrop-blur-sm hover:border-white/20 hover:bg-white/[0.08]';
  const highlightedClasses =
    'bg-white/[0.08] border-2 border-purple-500/50 backdrop-blur-sm shadow-lg shadow-purple-500/10 hover:border-purple-500/70';

  return (
    <div
      className={`${baseClasses} ${highlighted ? highlightedClasses : normalClasses} ${className}`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-500/10 px-4 py-1.5 text-xs font-medium text-purple-400 border border-purple-500/20">
          {badge}
        </span>
      )}

      <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
      <p className="text-gray-400 text-sm mb-6">{description}</p>

      <div className="mb-6">
        {price ? (
          <span className="text-4xl font-bold text-white">{price}</span>
        ) : (
          <>
            <div className="text-sm font-mono text-purple-400 uppercase tracking-wide">{scope}</div>
            <div className="text-xs font-mono text-gray-500 mt-1">{complexity}</div>
          </>
        )}
      </div>

      {features.length > 0 && (
        <ul className="space-y-3 mb-8 flex-grow">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
              <svg
                className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto">
        <Button
          as="link"
          href={ctaHref}
          variant={highlighted ? 'primary' : 'ghost'}
          size="md"
          className={`w-full justify-center ${highlighted ? 'bg-purple-500 hover:bg-purple-400 text-white' : 'text-white hover:bg-white/10'}`}
        >
          {ctaText}
        </Button>
      </div>
    </div>
  );
}
