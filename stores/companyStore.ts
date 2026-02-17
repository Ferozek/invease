/**
 * Company Store
 * Zustand store with localStorage persistence for company details
 * Persists across browser sessions so users don't have to re-enter details
 *
 * SECURITY: Bank details are NEVER persisted to localStorage.
 * They exist only in memory and must be re-entered each session.
 * This protects against XSS attacks that could steal banking information.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InvoicerDetails, BankDetails, BusinessType, CisStatus } from '@/types/invoice';

interface CompanyState {
  // Onboarding & Business Type
  hasSeenWelcome: boolean; // Has seen the welcome slides
  isOnboarded: boolean; // Ready to use the app (after welcome)
  businessType: BusinessType | null;

  // Invoicer details
  logo: string | null;
  logoFileName: string | null;
  companyName: string;
  companyNumber: string;
  vatNumber: string;
  eoriNumber: string;
  address: string;
  postCode: string;

  // CIS (Construction Industry Scheme) details
  cisStatus: CisStatus;
  cisUtr: string; // 10-digit Unique Taxpayer Reference

  // Bank details (memory only - never persisted for security)
  bankDetails: BankDetails;

  // Actions - Onboarding
  markWelcomeSeen: () => void;
  setBusinessType: (type: BusinessType) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void; // Just go back to wizard to edit
  startOver: () => void; // Full reset including welcome

  // Actions - Company Details
  setCompanyDetails: (details: Partial<InvoicerDetails>) => void;
  setCisDetails: (details: { cisStatus?: CisStatus; cisUtr?: string }) => void;
  setBankDetails: (details: Partial<BankDetails>) => void;
  clearAllDetails: () => void;

  // Helpers
  getInvoicerDetails: () => InvoicerDetails;
  isCisSubcontractor: () => boolean;
}

const defaultBankDetails: BankDetails = {
  accountNumber: '',
  sortCode: '',
  accountName: '',
  bankName: '',
  reference: '',
};

const defaultCompanyState = {
  hasSeenWelcome: false,
  isOnboarded: false,
  businessType: null as BusinessType | null,
  logo: null as string | null,
  logoFileName: null as string | null,
  companyName: '',
  companyNumber: '',
  vatNumber: '',
  eoriNumber: '',
  address: '',
  postCode: '',
  // CIS defaults
  cisStatus: 'not_applicable' as CisStatus,
  cisUtr: '',
  // Bank details in memory only (never persisted)
  bankDetails: defaultBankDetails,
};

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      ...defaultCompanyState,

      // Onboarding actions
      markWelcomeSeen: () => set({ hasSeenWelcome: true, isOnboarded: true }),

      setBusinessType: (type) => set({ businessType: type }),

      completeOnboarding: () => set({ isOnboarded: true }),

      // Go back to wizard to edit details (keeps welcome seen)
      resetOnboarding: () => set({ isOnboarded: false }),

      // Full reset - starts from welcome slides
      startOver: () => set({ ...defaultCompanyState }),

      // Company details actions
      setCompanyDetails: (details) => set((state) => ({
        ...state,
        ...details,
      })),

      setCisDetails: (details) => set((state) => ({
        ...state,
        ...(details.cisStatus !== undefined && { cisStatus: details.cisStatus }),
        ...(details.cisUtr !== undefined && { cisUtr: details.cisUtr }),
      })),

      setBankDetails: (details) => set((state) => ({
        bankDetails: { ...state.bankDetails, ...details },
      })),

      clearAllDetails: () => set(defaultCompanyState),

      getInvoicerDetails: () => {
        const state = get();
        return {
          logo: state.logo,
          logoFileName: state.logoFileName,
          companyName: state.companyName,
          companyNumber: state.companyNumber,
          vatNumber: state.vatNumber,
          eoriNumber: state.eoriNumber,
          address: state.address,
          postCode: state.postCode,
          cisStatus: state.cisStatus,
          cisUtr: state.cisUtr,
        };
      },

      isCisSubcontractor: () => {
        const state = get();
        return state.cisStatus !== 'not_applicable';
      },
    }),
    {
      name: 'invease-company-details',
      // SECURITY: Bank details are intentionally excluded - never persisted
      partialize: (state) => ({
        hasSeenWelcome: state.hasSeenWelcome,
        isOnboarded: state.isOnboarded,
        businessType: state.businessType,
        logo: state.logo,
        logoFileName: state.logoFileName,
        companyName: state.companyName,
        companyNumber: state.companyNumber,
        vatNumber: state.vatNumber,
        eoriNumber: state.eoriNumber,
        address: state.address,
        postCode: state.postCode,
        cisStatus: state.cisStatus,
        cisUtr: state.cisUtr,
        // Note: bankDetails intentionally omitted for security
      }),
      // Migration: Remove any previously saved bank details
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) return;
          // Clean up any bank details from old versions
          try {
            const stored = localStorage.getItem('invease-company-details');
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed.state?.bankDetails || parsed.state?.rememberBankDetails !== undefined) {
                delete parsed.state.bankDetails;
                delete parsed.state.rememberBankDetails;
                localStorage.setItem('invease-company-details', JSON.stringify(parsed));
              }
            }
          } catch {
            // Ignore migration errors
          }
        };
      },
    }
  )
);
