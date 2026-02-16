/**
 * Companies House Search API Route
 * Provides company search and lookup functionality
 */

export const runtime = 'nodejs'; // needed for Buffer (Basic auth)

import { NextResponse } from 'next/server';
import { searchCompanies, getCompanyByNumber } from '@/lib/companiesHouse';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const number = searchParams.get('number')?.trim();

  // Lookup by company number
  if (number) {
    const item = await getCompanyByNumber(number);
    return NextResponse.json({ items: item ? [item] : [] });
  }

  // Search by query
  if (!q || q.length < 2) {
    return NextResponse.json({ items: [] });
  }

  const items = await searchCompanies(q, 5);
  return NextResponse.json({ items });
}
