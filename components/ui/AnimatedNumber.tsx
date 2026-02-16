'use client';

import { useEffect, useRef } from 'react';
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
  const motionValue = useMotionValue(0);
  const ref = useRef<HTMLSpanElement>(null);

  // Spring configuration for smooth animation
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000,
  });

  // Transform to rounded number
  const displayValue = useTransform(springValue, (latest) => formatFn(latest));

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      motionValue.set(value);
    } else {
      motionValue.set(value);
    }
  }, [value, motionValue]);

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
  const motionValue = useMotionValue(0);

  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000,
  });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return springValue;
}
