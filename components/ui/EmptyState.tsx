'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  /** Icon to display */
  icon?: ReactNode;
  /** Main title */
  title: string;
  /** Descriptive text */
  description?: string;
  /** Call to action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * EmptyState Component
 * Apple HIG: Friendly guidance when content is empty
 * - Subtle floating animation (respects reduced motion)
 * - Clear call to action
 * - Encouraging tone
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: 'py-6 px-4',
    md: 'py-10 px-6',
    lg: 'py-16 px-8',
  };

  const iconSizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  const titleSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizeClasses[size]}`}>
      {icon && (
        <motion.div
          className={`${iconSizeClasses[size]} text-[var(--text-muted)] mb-4`}
          animate={{ y: [0, -4, 0] }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: 'easeInOut',
          }}
          style={{ willChange: 'transform' }}
        >
          {icon}
        </motion.div>
      )}
      <h3 className={`font-medium text-[var(--text-primary)] ${titleSizeClasses[size]}`}>
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xs">
          {description}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 px-4 py-2 text-sm font-medium text-[var(--brand-blue)] hover:bg-[var(--brand-blue-50)] rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/**
 * Default icons for common empty states
 */
export const EmptyStateIcons = {
  invoice: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  lineItems: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  history: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  search: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
};
