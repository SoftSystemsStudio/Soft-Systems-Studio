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
  logo = '/images/S Logo - Black Blackground.png',
  brand = 'Soft Systems Studio',
  links = [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
  className = '',
}: FooterProps) {
  return (
    <footer className={`border-t border-[#2a2a2a] py-10 bg-black ${className}`}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-[#656565]">
          {logo && <Image src={logo} alt={brand} width={28} height={28} className="h-7 w-7" />}
          <span>
            &copy; {new Date().getFullYear()} {brand}
          </span>
        </div>
        <div className="flex gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[#656565] hover:text-[#c0ff6b] text-sm transition focus:outline-none focus:ring-2 focus:ring-[#c0ff6b] rounded"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
