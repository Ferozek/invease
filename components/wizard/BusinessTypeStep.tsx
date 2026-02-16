'use client';

import Button from '@/components/ui/Button';
import { BUSINESS_TYPE_OPTIONS } from '@/config/constants';
import type { BusinessType } from '@/types/invoice';

interface BusinessTypeStepProps {
  selected: BusinessType | null;
  onSelect: (type: BusinessType) => void;
  onNext: () => void;
}

export default function BusinessTypeStep({
  selected,
  onSelect,
  onNext,
}: BusinessTypeStepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-[var(--brand-blue)] mb-2">
        What type of business are you?
      </h2>
      <p className="text-[var(--text-secondary)] mb-6">
        This helps us show the right fields for your invoices.
      </p>

      <div className="space-y-3">
        {BUSINESS_TYPE_OPTIONS.map((type) => (
          <label
            key={type.value}
            className={`block p-4 border rounded-xl cursor-pointer transition-all ${
              selected === type.value
                ? 'border-[var(--brand-blue)] bg-[var(--brand-blue-50)] ring-2 ring-[var(--brand-blue)] ring-opacity-20'
                : 'border-[var(--surface-border)] hover:border-[var(--input-border-hover)] hover:bg-[var(--surface-elevated)]'
            }`}
          >
            <input
              type="radio"
              name="businessType"
              value={type.value}
              checked={selected === type.value}
              onChange={() => onSelect(type.value)}
              className="sr-only"
            />
            <span className="font-medium text-[var(--text-primary)]">{type.label}</span>
            <span className="block text-sm text-[var(--text-secondary)] mt-1">
              {type.description}
            </span>
          </label>
        ))}
      </div>

      <Button
        variant="primary"
        fullWidth
        className="mt-6"
        disabled={!selected}
        onClick={onNext}
      >
        Continue
      </Button>
    </div>
  );
}
