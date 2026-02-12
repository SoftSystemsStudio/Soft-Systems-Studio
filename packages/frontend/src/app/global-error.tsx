'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
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
    <html lang="en">
      <body className="bg-[#050505] text-white">
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <h1 className="text-6xl font-bold mb-4">Error</h1>
          <p className="text-xl text-gray-400 mb-8">Something went wrong.</p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-lime-400 text-black font-semibold rounded-lg hover:bg-lime-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
