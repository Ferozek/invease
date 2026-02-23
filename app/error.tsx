'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { useInvoiceStore } from '@/stores/invoiceStore';

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

  const handleReset = () => {
    // Reset invoice store to initial state so the app recovers
    try {
      useInvoiceStore.getState().resetInvoice();
    } catch {
      // If store is broken, clear sessionStorage and force reload
      sessionStorage.removeItem('invease-invoice-draft');
    }
    reset();
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Something went wrong
        </h2>
        <p className="text-[var(--text-secondary)] mb-6">
          An unexpected error occurred. Your saved company details and invoice history are safe.
        </p>
        <button
          onClick={handleReset}
          className="cursor-pointer px-6 py-3 min-h-[44px] bg-[var(--brand-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
