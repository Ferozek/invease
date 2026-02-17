/**
 * Company Store
 * Zustand store with localStorage persistence for company details
 * Persists across browser sessions so users don't have to re-enter details
 *
 * SECURITY NOTE: Bank details are only persisted if user explicitly opts in
 * via the "Remember my bank details" checkbox.
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

  // Bank details
  bankDetails: BankDetails;
  rememberBankDetails: boolean; // User opt-in to persist bank details locally

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
  setRememberBankDetails: (remember: boolean) => void;
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
  bankDetails: defaultBankDetails,
  rememberBankDetails: false,
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

      setRememberBankDetails: (remember) => set({ rememberBankDetails: remember }),

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
        rememberBankDetails: state.rememberBankDetails,
        // Only persist bank details if user explicitly opted in
        ...(state.rememberBankDetails && { bankDetails: state.bankDetails }),
      }),
      // Migration: Only keep bank details if user opted in
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) return;
          // Remove bank details from old data if user didn't opt in
          try {
            const stored = localStorage.getItem('invease-company-details');
            if (stored) {
              const parsed = JSON.parse(stored);
              // If rememberBankDetails is false/undefined but bankDetails exists, remove it
              if (parsed.state?.bankDetails && !parsed.state?.rememberBankDetails) {
                delete parsed.state.bankDetails;
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
