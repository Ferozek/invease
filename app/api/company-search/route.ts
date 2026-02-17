/**
 * Companies House Search API Route
 * Provides company search and lookup functionality
 */

export const runtime = 'nodejs'; // needed for Buffer (Basic auth)

import { NextResponse } from 'next/server';
import { searchCompanies, getCompanyByNumber } from '@/lib/companiesHouse';

// Input validation limits
const MAX_QUERY_LENGTH = 100;
const MAX_NUMBER_LENGTH = 20;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const number = searchParams.get('number')?.trim();

  // Lookup by company number
  if (number) {
    // Validate company number length
    if (number.length > MAX_NUMBER_LENGTH) {
      return NextResponse.json({ items: [], error: 'Company number too long' });
    }
    const item = await getCompanyByNumber(number);
    return NextResponse.json({ items: item ? [item] : [] });
  }

  // Search by query
  if (!q || q.length < 2) {
    return NextResponse.json({ items: [] });
  }

  // Validate query length to prevent oversized requests
  if (q.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ items: [], error: 'Query too long' });
  }

  const items = await searchCompanies(q, 5);
  return NextResponse.json({ items });
}
