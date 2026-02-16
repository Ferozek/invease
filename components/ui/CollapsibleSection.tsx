'use client';

import { useState } from 'react';

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

  return (
    <div className={`border border-[var(--surface-border)] rounded-lg overflow-hidden ${className}`}>
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-elevated)] transition-colors text-left cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex-1">
          <h4 className="font-medium text-[var(--text-primary)]">{title}</h4>
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
          className={`w-5 h-5 text-[var(--text-muted)] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {/* Animated content area */}
      <div
        className={`transition-all duration-200 ease-in-out ${
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
