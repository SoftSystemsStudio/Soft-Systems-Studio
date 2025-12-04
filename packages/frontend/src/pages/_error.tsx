/**
 * Custom Error Page with Sentry Integration
 *
 * This page is shown when an error occurs during rendering.
 * It reports the error to Sentry and shows a user-friendly message.
 */

import * as Sentry from '@sentry/nextjs';
import type { NextPageContext } from 'next';
import NextErrorComponent from 'next/error';

interface ErrorProps {
  statusCode: number;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
}

/**
 * Custom error page that integrates with Sentry
 */
function CustomErrorPage({ statusCode }: ErrorProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          {statusCode || 'Error'}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          {statusCode === 404
            ? "The page you're looking for doesn't exist."
            : statusCode === 500
              ? 'Something went wrong on our end.'
              : 'An unexpected error occurred.'}
        </p>
        <div className="space-x-4">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </a>
          <button
            onClick={() => window.location.reload()}
            className="inline-block px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

CustomErrorPage.getInitialProps = async (context: NextPageContext) => {
  const errorInitialProps = await NextErrorComponent.getInitialProps(context);

  const { err, asPath } = context;

  // Workaround for https://github.com/vercel/next.js/issues/8592
  // Pages that don't have getStaticProps or getServerSideProps
  // don't get the full Error object passed to them
  if (err) {
    Sentry.captureException(err);
    await Sentry.flush(2000);
    return errorInitialProps;
  }

  // If this point is reached, getInitialProps was called without any
  // information about what the error might be. This is unexpected and may
  // indicate a bug introduced in Next.js, so record it in Sentry
  Sentry.captureException(new Error(`_error.tsx getInitialProps missing data at path: ${asPath}`));
  await Sentry.flush(2000);

  return {
    ...errorInitialProps,
    hasGetInitialPropsRun: true,
  };
};

export default CustomErrorPage;
