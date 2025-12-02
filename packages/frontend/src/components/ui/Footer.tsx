import React from 'react';
import Link from 'next/link';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  brand?: string;
  links?: FooterLink[];
  className?: string;
}

export default function Footer({
  brand = 'Soft Systems Studio',
  links = [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
  className = '',
}: FooterProps) {
  return (
    <footer className={`border-t border-white/5 py-10 bg-gray-950 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {brand}
        </div>
        <div className="flex gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-500 hover:text-gray-300 text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
