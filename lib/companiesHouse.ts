/**
 * Companies House API Integration
 * Provides search and lookup functionality for UK companies
 */

import logger from '@/lib/logger';

// Note: Reading COMPANIES_HOUSE_API_KEY directly from process.env
// to avoid module caching issues with env validation

export type CompanyLite = {
  name: string;
  number: string;
  status?: string;
  address?: string;
  type?: string;
  incorporationDate?: string;
};

// Companies House API response types
interface CompanySearchItem {
  title?: string;
  company_number?: string;
  company_status?: string;
  address_snippet?: string;
}

interface CompanySearchResponse {
  items?: CompanySearchItem[];
}

interface CompanyProfileAddress {
  address_line_1?: string;
  address_line_2?: string;
  locality?: string;
  postal_code?: string;
}

interface CompanyProfileResponse {
  company_name?: string;
  company_number?: string;
  company_status?: string;
  registered_office_address?: CompanyProfileAddress;
  type?: string;
  company_type?: string;
  date_of_creation?: string;
}

function authHeader(): string | undefined {
  // Read directly from process.env to bypass validation module caching issues
  const key = process.env.COMPANIES_HOUSE_API_KEY;
  if (!key) return undefined;
  // Basic auth: API key as username, blank password
  const token = Buffer.from(`${key}:`).toString('base64');
  return `Basic ${token}`;
}

export async function searchCompanies(q: string, limit = 5): Promise<CompanyLite[]> {
  const key = process.env.COMPANIES_HOUSE_API_KEY;
  if (!key) {
    logger.warn('[companiesHouse] No API key set - returning empty search results.');
    return [];
  }

  const auth = `Basic ${Buffer.from(`${key}:`).toString('base64')}`;
  const url = new URL('https://api.company-information.service.gov.uk/search/companies');
  url.searchParams.set('q', q);
  url.searchParams.set('items_per_page', String(limit));

  const res = await fetch(url, { headers: { Authorization: auth } });
  if (!res.ok) {
    console.warn(`[companiesHouse] Search failed (${res.status})`);
    return [];
  }

  const data: CompanySearchResponse = await res.json();
  const items = Array.isArray(data?.items) ? data.items : [];

  return items.map((it): CompanyLite => ({
    name: it?.title ?? '',
    number: it?.company_number ?? '',
    status: it?.company_status ?? '',
    address: it?.address_snippet ?? '',
  }));
}

export async function getCompanyByNumber(number: string): Promise<CompanyLite | null> {
  const auth = authHeader();
  if (!auth) {
    logger.warn('[companiesHouse] No API key set - skipping company lookup.');
    return null;
  }

  const res = await fetch(
    `https://api.company-information.service.gov.uk/company/${encodeURIComponent(number)}`,
    { headers: { Authorization: auth } }
  );

  if (!res.ok) {
    console.warn(`[companiesHouse] Company lookup failed (${res.status}) for ${number}`);
    return null;
  }

  const d: CompanyProfileResponse = await res.json();

  const parts = [
    d?.registered_office_address?.address_line_1,
    d?.registered_office_address?.address_line_2,
    d?.registered_office_address?.locality,
    d?.registered_office_address?.postal_code,
  ].filter(Boolean);

  return {
    name: d?.company_name ?? '',
    number: d?.company_number ?? number,
    status: d?.company_status ?? '',
    address: parts.join(', '),
    type: d?.type ?? d?.company_type,
    incorporationDate: d?.date_of_creation,
  };
}
