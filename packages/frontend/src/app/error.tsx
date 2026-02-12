'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white px-4">
      <h1 className="text-6xl font-bold mb-4">Error</h1>
      <p className="text-xl text-gray-400 mb-8">Something went wrong.</p>
      <div className="flex gap-4">
        <a
          href="/"
          className="px-6 py-3 bg-lime-400 text-black font-semibold rounded-lg hover:bg-lime-300 transition-colors"
        >
          Go Home
        </a>
        <button
          onClick={reset}
          className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
