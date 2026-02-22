/**
 * Settings Store Unit Tests
 * Tests: invoice numbering sequences, credit note numbering,
 *        consume/increment, pattern generation, reset
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from '@/stores/settingsStore';
import { DEFAULT_NUMBERING_CONFIG, DEFAULT_CN_NUMBERING_CONFIG, generateInvoiceNumber, incrementNumber, validatePattern, previewPattern, extractSequence } from '@/lib/invoiceNumbering';

// ===== Tests =====

describe('settingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      templateId: 'classic',
      customPrimaryColor: null,
      numbering: { ...DEFAULT_NUMBERING_CONFIG },
      cnNumbering: { ...DEFAULT_CN_NUMBERING_CONFIG },
    });
    localStorage.clear();
  });

  // ----- Invoice Numbering -----

  describe('invoice numbering', () => {
    it('getNextInvoiceNumber returns formatted number', () => {
      const next = useSettingsStore.getState().getNextInvoiceNumber();
      expect(next).toBe('INV-0001');
    });

    it('consumeNextInvoiceNumber returns and increments', () => {
      const store = useSettingsStore.getState();
      const first = store.consumeNextInvoiceNumber();
      expect(first).toBe('INV-0001');

      const second = useSettingsStore.getState().consumeNextInvoiceNumber();
      expect(second).toBe('INV-0002');

      const third = useSettingsStore.getState().consumeNextInvoiceNumber();
      expect(third).toBe('INV-0003');
    });

    it('sequence persists after multiple consumes', () => {
      const store = useSettingsStore.getState();
      for (let i = 0; i < 10; i++) {
        store.consumeNextInvoiceNumber();
      }
      const next = useSettingsStore.getState().getNextInvoiceNumber();
      expect(next).toBe('INV-0011');
    });

    it('resetNumberingSequence returns to start', () => {
      const store = useSettingsStore.getState();
      store.consumeNextInvoiceNumber();
      store.consumeNextInvoiceNumber();
      useSettingsStore.getState().resetNumberingSequence();
      const next = useSettingsStore.getState().getNextInvoiceNumber();
      expect(next).toBe('INV-0001');
    });

    it('setNumberingConfig updates pattern', () => {
      useSettingsStore.getState().setNumberingConfig({
        pattern: '{PREFIX}-{YEAR}-{SEQ:3}',
        prefix: 'ACME',
      });
      const next = useSettingsStore.getState().getNextInvoiceNumber();
      expect(next).toMatch(/^ACME-\d{4}-001$/);
    });
  });

  // ----- Credit Note Numbering -----

  describe('credit note numbering', () => {
    it('getNextCreditNoteNumber returns CN format', () => {
      const next = useSettingsStore.getState().getNextCreditNoteNumber();
      expect(next).toBe('CN-0001');
    });

    it('consumeNextCreditNoteNumber increments separately from invoices', () => {
      const store = useSettingsStore.getState();
      store.consumeNextInvoiceNumber(); // INV-0001
      store.consumeNextInvoiceNumber(); // INV-0002
      const cn = useSettingsStore.getState().consumeNextCreditNoteNumber();
      expect(cn).toBe('CN-0001'); // Independent sequence
    });

    it('resetCnNumberingSequence only resets CN numbers', () => {
      const store = useSettingsStore.getState();
      store.consumeNextInvoiceNumber(); // INV-0001
      store.consumeNextCreditNoteNumber(); // CN-0001
      store.consumeNextCreditNoteNumber(); // CN-0002
      useSettingsStore.getState().resetCnNumberingSequence();

      expect(useSettingsStore.getState().getNextCreditNoteNumber()).toBe('CN-0001');
      expect(useSettingsStore.getState().getNextInvoiceNumber()).toBe('INV-0002');
    });
  });

  // ----- Template & Color -----

  describe('template and color', () => {
    it('setTemplateId updates template', () => {
      useSettingsStore.getState().setTemplateId('modern');
      expect(useSettingsStore.getState().templateId).toBe('modern');
    });

    it('setCustomPrimaryColor stores color', () => {
      useSettingsStore.getState().setCustomPrimaryColor('#FF5733');
      expect(useSettingsStore.getState().customPrimaryColor).toBe('#FF5733');
    });

    it('setCustomPrimaryColor can be cleared to null', () => {
      useSettingsStore.getState().setCustomPrimaryColor('#FF5733');
      useSettingsStore.getState().setCustomPrimaryColor(null);
      expect(useSettingsStore.getState().customPrimaryColor).toBeNull();
    });
  });
});

// ===== Pure function tests (invoiceNumbering.ts) =====

describe('invoiceNumbering — pure functions', () => {
  describe('generateInvoiceNumber', () => {
    it('simple pattern: INV-{SEQ:4}', () => {
      const result = generateInvoiceNumber({
        ...DEFAULT_NUMBERING_CONFIG,
        currentNumber: 42,
      });
      expect(result).toBe('INV-0042');
    });

    it('yearly pattern with date tokens', () => {
      const config = {
        ...DEFAULT_NUMBERING_CONFIG,
        pattern: 'INV-{YEAR}-{SEQ:3}',
      };
      const result = generateInvoiceNumber(config, new Date('2026-06-15'));
      expect(result).toBe('INV-2026-001');
    });

    it('monthly pattern with all tokens', () => {
      const config = {
        ...DEFAULT_NUMBERING_CONFIG,
        pattern: '{PREFIX}/{YEAR}/{MONTH}/{SEQ:3}',
        prefix: 'SALE',
      };
      const result = generateInvoiceNumber(config, new Date('2026-03-10'));
      expect(result).toBe('SALE/2026/03/001');
    });

    it('compact pattern with YY', () => {
      const config = {
        ...DEFAULT_NUMBERING_CONFIG,
        pattern: '{PREFIX}{YY}{MONTH}{SEQ:3}',
        prefix: 'INV',
        currentNumber: 5,
      };
      const result = generateInvoiceNumber(config, new Date('2026-11-01'));
      expect(result).toBe('INV2611005');
    });

    it('unpadded SEQ', () => {
      const config = {
        ...DEFAULT_NUMBERING_CONFIG,
        pattern: '{PREFIX}-{SEQ}',
        currentNumber: 123,
      };
      const result = generateInvoiceNumber(config);
      expect(result).toBe('INV-123');
    });

    it('yearly reset resets sequence when year changes', () => {
      const config = {
        ...DEFAULT_NUMBERING_CONFIG,
        resetYearly: true,
        lastResetYear: 2025,
        currentNumber: 50,
        startNumber: 1,
      };
      const result = generateInvoiceNumber(config, new Date('2026-01-01'));
      expect(result).toBe('INV-0001'); // Reset to start
    });

    it('no reset when same year', () => {
      const config = {
        ...DEFAULT_NUMBERING_CONFIG,
        resetYearly: true,
        lastResetYear: 2026,
        currentNumber: 50,
      };
      const result = generateInvoiceNumber(config, new Date('2026-06-01'));
      expect(result).toBe('INV-0050');
    });
  });

  describe('incrementNumber', () => {
    it('increments currentNumber by 1', () => {
      const result = incrementNumber({ ...DEFAULT_NUMBERING_CONFIG, currentNumber: 5 });
      expect(result.currentNumber).toBe(6);
    });

    it('resets on year change when resetYearly is true', () => {
      const config = {
        ...DEFAULT_NUMBERING_CONFIG,
        resetYearly: true,
        lastResetYear: 2025,
        startNumber: 1,
        currentNumber: 99,
      };
      const result = incrementNumber(config);
      // Should reset to startNumber + 1 (because we're incrementing after generation)
      expect(result.currentNumber).toBe(2);
      expect(result.lastResetYear).toBe(new Date().getFullYear());
    });
  });

  describe('validatePattern', () => {
    it('valid pattern with SEQ', () => {
      expect(validatePattern('INV-{SEQ:4}').valid).toBe(true);
    });

    it('valid pattern with all tokens', () => {
      expect(validatePattern('{PREFIX}-{YEAR}-{MONTH}-{SEQ:3}').valid).toBe(true);
    });

    it('invalid: empty pattern', () => {
      const result = validatePattern('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('invalid: missing SEQ', () => {
      const result = validatePattern('INV-{YEAR}');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('SEQ');
    });

    it('invalid: unknown token', () => {
      const result = validatePattern('INV-{UNKNOWN}-{SEQ}');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('invalid');
    });
  });

  describe('previewPattern', () => {
    it('generates sequential preview numbers', () => {
      const previews = previewPattern('INV-{SEQ:4}', 'INV', 3);
      expect(previews).toEqual(['INV-0001', 'INV-0002', 'INV-0003']);
    });
  });

  describe('extractSequence', () => {
    it('extracts trailing number', () => {
      expect(extractSequence('INV-0042')).toBe(42);
    });

    it('extracts from complex pattern', () => {
      expect(extractSequence('ACME/2026/03/007')).toBe(7);
    });

    it('returns null for no number', () => {
      expect(extractSequence('DRAFT')).toBeNull();
    });
  });
});
