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

  // Variant styles — using design tokens from globals.css
  const variantStyles = {
    success: 'bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]',
    warning: 'bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)]',
    info: 'bg-[var(--brand-blue-50)] text-[var(--brand-blue)] dark:text-blue-300',
    neutral: 'bg-[var(--badge-neutral-bg)] text-[var(--badge-neutral-text)]',
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
