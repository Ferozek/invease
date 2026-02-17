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
  type NumberingConfig,
  incrementNumber,
  generateInvoiceNumber,
} from '@/lib/invoiceNumbering';
import { DEFAULT_TEMPLATE_ID } from '@/lib/templates/pdfTemplates';

// ===== Types =====

interface SettingsState {
  // PDF Template
  templateId: string;
  customPrimaryColor: string | null;

  // Invoice Numbering
  numbering: NumberingConfig;

  // Actions - Template
  setTemplateId: (id: string) => void;
  setCustomPrimaryColor: (color: string | null) => void;

  // Actions - Numbering
  setNumberingConfig: (config: Partial<NumberingConfig>) => void;
  getNextInvoiceNumber: () => string;
  consumeNextInvoiceNumber: () => string;
  resetNumberingSequence: () => void;
}

// ===== Store =====

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Defaults
      templateId: DEFAULT_TEMPLATE_ID,
      customPrimaryColor: null,
      numbering: DEFAULT_NUMBERING_CONFIG,

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
    }),
    {
      name: 'invease-settings',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

// ===== Selectors =====

export const selectTemplateId = (state: SettingsState) => state.templateId;
export const selectCustomColor = (state: SettingsState) => state.customPrimaryColor;
export const selectNumberingConfig = (state: SettingsState) => state.numbering;
