'use client';

import type { DocumentType } from '@/types/invoice';

interface DocumentTypeSelectorProps {
  documentType: DocumentType;
  onTypeChange: (type: DocumentType) => void;
}

export default function DocumentTypeSelector({ documentType, onTypeChange }: DocumentTypeSelectorProps) {
  return (
    <div
      className="flex items-center bg-[var(--surface-elevated)] rounded-xl p-1 w-fit"
      role="radiogroup"
      aria-label="Document type"
    >
      <button
        type="button"
        role="radio"
        aria-checked={documentType === 'invoice'}
        onClick={() => onTypeChange('invoice')}
        className={`cursor-pointer min-h-[44px] px-5 py-2 rounded-lg text-sm font-medium transition-all ${
          documentType === 'invoice'
            ? 'bg-[var(--brand-blue)] text-white shadow-sm'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
      >
        Invoice
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={documentType === 'credit_note'}
        onClick={() => onTypeChange('credit_note')}
        className={`cursor-pointer min-h-[44px] px-5 py-2 rounded-lg text-sm font-medium transition-all ${
          documentType === 'credit_note'
            ? 'bg-red-600 text-white shadow-sm'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
      >
        Credit Note
      </button>
    </div>
  );
}
