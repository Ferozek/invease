'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface WelcomeSlidesProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: (
      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: 'Create professional invoices',
    description: 'Generate polished, UK-compliant invoices in seconds. VAT, CIS, and Companies House integration built-in.',
  },
  {
    icon: (
      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: 'Your data stays private',
    description: 'Works offline. Nothing is sent to any server. Your invoices stay on your device.',
  },
];

/**
 * WelcomeSlides - Apple HIG compliant onboarding
 *
 * Features:
 * - Swipe gestures (primary navigation)
 * - Tappable pagination dots (44px touch targets)
 * - Auto-advance (pauses on interaction)
 * - Reduced motion support
 */
export default function WelcomeSlides({ onComplete }: WelcomeSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0); // -1 = left, 1 = right
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Auto-advance slides
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev >= slides.length - 1) {
          return prev; // Stay on last slide
        }
        setDirection(1);
        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused, prefersReducedMotion]);

  // Handle swipe gestures
  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 50; // Minimum swipe distance
      const velocity = 0.5; // Minimum velocity

      if (Math.abs(info.velocity.x) >= velocity || Math.abs(info.offset.x) >= threshold) {
        if (info.offset.x > 0 && currentSlide > 0) {
          // Swipe right - go to previous
          setDirection(-1);
          setCurrentSlide(currentSlide - 1);
        } else if (info.offset.x < 0 && currentSlide < slides.length - 1) {
          // Swipe left - go to next
          setDirection(1);
          setCurrentSlide(currentSlide + 1);
        }
      }
    },
    [currentSlide]
  );

  const goToSlide = useCallback(
    (index: number) => {
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
      setIsPaused(true); // Pause auto-advance after manual navigation
    },
    [currentSlide]
  );

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const handleGetStarted = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // Slide animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-md w-full text-center">
        {/* Header with theme toggle and skip */}
        <div className="flex justify-between items-center mb-8">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleSkip}
            className="cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center
              text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Swipeable slide content */}
        <div className="relative h-[280px] touch-pan-y">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={prefersReducedMotion ? undefined : slideVariants}
              initial={prefersReducedMotion ? { opacity: 0 } : 'enter'}
              animate={prefersReducedMotion ? { opacity: 1 } : 'center'}
              exit={prefersReducedMotion ? { opacity: 0 } : 'exit'}
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-[var(--brand-blue-50)] flex items-center justify-center text-[var(--brand-blue)]">
                {slides[currentSlide].icon}
              </div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                {slides[currentSlide].title}
              </h1>
              <p className="text-[var(--text-secondary)] leading-relaxed px-4">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination dots - 44px touch targets (Apple HIG) */}
        <div className="flex justify-center gap-4 mb-8" role="tablist" aria-label="Slides">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`Slide ${index + 1} of ${slides.length}`}
              onClick={() => goToSlide(index)}
              className="cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <span
                className={`block rounded-full transition-all duration-200 ${
                  index === currentSlide
                    ? 'w-6 h-2 bg-[var(--brand-blue)]'
                    : 'w-2 h-2 bg-[var(--surface-border)]'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Get Started button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleGetStarted}
        >
          Get Started
        </Button>

        {/* Privacy note */}
        <p className="text-xs text-[var(--text-muted)] mt-4">
          Free forever. No account required.
        </p>
      </div>
    </div>
  );
}
