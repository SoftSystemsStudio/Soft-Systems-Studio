import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from './Button';

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  logo?: string;
  brand?: string;
  items?: NavItem[];
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

export default function Navbar({
  logo = '/images/S Logo - Black Blackground.png',
  brand = 'Soft Systems Studio',
  items = [],
  ctaLabel = 'Get Started',
  ctaHref = '/intake',
  className = '',
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = useCallback(() => setMobileOpen((prev) => !prev), []);

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md bg-gray-950/70 border-b border-white/5 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand with Logo */}
        <Link href="/" className="flex items-center gap-3">
          {logo && (
            <Image src={logo} alt={brand} width={36} height={36} className="h-9 w-9" priority />
          )}
          <span className="font-bold text-xl tracking-tight text-white hidden sm:block">
            {brand}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-gray-400 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded"
            >
              {item.label}
            </a>
          ))}
          <Button as="link" href={ctaHref} variant="primary" size="sm" className="ml-2">
            {ctaLabel}
          </Button>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          className="md:hidden p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded"
          onClick={toggleMobile}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="md:hidden bg-gray-900 border-t border-white/5 px-6 py-4 space-y-4">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block text-gray-300 hover:text-white transition"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <Button
            as="link"
            href={ctaHref}
            variant="primary"
            size="md"
            className="w-full justify-center"
          >
            {ctaLabel}
          </Button>
        </nav>
      )}
    </header>
  );
}
