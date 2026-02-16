/**
 * Card Component
 * Reusable card with brand-consistent styling
 * Variants: accent (gradient border), plain (basic white card)
 * Supports dark mode via CSS variables
 */

'use client';

import { ReactNode } from 'react';

export interface CardProps {
  variant?: 'accent' | 'plain';
  hover?: boolean;
  className?: string;
  children: ReactNode;
}

export default function Card({
  variant = 'plain',
  hover = false,
  className = '',
  children,
}: CardProps) {
  // Variant styles using CSS classes from globals.css
  const variantStyles = {
    accent: 'card-accent',
    plain: 'card-plain',
  };

  // Hover effect
  const hoverStyles = hover
    ? 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1'
    : '';

  const combinedClassName = `${variantStyles[variant]} ${hoverStyles} ${className}`.trim();

  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );
}

/**
 * Card Header Component
 */
export function CardHeader({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-6 py-4 border-b border-[var(--surface-border)] ${className}`}>
      {children}
    </div>
  );
}

/**
 * Card Body Component
 */
export function CardBody({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Card Footer Component
 */
export function CardFooter({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-6 py-4 border-t border-[var(--surface-border)] bg-[var(--surface-elevated)] rounded-b-lg ${className}`}>
      {children}
    </div>
  );
}
