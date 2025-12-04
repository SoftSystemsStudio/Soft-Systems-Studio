/**
 * Sentry Test Page
 *
 * This page is for testing Sentry error reporting during development.
 * It provides buttons to trigger different types of errors.
 *
 * ⚠️ Remove or protect this page in production!
 */

import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';

export default function SentryTestPage() {
  const [sentError, setSentError] = useState<string | null>(null);

  const triggerClientError = () => {
    try {
      throw new Error('Test client-side error from Sentry test page');
    } catch (error) {
      const eventId = Sentry.captureException(error);
      setSentError(`Client error sent! Event ID: ${eventId}`);
    }
  };

  const triggerUnhandledError = () => {
    // This will be caught by the global error handler
    throw new Error('Unhandled client-side error from Sentry test page');
  };

  const triggerAsyncError = () => {
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Async error from Sentry test page'));
      }, 100);
    }).catch((error) => {
      const eventId = Sentry.captureException(error);
      setSentError(`Async error sent! Event ID: ${eventId}`);
    });
  };

  const triggerMessage = () => {
    const eventId = Sentry.captureMessage('Test message from Sentry test page', 'info');
    setSentError(`Message sent! Event ID: ${eventId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sentry Test Page</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Use these buttons to test Sentry error reporting.
          <br />
          <span className="text-yellow-600 dark:text-yellow-400 font-medium">
            ⚠️ Remove or protect this page in production!
          </span>
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={triggerClientError}
              className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Trigger Client Error
            </button>
            <button
              onClick={triggerAsyncError}
              className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Trigger Async Error
            </button>
            <button
              onClick={triggerMessage}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Test Message
            </button>
            <button
              onClick={triggerUnhandledError}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Trigger Unhandled Error
            </button>
          </div>

          {sentError && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-200 font-mono text-sm">{sentError}</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-2">
              Configuration Status
            </h2>
            <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <li>
                <strong>DSN:</strong>{' '}
                {process.env.NEXT_PUBLIC_SENTRY_DSN
                  ? '✅ Configured'
                  : '❌ Not set (NEXT_PUBLIC_SENTRY_DSN)'}
              </li>
              <li>
                <strong>Environment:</strong> {process.env.NODE_ENV}
              </li>
              <li>
                <strong>Enabled:</strong>{' '}
                {process.env.NODE_ENV === 'production' ? '✅ Yes' : '⚠️ No (development mode)'}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500 dark:text-gray-500">
          <p>
            Note: In development mode, Sentry events are logged to console but not sent to Sentry.
            Deploy to staging/production to test actual error reporting.
          </p>
        </div>
      </div>
    </div>
  );
}
