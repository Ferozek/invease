/**
 * Utility functions
 */

/**
 * Merge class names conditionally
 * Simple alternative to clsx/tailwind-merge for basic use cases
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
