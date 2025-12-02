import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function FeatureCard({
  title,
  description,
  icon,
  className = '',
}: FeatureCardProps) {
  return (
    <div
      className={`group bg-[#0a0a0a] hover:bg-[#111111] border border-[#2a2a2a] p-6 rounded-2xl shadow-xl shadow-black/30 transition-all duration-300 hover:border-[#c0ff6b]/50 ${className}`}
    >
      {icon && (
        <div className="mb-4 text-[#c0ff6b] group-hover:text-[#d4ff8f] transition-colors">
          {icon}
        </div>
      )}
      <h3 className="font-semibold text-[#d5d5d5] mb-2 group-hover:text-[#c0ff6b] transition-colors">
        {title}
      </h3>
      <p className="text-[#656565] text-sm leading-relaxed">{description}</p>
    </div>
  );
}
