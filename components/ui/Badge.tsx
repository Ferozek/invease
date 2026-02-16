/**
 * Badge Component
 * Status indicator with brand-consistent styling
 * Variants: success, warning, info, neutral
 * Supports dark mode
 */

'use client';

import { ReactNode } from 'react';

export interface BadgeProps {
  variant?: 'success' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
}

export default function Badge({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
}: BadgeProps) {
  // Base styles
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors';

  // Variant styles with dark mode support
  const variantStyles = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    info: 'bg-[var(--brand-blue-50)] text-[var(--brand-blue)] dark:bg-[var(--brand-blue-50)] dark:text-blue-300',
    neutral: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();

  return (
    <span className={combinedClassName}>
      {children}
    </span>
  );
}
