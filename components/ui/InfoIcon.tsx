'use client';

import Tooltip from './Tooltip';

interface InfoIconProps {
  /** The help text to display */
  content: string;
  /** Optional link for "Learn more" */
  learnMoreUrl?: string;
  /** Size of the icon */
  size?: 'sm' | 'md';
}

/**
 * InfoIcon Component
 * Apple HIG: Contextual help icon that shows tooltip on hover/focus
 * Used next to complex form fields (CIS, VAT, EORI, etc.)
 */
export default function InfoIcon({
  content,
  learnMoreUrl,
  size = 'sm',
}: InfoIconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  const tooltipContent = (
    <div>
      <p>{content}</p>
      {learnMoreUrl && (
        <a
          href={learnMoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--brand-blue)] hover:underline text-xs mt-1 inline-block"
          onClick={(e) => e.stopPropagation()}
        >
          Learn more →
        </a>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltipContent}>
      <button
        type="button"
        className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-[var(--text-muted)] hover:text-[var(--brand-blue)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20 rounded-full"
        aria-label="More information"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={sizeClasses[size]}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
      </button>
    </Tooltip>
  );
}
