/**
 * useCompaniesHouseSearch Hook Unit Tests
 * Tests: search with debounce, abort controller, error handling,
 *        loading state, company selection, store sync
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCompaniesHouseSearch } from '@/hooks/useCompaniesHouseSearch';
import { useCompanyStore } from '@/stores/companyStore';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

// ===== Setup =====

function resetStore() {
  useCompanyStore.setState({
    companyName: '',
    companyNumber: '',
  });
}

function mockFetchSuccess(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

function mockFetchFailure() {
  return vi.fn().mockResolvedValue({
    ok: false,
    json: () => Promise.resolve({}),
  });
}

// Flush microtasks (promises) without fake timers interference
function flushPromises() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

beforeEach(() => {
  resetStore();
  vi.useFakeTimers();
  global.fetch = mockFetchSuccess({ items: [] });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useCompaniesHouseSearch', () => {
  describe('initial state', () => {
    it('starts with empty values', () => {
      const { result } = renderHook(() => useCompaniesHouseSearch());

      expect(result.current.companyName).toBe('');
      expect(result.current.companyNumber).toBe('');
      expect(result.current.companyHits).toEqual([]);
      expect(result.current.companyOpen).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('restores values from company store', () => {
      useCompanyStore.setState({
        companyName: 'Stored Co',
        companyNumber: 'SC123456',
      });

      const { result } = renderHook(() => useCompaniesHouseSearch());

      expect(result.current.companyName).toBe('Stored Co');
      expect(result.current.companyNumber).toBe('SC123456');
    });
  });

  describe('handleNameChange', () => {
    it('clears company number and meta on name change', () => {
      const { result } = renderHook(() => useCompaniesHouseSearch());

      act(() => {
        result.current.setCompanyNumber('12345678');
      });

      act(() => {
        result.current.handleNameChange('New name');
      });

      expect(result.current.companyNumber).toBe('');
    });

    it('does not search for queries shorter than 2 characters', async () => {
      const { result } = renderHook(() => useCompaniesHouseSearch());

      act(() => {
        result.current.handleNameChange('A');
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(result.current.companyHits).toEqual([]);
    });

    it('does not search for empty input', async () => {
      const { result } = renderHook(() => useCompaniesHouseSearch());

      act(() => {
        result.current.handleNameChange('');
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('debounces search by 300ms', async () => {
      global.fetch = mockFetchSuccess({
        items: [{ name: 'Test Ltd', number: '12345678' }],
      });

      const { result } = renderHook(() => useCompaniesHouseSearch());

      act(() => {
        result.current.handleNameChange('Test');
      });

      // Not called yet (debounce hasn't elapsed)
      expect(global.fetch).not.toHaveBeenCalled();

      // Advance past debounce (flushes promises too)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/company-search?q=Test'),
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });

    it('cancels previous debounce on rapid typing', async () => {
      global.fetch = mockFetchSuccess({
        items: [{ name: 'Testing Ltd', number: '12345678' }],
      });

      const { result } = renderHook(() => useCompaniesHouseSearch());

      act(() => {
        result.current.handleNameChange('Te');
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      act(() => {
        result.current.handleNameChange('Tes');
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      act(() => {
        result.current.handleNameChange('Test');
      });

      // Only after 300ms from last change should it fire
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      // Only one fetch call (for "Test", the final value)
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('q=Test'),
        expect.any(Object)
      );
    });

    it('sets companyHits and opens dropdown on results', async () => {
      const items = [
        { name: 'Alpha Ltd', number: '11111111' },
        { name: 'Beta Ltd', number: '22222222' },
      ];
      global.fetch = mockFetchSuccess({ items });

      const { result } = renderHook(() => useCompaniesHouseSearch());

      act(() => {
        result.current.handleNameChange('Test');
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      expect(result.current.companyHits).toHaveLength(2);
      expect(result.current.companyOpen).toBe(true);
    });
  });

  describe('chooseCompany', () => {
    it('sets name and number, closes dropdown, fetches details', async () => {
      global.fetch = mockFetchSuccess({
        items: [{ status: 'active', type: 'ltd', address: '1 High St' }],
      });

      const { result } = renderHook(() => useCompaniesHouseSearch());

      await act(async () => {
        await result.current.chooseCompany({
          name: 'Chosen Ltd',
          number: '12345678',
        });
      });

      expect(result.current.companyName).toBe('Chosen Ltd');
      expect(result.current.companyNumber).toBe('12345678');
      expect(result.current.companyOpen).toBe(false);
      expect(result.current.companyHits).toEqual([]);

      // Should have fetched company details
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/company-search?number=12345678')
      );
    });

    it('clears meta when choosing null', async () => {
      const { result } = renderHook(() => useCompaniesHouseSearch());

      await act(async () => {
        await result.current.chooseCompany(null);
      });

      expect(result.current.companyName).toBe('');
      expect(result.current.companyNumber).toBe('');
      expect(result.current.companyMeta).toEqual({});
    });
  });

  describe('clearSearch', () => {
    it('resets all state', () => {
      const { result } = renderHook(() => useCompaniesHouseSearch());

      act(() => {
        result.current.setCompanyName('Test');
        result.current.setCompanyNumber('12345678');
      });

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.companyName).toBe('');
      expect(result.current.companyNumber).toBe('');
      expect(result.current.companyHits).toEqual([]);
      expect(result.current.companyOpen).toBe(false);
      expect(result.current.companyMeta).toEqual({});
    });
  });

  describe('error handling', () => {
    it('clears hits on search failure', async () => {
      global.fetch = mockFetchFailure();

      const { result } = renderHook(() => useCompaniesHouseSearch());

      act(() => {
        result.current.handleNameChange('Test');
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      expect(result.current.companyHits).toEqual([]);
      expect(result.current.companyOpen).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('handles fetch rejection gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCompaniesHouseSearch());

      act(() => {
        result.current.handleNameChange('Test');
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      expect(result.current.companyHits).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
