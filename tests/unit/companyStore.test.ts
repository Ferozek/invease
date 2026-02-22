/**
 * Company Store Unit Tests
 * Tests: onboarding flow, CIS status derivation,
 *        bank details security, reset logic
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useCompanyStore } from '@/stores/companyStore';

// ===== Tests =====

describe('companyStore', () => {
  beforeEach(() => {
    useCompanyStore.getState().clearAllDetails();
    localStorage.clear();
  });

  // ----- Onboarding Flow -----

  describe('onboarding', () => {
    it('starts with hasSeenWelcome=false and isOnboarded=false', () => {
      const state = useCompanyStore.getState();
      expect(state.hasSeenWelcome).toBe(false);
      expect(state.isOnboarded).toBe(false);
    });

    it('markWelcomeSeen sets both flags to true', () => {
      useCompanyStore.getState().markWelcomeSeen();
      const state = useCompanyStore.getState();
      expect(state.hasSeenWelcome).toBe(true);
      expect(state.isOnboarded).toBe(true);
    });

    it('setBusinessType stores business type', () => {
      useCompanyStore.getState().setBusinessType('limited_company');
      expect(useCompanyStore.getState().businessType).toBe('limited_company');
    });

    it('completeOnboarding sets isOnboarded=true', () => {
      useCompanyStore.getState().completeOnboarding();
      expect(useCompanyStore.getState().isOnboarded).toBe(true);
    });

    it('resetOnboarding goes back to wizard (keeps welcome seen)', () => {
      useCompanyStore.getState().markWelcomeSeen();
      useCompanyStore.getState().resetOnboarding();
      const state = useCompanyStore.getState();
      expect(state.hasSeenWelcome).toBe(true);
      expect(state.isOnboarded).toBe(false);
    });

    it('startOver resets everything including welcome', () => {
      useCompanyStore.getState().markWelcomeSeen();
      useCompanyStore.getState().setCompanyDetails({ companyName: 'TestCo' });
      useCompanyStore.getState().setBusinessType('sole_trader');
      useCompanyStore.getState().startOver();
      const state = useCompanyStore.getState();
      expect(state.hasSeenWelcome).toBe(false);
      expect(state.isOnboarded).toBe(false);
      expect(state.companyName).toBe('');
      expect(state.businessType).toBeNull();
    });
  });

  // ----- Company Details -----

  describe('company details', () => {
    it('setCompanyDetails partially updates fields', () => {
      useCompanyStore.getState().setCompanyDetails({
        companyName: 'K&R Accountants',
        postCode: 'SW1A 1AA',
      });
      const state = useCompanyStore.getState();
      expect(state.companyName).toBe('K&R Accountants');
      expect(state.postCode).toBe('SW1A 1AA');
      expect(state.address).toBe(''); // unchanged
    });

    it('setCompanyDetails supports all fields', () => {
      useCompanyStore.getState().setCompanyDetails({
        companyName: 'TestCo',
        companyNumber: '12345678',
        vatNumber: 'GB123456789',
        eoriNumber: 'GB123456789000',
        address: '1 Test Street',
        postCode: 'T1 1TT',
      });
      const state = useCompanyStore.getState();
      expect(state.companyNumber).toBe('12345678');
      expect(state.vatNumber).toBe('GB123456789');
      expect(state.eoriNumber).toBe('GB123456789000');
    });

    it('getInvoicerDetails returns all company fields', () => {
      useCompanyStore.getState().setCompanyDetails({
        companyName: 'Builder Ltd',
        vatNumber: 'GB999999999',
      });
      useCompanyStore.getState().setCisDetails({ cisStatus: 'standard', cisUtr: '1234567890' });

      const details = useCompanyStore.getState().getInvoicerDetails();
      expect(details.companyName).toBe('Builder Ltd');
      expect(details.vatNumber).toBe('GB999999999');
      expect(details.cisStatus).toBe('standard');
      expect(details.cisUtr).toBe('1234567890');
    });
  });

  // ----- CIS -----

  describe('CIS', () => {
    it('defaults to not_applicable', () => {
      expect(useCompanyStore.getState().cisStatus).toBe('not_applicable');
    });

    it('setCisDetails updates CIS status', () => {
      useCompanyStore.getState().setCisDetails({ cisStatus: 'standard' });
      expect(useCompanyStore.getState().cisStatus).toBe('standard');
    });

    it('setCisDetails updates UTR', () => {
      useCompanyStore.getState().setCisDetails({ cisUtr: '1234567890' });
      expect(useCompanyStore.getState().cisUtr).toBe('1234567890');
    });

    it('isCisSubcontractor returns false for not_applicable', () => {
      expect(useCompanyStore.getState().isCisSubcontractor()).toBe(false);
    });

    it('isCisSubcontractor returns true for standard', () => {
      useCompanyStore.getState().setCisDetails({ cisStatus: 'standard' });
      expect(useCompanyStore.getState().isCisSubcontractor()).toBe(true);
    });

    it('isCisSubcontractor returns true for unverified', () => {
      useCompanyStore.getState().setCisDetails({ cisStatus: 'unverified' });
      expect(useCompanyStore.getState().isCisSubcontractor()).toBe(true);
    });

    it('isCisSubcontractor returns true for gross_payment', () => {
      useCompanyStore.getState().setCisDetails({ cisStatus: 'gross_payment' });
      expect(useCompanyStore.getState().isCisSubcontractor()).toBe(true);
    });
  });

  // ----- Bank Details Security -----

  describe('bank details (security)', () => {
    it('starts with empty bank details', () => {
      const { bankDetails } = useCompanyStore.getState();
      expect(bankDetails.accountNumber).toBe('');
      expect(bankDetails.sortCode).toBe('');
    });

    it('setBankDetails updates in memory', () => {
      useCompanyStore.getState().setBankDetails({
        accountName: 'K&R Accountants',
        sortCode: '12-34-56',
        accountNumber: '12345678',
      });
      const { bankDetails } = useCompanyStore.getState();
      expect(bankDetails.accountName).toBe('K&R Accountants');
      expect(bankDetails.sortCode).toBe('12-34-56');
    });

    it('bank details are NOT persisted to localStorage', () => {
      useCompanyStore.getState().setCompanyDetails({ companyName: 'TestCo' });
      useCompanyStore.getState().setBankDetails({
        accountNumber: '99999999',
        sortCode: '99-99-99',
      });

      // Check what's actually in localStorage
      const stored = localStorage.getItem('invease-company-details');
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.bankDetails).toBeUndefined();
        expect(parsed.state.accountNumber).toBeUndefined();
      }
    });

    it('bank details reset to empty after startOver', () => {
      useCompanyStore.getState().setBankDetails({ accountNumber: '12345678' });
      useCompanyStore.getState().startOver();
      expect(useCompanyStore.getState().bankDetails.accountNumber).toBe('');
    });
  });

  // ----- Logo -----

  describe('logo', () => {
    it('starts with no logo', () => {
      expect(useCompanyStore.getState().logo).toBeNull();
      expect(useCompanyStore.getState().logoFileName).toBeNull();
    });

    it('setCompanyDetails can set logo', () => {
      useCompanyStore.getState().setCompanyDetails({
        logo: 'data:image/png;base64,abc123',
        logoFileName: 'logo.png',
      });
      expect(useCompanyStore.getState().logo).toBe('data:image/png;base64,abc123');
      expect(useCompanyStore.getState().logoFileName).toBe('logo.png');
    });
  });
});
