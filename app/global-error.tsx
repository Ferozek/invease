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

  const handleReset = () => {
    // Clear the invoice draft so Zustand rehydrates cleanly
    try {
      sessionStorage.removeItem('invease-invoice-draft');
    } catch {
      // sessionStorage may not be available
    }
    reset();
  };

  return (
    <html lang="en">
      <body>
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <h2>Something went wrong</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            An unexpected error occurred. The error has been reported automatically.
          </p>
          <button
            onClick={handleReset}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#0b4f7a',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
