/**
 * Settings Store
 * User preferences for invoice generation
 *
 * Persisted to localStorage
 * Separate from company details (business info vs preferences)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  DEFAULT_NUMBERING_CONFIG,
  DEFAULT_CN_NUMBERING_CONFIG,
  type NumberingConfig,
  incrementNumber,
  generateInvoiceNumber,
} from '@/lib/invoiceNumbering';
import { DEFAULT_TEMPLATE_ID } from '@/lib/templates/pdfTemplates';
import type { VatRate } from '@/types/invoice';

// ===== Types =====

interface SettingsState {
  // PDF Template
  templateId: string;
  customPrimaryColor: string | null;

  // Invoice Numbering
  numbering: NumberingConfig;

  // Credit Note Numbering (separate sequence)
  cnNumbering: NumberingConfig;

  // Invoice Defaults (applied when creating a new invoice)
  defaultPaymentTerms: string;
  defaultVatRate: VatRate;
  defaultNotes: string;

  // Actions - Template
  setTemplateId: (id: string) => void;
  setCustomPrimaryColor: (color: string | null) => void;

  // Actions - Numbering
  setNumberingConfig: (config: Partial<NumberingConfig>) => void;
  getNextInvoiceNumber: () => string;
  consumeNextInvoiceNumber: () => string;
  resetNumberingSequence: () => void;

  // Actions - CN Numbering
  setCnNumberingConfig: (config: Partial<NumberingConfig>) => void;
  getNextCreditNoteNumber: () => string;
  consumeNextCreditNoteNumber: () => string;
  resetCnNumberingSequence: () => void;

  // Actions - Invoice Defaults
  setDefaultPaymentTerms: (terms: string) => void;
  setDefaultVatRate: (rate: VatRate) => void;
  setDefaultNotes: (notes: string) => void;
}

// ===== Store =====

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Defaults
      templateId: DEFAULT_TEMPLATE_ID,
      customPrimaryColor: null,
      numbering: DEFAULT_NUMBERING_CONFIG,
      cnNumbering: DEFAULT_CN_NUMBERING_CONFIG,
      defaultPaymentTerms: '30',
      defaultVatRate: '20' as VatRate,
      defaultNotes: '',

      // Template Actions
      setTemplateId: (id) => set({ templateId: id }),

      setCustomPrimaryColor: (color) => set({ customPrimaryColor: color }),

      // Numbering Actions
      setNumberingConfig: (config) =>
        set((state) => ({
          numbering: { ...state.numbering, ...config },
        })),

      getNextInvoiceNumber: () => {
        const { numbering } = get();
        return generateInvoiceNumber(numbering);
      },

      consumeNextInvoiceNumber: () => {
        const { numbering } = get();
        const number = generateInvoiceNumber(numbering);
        // Increment for next use
        set({ numbering: incrementNumber(numbering) });
        return number;
      },

      resetNumberingSequence: () =>
        set((state) => ({
          numbering: {
            ...state.numbering,
            currentNumber: state.numbering.startNumber,
            lastResetYear: new Date().getFullYear(),
          },
        })),

      // CN Numbering Actions
      setCnNumberingConfig: (config) =>
        set((state) => ({
          cnNumbering: { ...state.cnNumbering, ...config },
        })),

      getNextCreditNoteNumber: () => {
        const { cnNumbering } = get();
        return generateInvoiceNumber(cnNumbering);
      },

      consumeNextCreditNoteNumber: () => {
        const { cnNumbering } = get();
        const number = generateInvoiceNumber(cnNumbering);
        set({ cnNumbering: incrementNumber(cnNumbering) });
        return number;
      },

      resetCnNumberingSequence: () =>
        set((state) => ({
          cnNumbering: {
            ...state.cnNumbering,
            currentNumber: state.cnNumbering.startNumber,
            lastResetYear: new Date().getFullYear(),
          },
        })),

      // Invoice Defaults Actions
      setDefaultPaymentTerms: (terms) => set({ defaultPaymentTerms: terms }),
      setDefaultVatRate: (rate) => set({ defaultVatRate: rate }),
      setDefaultNotes: (notes) => set({ defaultNotes: notes }),
    }),
    {
      name: 'invease-settings',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as Record<string, unknown>;
        if (version < 2) {
          // Add invoice defaults for existing users
          state.defaultPaymentTerms = state.defaultPaymentTerms ?? '30';
          state.defaultVatRate = state.defaultVatRate ?? '20';
          state.defaultNotes = state.defaultNotes ?? '';
        }
        return state as unknown as SettingsState;
      },
    }
  )
);

// ===== Selectors =====

export const selectTemplateId = (state: SettingsState) => state.templateId;
export const selectCustomColor = (state: SettingsState) => state.customPrimaryColor;
export const selectNumberingConfig = (state: SettingsState) => state.numbering;
export const selectCnNumberingConfig = (state: SettingsState) => state.cnNumbering;
export const selectDefaultPaymentTerms = (state: SettingsState) => state.defaultPaymentTerms;
export const selectDefaultVatRate = (state: SettingsState) => state.defaultVatRate;
export const selectDefaultNotes = (state: SettingsState) => state.defaultNotes;
