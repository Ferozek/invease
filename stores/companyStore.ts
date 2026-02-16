/**
 * Company Store
 * Zustand store with localStorage persistence for company details
 * Persists across browser sessions so users don't have to re-enter details
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InvoicerDetails, BankDetails, BusinessType, CisStatus } from '@/types/invoice';

interface CompanyState {
  // Onboarding & Business Type
  isOnboarded: boolean;
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

  // Actions - Onboarding
  setBusinessType: (type: BusinessType) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

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
};

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      ...defaultCompanyState,

      // Onboarding actions
      setBusinessType: (type) => set({ businessType: type }),

      completeOnboarding: () => set({ isOnboarded: true }),

      resetOnboarding: () => set({ isOnboarded: false }),

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
      partialize: (state) => ({
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
        bankDetails: state.bankDetails,
      }),
    }
  )
);
