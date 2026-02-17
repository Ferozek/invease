'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StepIndicator from './StepIndicator';
import BusinessTypeStep from './BusinessTypeStep';
import IdentityStep, { isIdentityStepValid } from './IdentityStep';
import TaxComplianceStep, { isTaxComplianceStepValid } from './TaxComplianceStep';
import BankDetailsStep, { isBankDetailsStepValid } from './BankDetailsStep';
import ReviewStep from './ReviewStep';
import { useCompanyStore } from '@/stores/companyStore';
import type { BusinessType } from '@/types/invoice';

const TOTAL_STEPS = 5;

// Animation variants for step transitions
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

const stepTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

export default function OnboardingWizard() {
  const { businessType, setBusinessType, completeOnboarding } = useCompanyStore();

  // If businessType already exists (editing), skip step 1 and go straight to Identity
  const [step, setStep] = useState(() => businessType ? 2 : 1);
  const [direction, setDirection] = useState(0);
  // Pre-select the stored business type for edit flow (so Back shows current selection)
  const [selectedType, setSelectedType] = useState<BusinessType | null>(businessType);

  // Use stored business type if available (for returning users)
  const effectiveBusinessType = selectedType || businessType;

  const goToStep = useCallback((newStep: number) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  }, [step]);

  const handleNext = useCallback(() => {
    if (step === 1 && selectedType) {
      setBusinessType(selectedType);
    }
    goToStep(step + 1);
  }, [step, selectedType, setBusinessType, goToStep]);

  const handleBack = useCallback(() => {
    goToStep(step - 1);
  }, [step, goToStep]);

  const handleComplete = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  // Quick Start: Skip setup entirely with sensible defaults
  const handleQuickStart = useCallback(() => {
    // Set default business type (most common for small businesses)
    setBusinessType('sole_trader');
    // Mark as onboarded - user can edit details later
    completeOnboarding();
  }, [setBusinessType, completeOnboarding]);

  // Check if current step is valid
  const isCurrentStepValid = useCallback(() => {
    switch (step) {
      case 1:
        return selectedType !== null;
      case 2:
        return isIdentityStepValid();
      case 3:
        return isTaxComplianceStepValid();
      case 4:
        return isBankDetailsStepValid();
      case 5:
        return true; // Review step is always valid
      default:
        return false;
    }
  }, [step, selectedType]);

  // Get button text based on step
  const getNextButtonText = () => {
    switch (step) {
      case 3:
        return 'Continue';
      case 5:
        return 'Start Creating Invoices';
      default:
        return 'Continue';
    }
  };

  // Can skip step 3 (Tax & Compliance)
  const canSkip = step === 3;

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="text-center py-6 px-4">
        <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />
      </div>

      {/* Content - scrollable area */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-lg mx-auto px-4 pb-32">
          <Card variant="plain" className="p-6 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={stepTransition}
              >
                {step === 1 && (
                  <BusinessTypeStep
                    selected={selectedType}
                    onSelect={setSelectedType}
                    onNext={handleNext}
                    onQuickStart={handleQuickStart}
                  />
                )}
                {step === 2 && effectiveBusinessType && (
                  <IdentityStep businessType={effectiveBusinessType} />
                )}
                {step === 3 && (
                  <TaxComplianceStep />
                )}
                {step === 4 && (
                  <BankDetailsStep />
                )}
                {step === 5 && effectiveBusinessType && (
                  <ReviewStep
                    businessType={effectiveBusinessType}
                    onEditStep={goToStep}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </Card>

          {/* Privacy Note */}
          <p className="text-center text-xs text-[var(--text-muted)] mt-4 px-4">
            Your details are stored locally and never sent to any server.
          </p>
        </div>
      </div>

      {/* Sticky Bottom Navigation - Apple style */}
      {step > 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[var(--surface-card)]/95 backdrop-blur-sm border-t border-[var(--surface-border)] safe-area-bottom">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex-shrink-0"
            >
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
              Back
            </Button>

            <div className="flex-1 flex gap-2">
              {canSkip && (
                <Button
                  variant="muted"
                  className="flex-1"
                  onClick={handleNext}
                >
                  Skip
                </Button>
              )}

              <Button
                variant="primary"
                className="flex-1"
                disabled={!isCurrentStepValid()}
                onClick={step === 5 ? handleComplete : handleNext}
              >
                {getNextButtonText()}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
