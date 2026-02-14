'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Digital Products redirect page
 * Redirects to the homepage with the digital-products anchor
 */
export default function DigitalProductsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/#digital-products');
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400 mb-4" />
        <p className="text-gray-400">Redirecting to products...</p>
      </div>
    </div>
  );
}
