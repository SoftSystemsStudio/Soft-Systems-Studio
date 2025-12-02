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
      className={`group bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 p-6 rounded-2xl shadow-xl shadow-black/30 transition-all duration-300 ${className}`}
    >
      {icon && (
        <div className="mb-4 text-indigo-400 group-hover:text-indigo-300 transition-colors">
          {icon}
        </div>
      )}
      <h3 className="font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
        {title}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
