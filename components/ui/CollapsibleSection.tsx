'use client';

import { useState, useId, useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribePrefersReducedMotion(callback: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * CollapsibleSection - Progressive disclosure component
 * Based on Apple HIG and Google Material Design principles
 * Hides complexity by default, reveals on user interaction
 */
export default function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  children,
  className = '',
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const prefersReducedMotion = useSyncExternalStore(
    subscribePrefersReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const contentId = useId();

  return (
    <div className={`border border-[var(--surface-border)] rounded-lg overflow-hidden ${className}`}>
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-elevated)] transition-colors text-left cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <div className="flex-1">
          <h4 id={`${contentId}-label`} className="font-medium text-[var(--text-primary)]">{title}</h4>
          {description && !isOpen && (
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">{description}</p>
          )}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-5 h-5 text-[var(--text-muted)] ${
            prefersReducedMotion ? '' : 'transition-transform duration-200'
          } ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {/* Animated content area - respects prefers-reduced-motion */}
      <div
        id={contentId}
        role="region"
        aria-labelledby={`${contentId}-label`}
        className={`${
          prefersReducedMotion ? '' : 'transition-all duration-200 ease-in-out'
        } ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-4 pb-4 border-t border-[var(--surface-border)]">
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
