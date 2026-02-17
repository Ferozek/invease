'use client';

import { useEffect, useRef, useState } from 'react';
import { useSpring, useMotionValue, useTransform, motion } from 'framer-motion';

interface AnimatedNumberProps {
  /** The target number to animate to */
  value: number;
  /** Format function (e.g., for currency) */
  formatFn?: (value: number) => string;
  /** Duration in seconds */
  duration?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * AnimatedNumber - Smooth number transitions with spring physics
 *
 * Apple HIG principles:
 * - Smooth, natural-feeling animations
 * - Respects prefers-reduced-motion
 * - Spring physics for organic feel
 *
 * @example
 * <AnimatedNumber value={1234.56} formatFn={formatCurrency} />
 */
export default function AnimatedNumber({
  value,
  formatFn = (n) => n.toLocaleString(),
  duration = 0.8,
  className = '',
}: AnimatedNumberProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const motionValue = useMotionValue(value);
  const ref = useRef<HTMLSpanElement>(null);

  // Check reduced motion preference on mount
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Spring configuration for smooth animation
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    duration: prefersReducedMotion ? 0 : duration * 1000,
  });

  // Transform to formatted string
  const displayValue = useTransform(springValue, (latest) => formatFn(latest));

  useEffect(() => {
    if (prefersReducedMotion) {
      // Skip animation - jump directly to value
      motionValue.jump(value);
    } else {
      // Animate to new value
      motionValue.set(value);
    }
  }, [value, motionValue, prefersReducedMotion]);

  // For reduced motion, render plain span without motion
  if (prefersReducedMotion) {
    return (
      <span ref={ref} className={className}>
        {formatFn(value)}
      </span>
    );
  }

  return (
    <motion.span ref={ref} className={className}>
      {displayValue}
    </motion.span>
  );
}

/**
 * Hook for animated number values
 * Use this when you need more control over the animation
 */
export function useAnimatedNumber(value: number, duration = 0.8) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const motionValue = useMotionValue(0);

  // Detecting reduced motion preference - setState is intentional for initial setup
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    duration: prefersReducedMotion ? 0 : duration * 1000,
  });

  useEffect(() => {
    if (prefersReducedMotion) {
      motionValue.jump(value);
    } else {
      motionValue.set(value);
    }
  }, [value, motionValue, prefersReducedMotion]);

  return springValue;
}
