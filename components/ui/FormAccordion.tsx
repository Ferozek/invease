'use client';

import { ReactNode, useId } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * FormAccordion - Apple HIG progressive disclosure for multi-section forms
 *
 * Only one section is open at a time. Collapsed sections show a compact
 * summary with a completion indicator. Respects prefers-reduced-motion.
 *
 * Usage:
 * <FormAccordion activeSection={active} onToggle={toggle}>
 *   <FormAccordionSection id="customer" title="Customer Details" ...>
 *     <CustomerDetailsForm />
 *   </FormAccordionSection>
 * </FormAccordion>
 */

export interface FormAccordionProps {
  activeSection: string | null;
  onToggle: (id: string) => void;
  children: ReactNode;
  className?: string;
}

export default function FormAccordion({
  activeSection,
  onToggle,
  children,
  className = '',
}: FormAccordionProps) {
  return (
    <div className={`space-y-3 ${className}`} role="group" aria-label="Invoice form sections">
      {children}
    </div>
  );
}

// ─── Section ────────────────────────────────────────────────────────────────

export type SectionVariant = 'required' | 'optional';

export interface FormAccordionSectionProps {
  id: string;
  title: string;
  isOpen: boolean;
  isComplete: boolean;
  summary?: string;
  variant?: SectionVariant;
  onToggle: (id: string) => void;
  children: ReactNode;
  className?: string;
}

export function FormAccordionSection({
  id,
  title,
  isOpen,
  isComplete,
  summary,
  variant = 'required',
  onToggle,
  children,
  className = '',
}: FormAccordionSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const contentId = useId();
  const headingId = `${contentId}-heading`;

  const isOptional = variant === 'optional';

  return (
    <div
      className={`
        border rounded-xl overflow-hidden
        ${isOpen
          ? 'border-[var(--brand-blue)]/30 shadow-sm'
          : 'border-[var(--surface-border)]'
        }
        ${isOptional ? 'opacity-90' : ''}
        ${className}
      `}
    >
      {/* Section Header — always visible */}
      <button
        type="button"
        className={`
          w-full flex items-center gap-3 text-left cursor-pointer
          ${isOptional ? 'px-4 py-3' : 'px-5 py-4'}
          hover:bg-[var(--surface-elevated)] transition-colors
          ${isOpen ? 'bg-[var(--surface-card)]' : 'bg-[var(--surface-card)]'}
        `}
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        {/* Completion indicator */}
        <span className="flex-shrink-0" aria-hidden="true">
          {isComplete ? (
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30">
              <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
          ) : (
            <span className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${
              isOpen
                ? 'border-[var(--brand-blue)] bg-[var(--brand-blue-50)]'
                : 'border-[var(--surface-border)]'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                isOpen ? 'bg-[var(--brand-blue)]' : ''
              }`} />
            </span>
          )}
        </span>

        {/* Title + summary */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              id={headingId}
              className={`font-semibold text-[var(--text-primary)] ${
                isOptional ? 'text-sm' : 'text-base'
              }`}
            >
              {title}
            </h3>
            {isOptional && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                Optional
              </span>
            )}
          </div>
          {/* Collapsed summary */}
          {!isOpen && summary && (
            <p className="text-sm text-[var(--text-secondary)] mt-0.5 truncate">
              {summary}
            </p>
          )}
        </div>

        {/* Chevron */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-5 h-5 flex-shrink-0 text-[var(--text-muted)] ${
            prefersReducedMotion ? '' : 'transition-transform duration-200'
          } ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Expandable content area */}
      <div
        id={contentId}
        role="region"
        aria-labelledby={headingId}
        className={`${
          prefersReducedMotion ? '' : 'transition-all duration-300 ease-in-out'
        } ${
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className={`border-t border-[var(--surface-border)] ${isOptional ? 'px-4 pb-4' : 'px-5 pb-5'}`}>
          <div className={`${isOptional ? 'pt-4' : 'pt-5'}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
