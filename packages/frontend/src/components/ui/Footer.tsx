import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  logo?: string;
  brand?: string;
  links?: FooterLink[];
  className?: string;
}

export default function Footer({
  logo = '/images/soft-systems-logo.png',
  brand = 'Soft Systems Studio',
  links = [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
  className = '',
}: FooterProps) {
  return (
    <footer className={`border-t border-white/10 py-10 bg-[#050505] ${className}`}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm text-gray-300 font-mono">
          {logo && (
            <Image
              src={logo}
              alt={brand}
              width={28}
              height={28}
              className="h-7 w-7 opacity-90"
              unoptimized
            />
          )}
          <span>
            &copy; {new Date().getFullYear()} Soft Systems Studio
            <span className="blink-cursor text-lime-400">_</span>
          </span>
        </div>
        <div className="flex gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-400 hover:text-lime-400 text-sm transition focus:outline-none focus:ring-2 focus:ring-lime-500 rounded"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
