import React from 'react';

interface ToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  label?: string;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}

export default function Toggle({
  enabled,
  onToggle,
  label,
  leftLabel,
  rightLabel,
  className = '',
}: ToggleProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle(!enabled);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {leftLabel && (
        <span
          className={`text-sm transition-colors ${!enabled ? 'text-white font-medium' : 'text-gray-500'}`}
        >
          {leftLabel}
        </span>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label}
        onClick={() => onToggle(!enabled)}
        onKeyDown={handleKeyDown}
        className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
            enabled ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>

      {rightLabel && (
        <span
          className={`text-sm transition-colors ${enabled ? 'text-white font-medium' : 'text-gray-500'}`}
        >
          {rightLabel}
        </span>
      )}
    </div>
  );
}
