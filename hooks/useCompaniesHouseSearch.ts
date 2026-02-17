'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useCompanyStore } from '@/stores/companyStore';

// Companies House search configuration
const COMPANIES_HOUSE = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_MS: 300,
};

export type CompanyItem = {
  name: string;
  number: string;
  status?: string;
  address?: string;
};

export type CompanyMeta = {
  status?: string;
  type?: string;
  incorporationDate?: string;
  address?: string;
};

/**
 * Hook for searching Companies House data
 * Provides autocomplete and lookup functionality for UK companies
 * Syncs with companyStore to restore state on page load
 */
export function useCompaniesHouseSearch() {
  // Get initial values from store to restore state on page load
  const { companyName: storedName, companyNumber: storedNumber } = useCompanyStore();

  const [companyName, setCompanyName] = useState<string>(storedName || '');
  const [companyNumber, setCompanyNumber] = useState<string>(storedNumber || '');
  const [companyHits, setCompanyHits] = useState<CompanyItem[]>([]);
  const [companyOpen, setCompanyOpen] = useState<boolean>(false);
  const [companyMeta, setCompanyMeta] = useState<CompanyMeta>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync with store when it rehydrates (for SSR/hydration)
  useEffect(() => {
    if (storedName && !companyName) {
      setCompanyName(storedName);
    }
    if (storedNumber && !companyNumber) {
      setCompanyNumber(storedNumber);
    }
  }, [storedName, storedNumber, companyName, companyNumber]);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCompanyDetails = useCallback(async (number: string) => {
    if (!number) return;

    try {
      const res = await fetch(`/api/company-search?number=${encodeURIComponent(number)}`);
      if (!res.ok) throw new Error('Lookup failed');
      const data = await res.json();
      const item = Array.isArray(data.items) && data.items[0] ? data.items[0] : {};
      setCompanyMeta(item);
    } catch (error) {
      console.warn('[invease] Company lookup failed', error);
      toast.error('Company lookup failed', {
        description: 'Could not fetch company details. You can enter them manually.',
      });
      setCompanyMeta({});
    }
  }, []);

  const performSearch = useCallback(async (query: string) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);

    try {
      const res = await fetch(`/api/company-search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      const items = Array.isArray(data.items) ? data.items : [];
      setCompanyHits(items);
      setCompanyOpen(items.length > 0);
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.warn('[invease] Company search failed', error);
        toast.error('Search unavailable', {
          description: 'Companies House search is temporarily unavailable.',
        });
      }
      setCompanyHits([]);
      setCompanyOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNameChange = useCallback(
    (value: string) => {
      setCompanyName(value);
      setCompanyNumber('');
      setCompanyMeta({});

      const trimmed = value.trim();
      if (!trimmed || trimmed.length < COMPANIES_HOUSE.MIN_QUERY_LENGTH) {
        setCompanyHits([]);
        setCompanyOpen(false);
        return;
      }

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        performSearch(trimmed);
      }, COMPANIES_HOUSE.DEBOUNCE_MS);
    },
    [performSearch]
  );

  const chooseCompany = useCallback(
    async (item: CompanyItem | null | undefined) => {
      setCompanyName(item?.name ?? '');
      setCompanyNumber(item?.number ?? '');
      setCompanyOpen(false);
      setCompanyHits([]);

      if (item?.number) {
        await fetchCompanyDetails(item.number);
      } else {
        setCompanyMeta({});
      }
    },
    [fetchCompanyDetails]
  );

  const clearSearch = useCallback(() => {
    setCompanyName('');
    setCompanyNumber('');
    setCompanyHits([]);
    setCompanyOpen(false);
    setCompanyMeta({});
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    companyName,
    setCompanyName,
    companyNumber,
    setCompanyNumber,
    companyHits,
    companyOpen,
    setCompanyOpen,
    companyMeta,
    isLoading,
    handleNameChange,
    chooseCompany,
    clearSearch,
  };
}
