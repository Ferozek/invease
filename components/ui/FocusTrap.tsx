'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface FocusTrapProps {
  /** Content to trap focus within */
  children: ReactNode;
  /** Whether the trap is active */
  active?: boolean;
  /** Whether to restore focus to the previously focused element when deactivated */
  returnFocus?: boolean;
  /** Initial element to focus (selector or element) */
  initialFocus?: string | HTMLElement;
}

/**
 * FocusTrap - Traps keyboard focus within a container
 *
 * Features:
 * - Tab cycling within container bounds
 * - Stores previous focus on mount
 * - Restores focus on unmount (optional)
 * - Focuses first focusable element or specified initial focus
 * - Apple HIG & WCAG 2.1 AA compliant
 *
 * @example
 * <FocusTrap active={isModalOpen} returnFocus>
 *   <dialog>...</dialog>
 * </FocusTrap>
 */
export default function FocusTrap({
  children,
  active = true,
  returnFocus = true,
  initialFocus,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements within the container
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'button:not([disabled])',
        '[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');

      return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
    };

    // Focus the initial element or first focusable
    const focusInitial = () => {
      const focusables = getFocusableElements();
      if (focusables.length === 0) return;

      if (initialFocus) {
        const target =
          typeof initialFocus === 'string'
            ? container.querySelector<HTMLElement>(initialFocus)
            : initialFocus;
        if (target && focusables.includes(target)) {
          target.focus();
          return;
        }
      }

      // Default to first focusable element
      focusables[0].focus();
    };

    // Small delay to ensure DOM is ready
    requestAnimationFrame(focusInitial);

    // Handle Tab key for focus cycling
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusables = getFocusableElements();
      if (focusables.length === 0) return;

      const firstFocusable = focusables[0];
      const lastFocusable = focusables[focusables.length - 1];

      // Shift+Tab from first element -> go to last
      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
        return;
      }

      // Tab from last element -> go to first
      if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    // Prevent focus from escaping the container
    const handleFocusIn = (event: FocusEvent) => {
      if (!container.contains(event.target as Node)) {
        const focusables = getFocusableElements();
        if (focusables.length > 0) {
          focusables[0].focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);

      // Restore focus to the previously focused element
      if (returnFocus && previousActiveElement.current) {
        // Small delay to allow for exit animations
        setTimeout(() => {
          previousActiveElement.current?.focus();
        }, 0);
      }
    };
  }, [active, returnFocus, initialFocus]);

  return (
    <div ref={containerRef} style={{ display: 'contents' }}>
      {children}
    </div>
  );
}
