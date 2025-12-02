import React from 'react';
import Button from './Button';

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features?: string[];
  ctaText?: string;
  ctaHref?: string;
  highlighted?: boolean;
  badge?: string;
  className?: string;
}

export default function PricingCard({
  name,
  price,
  description,
  features = [],
  ctaText = 'Get started',
  ctaHref = '/intake',
  highlighted = false,
  badge,
  className = '',
}: PricingCardProps) {
  const baseClasses =
    'relative flex flex-col p-8 rounded-2xl shadow-lg transition-all duration-300';
  const normalClasses =
    'border border-[#2a2a2a] bg-[#0a0a0a] shadow-black/20 hover:border-[#656565]';
  const highlightedClasses = 'border-2 border-[#c0ff6b] bg-[#0a0a0a] shadow-xl shadow-[#c0ff6b]/20';

  return (
    <div
      className={`${baseClasses} ${highlighted ? highlightedClasses : normalClasses} ${className}`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c0ff6b] text-black text-xs font-semibold px-3 py-1 rounded-full">
          {badge}
        </span>
      )}

      <h3 className="text-xl font-semibold text-[#d5d5d5] mb-2">{name}</h3>
      <p className="text-[#656565] text-sm mb-6">{description}</p>

      <div className="mb-6">
        <span className="text-4xl font-bold text-[#d5d5d5]">{price}</span>
      </div>

      {features.length > 0 && (
        <ul className="space-y-3 mb-8 flex-grow">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-[#d5d5d5]">
              <svg
                className="w-5 h-5 text-[#c0ff6b] flex-shrink-0 mt-0.5"
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
          className="w-full justify-center"
        >
          {ctaText}
        </Button>
      </div>
    </div>
  );
}
