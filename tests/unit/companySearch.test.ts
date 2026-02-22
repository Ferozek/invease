import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock companiesHouse before importing the route
vi.mock('@/lib/companiesHouse', () => ({
  searchCompanies: vi.fn(),
  getCompanyByNumber: vi.fn(),
}));

import { GET } from '@/app/api/company-search/route';
import { searchCompanies, getCompanyByNumber } from '@/lib/companiesHouse';

const mockSearchCompanies = vi.mocked(searchCompanies);
const mockGetCompanyByNumber = vi.mocked(getCompanyByNumber);

function makeRequest(url: string): Request {
  return new Request(url);
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/company-search', () => {
  describe('search by query', () => {
    it('returns results for valid query', async () => {
      mockSearchCompanies.mockResolvedValue([
        { name: 'Test Ltd', number: '12345678', status: 'active', address: '1 Test St' },
      ]);

      const res = await GET(makeRequest('http://localhost/api/company-search?q=Test'));
      const data = await res.json();

      expect(data.items).toHaveLength(1);
      expect(data.items[0].name).toBe('Test Ltd');
      expect(mockSearchCompanies).toHaveBeenCalledWith('Test', 5);
    });

    it('returns empty for query shorter than 2 chars', async () => {
      const res = await GET(makeRequest('http://localhost/api/company-search?q=T'));
      const data = await res.json();

      expect(data.items).toEqual([]);
      expect(mockSearchCompanies).not.toHaveBeenCalled();
    });

    it('returns empty for missing query', async () => {
      const res = await GET(makeRequest('http://localhost/api/company-search'));
      const data = await res.json();

      expect(data.items).toEqual([]);
    });

    it('returns empty for whitespace-only query', async () => {
      const res = await GET(makeRequest('http://localhost/api/company-search?q=%20'));
      const data = await res.json();

      expect(data.items).toEqual([]);
    });

    it('returns error for query longer than 100 chars', async () => {
      const longQuery = 'A'.repeat(101);
      const res = await GET(makeRequest(`http://localhost/api/company-search?q=${longQuery}`));
      const data = await res.json();

      expect(data.items).toEqual([]);
      expect(data.error).toBe('Query too long');
      expect(mockSearchCompanies).not.toHaveBeenCalled();
    });

    it('trims query whitespace', async () => {
      mockSearchCompanies.mockResolvedValue([]);

      await GET(makeRequest('http://localhost/api/company-search?q=%20%20Test%20%20'));
      expect(mockSearchCompanies).toHaveBeenCalledWith('Test', 5);
    });
  });

  describe('lookup by company number', () => {
    it('returns result for valid 8-digit company number', async () => {
      mockGetCompanyByNumber.mockResolvedValue({
        name: 'Acme Ltd',
        number: '12345678',
        status: 'active',
        address: '1 High Street, London',
      });

      const res = await GET(makeRequest('http://localhost/api/company-search?number=12345678'));
      const data = await res.json();

      expect(data.items).toHaveLength(1);
      expect(data.items[0].name).toBe('Acme Ltd');
      expect(mockGetCompanyByNumber).toHaveBeenCalledWith('12345678');
    });

    it('returns result for Scottish company number', async () => {
      mockGetCompanyByNumber.mockResolvedValue({
        name: 'Scottish Co',
        number: 'SC123456',
      });

      const res = await GET(makeRequest('http://localhost/api/company-search?number=SC123456'));
      const data = await res.json();

      expect(data.items).toHaveLength(1);
      expect(data.items[0].name).toBe('Scottish Co');
    });

    it('returns empty when company not found', async () => {
      mockGetCompanyByNumber.mockResolvedValue(null);

      const res = await GET(makeRequest('http://localhost/api/company-search?number=99999999'));
      const data = await res.json();

      expect(data.items).toEqual([]);
    });

    it('returns error for invalid company number format', async () => {
      const res = await GET(makeRequest('http://localhost/api/company-search?number=INVALID'));
      const data = await res.json();

      expect(data.items).toEqual([]);
      expect(data.error).toBe('Invalid company number format');
      expect(mockGetCompanyByNumber).not.toHaveBeenCalled();
    });

    it('returns error for too-short company number', async () => {
      const res = await GET(makeRequest('http://localhost/api/company-search?number=1234'));
      const data = await res.json();

      expect(data.items).toEqual([]);
      expect(data.error).toBe('Invalid company number format');
    });

    it('company number lookup takes priority over query', async () => {
      mockGetCompanyByNumber.mockResolvedValue({
        name: 'By Number',
        number: '12345678',
      });

      const res = await GET(
        makeRequest('http://localhost/api/company-search?q=Test&number=12345678')
      );
      const data = await res.json();

      expect(data.items[0].name).toBe('By Number');
      expect(mockSearchCompanies).not.toHaveBeenCalled();
    });
  });
});
