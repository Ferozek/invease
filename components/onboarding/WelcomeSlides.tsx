'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
 * WelcomeSlides - Brief 2-slide intro following Google's "Top User Benefits" model
 * Auto-advances every 4 seconds, fully skippable
 */
export default function WelcomeSlides({ onComplete }: WelcomeSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance slides
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev >= slides.length - 1) {
          return prev; // Stay on last slide
        }
        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const handleGetStarted = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
    >
      <div className="max-w-md w-full text-center">
        {/* Header with theme toggle and skip */}
        <div className="flex justify-between items-center mb-8">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleSkip}
            className="cursor-pointer text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Slide content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-[var(--brand-blue-50)] flex items-center justify-center text-[var(--brand-blue)]">
              {slides[currentSlide].icon}
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
              {slides[currentSlide].title}
            </h1>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentSlide(index)}
              className={`cursor-pointer w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-6 bg-[var(--brand-blue)]'
                  : 'bg-[var(--surface-border)] hover:bg-[var(--text-muted)]'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
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
