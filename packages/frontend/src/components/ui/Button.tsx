import React from 'react';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface ButtonAsButton extends ButtonBaseProps {
  as?: 'button';
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  href?: never;
}

interface ButtonAsLink extends ButtonBaseProps {
  as: 'link';
  href: string;
  type?: never;
  onClick?: never;
}

interface ButtonAsAnchor extends ButtonBaseProps {
  as: 'anchor';
  href: string;
  type?: never;
  onClick?: never;
}

type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'py-2 px-4 text-sm',
  md: 'py-3 px-6 text-base',
  lg: 'py-4 px-10 text-lg',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#c0ff6b] text-black font-semibold shadow-lg shadow-[#c0ff6b]/30 hover:bg-[#d4ff8f] hover:shadow-[#c0ff6b]/50 focus:ring-2 focus:ring-[#c0ff6b] focus:ring-offset-2 focus:ring-offset-black',
  secondary:
    'bg-[#656565] text-[#d5d5d5] font-medium hover:bg-[#7a7a7a] focus:ring-2 focus:ring-[#656565] focus:ring-offset-2 focus:ring-offset-black',
  ghost:
    'border border-[#656565] text-[#d5d5d5] font-medium hover:border-[#c0ff6b] hover:text-[#c0ff6b] focus:ring-2 focus:ring-[#656565] focus:ring-offset-2 focus:ring-offset-black',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  if (props.as === 'link') {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  if (props.as === 'anchor') {
    return (
      <a href={props.href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={props.type ?? 'button'}
      onClick={props.onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
