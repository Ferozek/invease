'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  /** Additional CSS classes */
  className?: string;
  /** Width (default: full) */
  width?: string | number;
  /** Height (default: 1rem) */
  height?: string | number;
  /** Border radius variant */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Animation style */
  animation?: 'pulse' | 'none';
}

/**
 * Skeleton - Loading placeholder component
 *
 * Follows Apple/Google design principles:
 * - Subtle pulse animation (not jarring)
 * - Matches content shape (prevents layout shift)
 * - Respects dark mode
 */
export default function Skeleton({
  className,
  width,
  height = '1rem',
  variant = 'text',
  animation = 'pulse',
}: SkeletonProps) {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    none: '',
  };

  return (
    <div
      className={cn(
        'bg-[var(--surface-elevated)]',
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      role="status"
      aria-label="Loading..."
    />
  );
}

/**
 * SkeletonText - Multiple lines of skeleton text
 */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="0.875rem"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard - Card-shaped loading placeholder
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'p-6 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)]',
        className
      )}
    >
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton height="1rem" width="60%" />
          <Skeleton height="0.75rem" width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

/**
 * SkeletonButton - Button-shaped loading placeholder
 */
export function SkeletonButton({
  fullWidth = false,
  className,
}: {
  fullWidth?: boolean;
  className?: string;
}) {
  return (
    <Skeleton
      variant="rounded"
      height={44}
      width={fullWidth ? '100%' : 120}
      className={className}
    />
  );
}

/**
 * SkeletonInput - Form input loading placeholder
 */
export function SkeletonInput({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Skeleton height="0.875rem" width="30%" />
      <Skeleton variant="rounded" height={44} width="100%" />
    </div>
  );
}
