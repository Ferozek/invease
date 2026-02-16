/**
 * Companies House API Integration
 * Provides search and lookup functionality for UK companies
 */

import { env } from './env';

export type CompanyLite = {
  name: string;
  number: string;
  status?: string;
  address?: string;
  type?: string;
  incorporationDate?: string;
};

function authHeader(): string | undefined {
  const key = env.COMPANIES_HOUSE_API_KEY;
  if (!key) return undefined;
  // Basic auth: API key as username, blank password
  const token = Buffer.from(`${key}:`).toString('base64');
  return `Basic ${token}`;
}

export async function searchCompanies(q: string, limit = 5): Promise<CompanyLite[]> {
  const auth = authHeader();
  if (!auth) {
    console.warn('[companiesHouse] No API key set - returning empty search results.');
    return [];
  }

  const url = new URL('https://api.company-information.service.gov.uk/search/companies');
  url.searchParams.set('q', q);
  url.searchParams.set('items_per_page', String(limit));

  const res = await fetch(url, { headers: { Authorization: auth } });
  if (!res.ok) {
    console.warn(`[companiesHouse] Search failed (${res.status})`);
    return [];
  }

  const data = await res.json();
  const items = Array.isArray((data as any)?.items) ? (data as any).items : [];

  return items.map((it: any): CompanyLite => ({
    name: it?.title ?? '',
    number: it?.company_number ?? '',
    status: it?.company_status ?? '',
    address: it?.address_snippet ?? '',
  }));
}

export async function getCompanyByNumber(number: string): Promise<CompanyLite | null> {
  const auth = authHeader();
  if (!auth) {
    console.warn('[companiesHouse] No API key set - skipping company lookup.');
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

  const d: any = await res.json();

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
