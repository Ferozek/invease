'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

/**
 * Tooltip Component
 * Apple HIG: Subtle, contextual help that appears on hover/focus
 * - Accessible via keyboard (focus)
 * - Respects reduced motion
 * - Auto-positions to stay in viewport
 */
export default function Tooltip({
  content,
  children,
  position = 'top',
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Adjust position if tooltip would overflow viewport
  // Note: setState in effect is intentional here for dynamic positioning
  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltip = tooltipRef.current.getBoundingClientRect();
      const trigger = triggerRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      let newPosition = position;

      // Check if tooltip overflows and adjust
      if (position === 'top' && trigger.top - tooltip.height < 10) {
        newPosition = 'bottom';
      } else if (position === 'bottom' && trigger.bottom + tooltip.height > viewport.height - 10) {
        newPosition = 'top';
      } else if (position === 'left' && trigger.left - tooltip.width < 10) {
        newPosition = 'right';
      } else if (position === 'right' && trigger.right + tooltip.width > viewport.width - 10) {
        newPosition = 'left';
      }

      // Only update if position changed to avoid re-renders
      if (newPosition !== actualPosition) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActualPosition(newPosition);
      }
    }
  }, [isVisible, position, actualPosition]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--surface-card)] border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--surface-card)] border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--surface-card)] border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--surface-card)] border-y-transparent border-l-transparent',
  };

  return (
    <div
      ref={triggerRef}
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`absolute z-50 ${positionClasses[actualPosition]} pointer-events-none`}
        >
          <div className="relative px-3 py-2 text-sm text-[var(--text-primary)] bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-lg shadow-lg max-w-xs animate-in fade-in duration-150">
            {content}
            {/* Arrow */}
            <div
              className={`absolute w-0 h-0 border-4 ${arrowClasses[actualPosition]}`}
              aria-hidden="true"
            />
          </div>
        </div>
      )}
    </div>
  );
}
