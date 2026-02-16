'use client';

import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

/**
 * Apple-style progress dots
 * Subtle, minimal, and non-intrusive
 */
export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps}>
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <motion.div
          key={step}
          className={`rounded-full transition-colors ${
            step === currentStep
              ? 'w-2.5 h-2.5 bg-[var(--brand-blue)]'
              : step < currentStep
                ? 'w-2 h-2 bg-[var(--brand-blue)] opacity-60'
                : 'w-2 h-2 bg-slate-300'
          }`}
          initial={false}
          animate={{
            scale: step === currentStep ? 1 : 0.8,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          aria-label={`Step ${step} of ${totalSteps}${step === currentStep ? ' (current)' : step < currentStep ? ' (completed)' : ''}`}
        />
      ))}
    </div>
  );
}
