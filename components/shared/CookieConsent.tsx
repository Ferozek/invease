'use client';

import { useCallback, useEffect, useState } from 'react';

const CONSENT_KEY = 'invease-cookie-consent';

/**
 * Apple-style cookie consent banner
 * Shows once, stores consent in localStorage, non-blocking bottom banner
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if no consent stored
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Small delay for smooth entrance after page load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]
        animate-[slideUp_0.3s_ease-out]
        motion-reduce:animate-none"
    >
      <div
        className="mx-auto max-w-lg rounded-2xl bg-[var(--surface-card)] p-4
          shadow-[0_-2px_20px_rgba(0,0,0,0.1)]
          border border-[var(--surface-border)]"
      >
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          This app saves your details in your browser and uses analytics to improve the experience.
          Your data never leaves your device.{' '}
          <a
            href="/privacy"
            className="text-[var(--brand-blue)] underline underline-offset-2"
          >
            Privacy Policy
          </a>
        </p>
        <div className="mt-3 flex gap-3">
          <button
            onClick={handleAccept}
            className="flex-1 min-h-[44px] rounded-xl bg-[var(--cta-primary-bg)] text-white
              text-sm font-semibold
              hover:bg-[var(--cta-primary-hover)] active:scale-[0.98]
              transition-all duration-150"
          >
            OK
          </button>
          <a
            href="/privacy"
            className="flex-1 min-h-[44px] rounded-xl border border-[var(--cta-ghost-border)]
              text-[var(--brand-blue)] text-sm font-semibold
              flex items-center justify-center
              hover:bg-[var(--cta-muted-bg)] active:scale-[0.98]
              transition-all duration-150"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  );
}
