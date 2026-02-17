'use client';

import Link from 'next/link';
import { siteConfig } from '@/config/site';

/**
 * Footer Component
 *
 * Provides legal links and branding.
 * Apple HIG: Consistent placement, adequate touch targets (44px).
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="mt-auto border-t border-[var(--border-secondary)] bg-[var(--bg-primary)]"
      role="contentinfo"
    >
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6">
        {/* Legal Links */}
        <nav
          aria-label="Legal"
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4"
        >
          <Link
            href="/privacy"
            className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)]
              min-h-[44px] flex items-center transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)]
              min-h-[44px] flex items-center transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/accessibility"
            className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)]
              min-h-[44px] flex items-center transition-colors"
          >
            Accessibility
          </Link>
        </nav>

        {/* Copyright & Attribution */}
        <div className="text-center text-xs text-[var(--text-tertiary)]">
          <p>
            &copy; {currentYear} {siteConfig.name}. A service by{' '}
            <a
              href={siteConfig.support.website}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[var(--text-primary)] transition-colors"
            >
              K&R Accountants
            </a>
          </p>
          <p className="mt-1">
            Made with care for UK small businesses
          </p>
        </div>
      </div>
    </footer>
  );
}
