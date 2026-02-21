'use client';

import { useCompaniesHouseSearch, type CompanyItem } from '@/hooks/useCompaniesHouseSearch';
import { useCompanyStore } from '@/stores/companyStore';
import { toTitleCase, formatPostcode } from '@/lib/textFormatters';

interface CompanySearchProps {
  onCompanySelected?: () => void;
}

export default function CompanySearch({ onCompanySelected }: CompanySearchProps) {
  const { setCompanyDetails } = useCompanyStore();
  const {
    companyName,
    companyNumber,
    companyHits,
    companyOpen,
    setCompanyOpen,
    companyMeta,
    isLoading,
    handleNameChange,
    chooseCompany,
    clearSearch,
  } = useCompaniesHouseSearch();

  const handleSelect = async (item: CompanyItem) => {
    await chooseCompany(item);

    // Parse address - API returns comma-separated
    const addressParts = (item.address || '').split(', ');
    const postcode = addressParts.pop() || '';
    const address = addressParts.join('\n');

    // Auto-fill company details
    setCompanyDetails({
      companyName: toTitleCase(item.name),
      companyNumber: item.number,
      address: toTitleCase(address),
      postCode: formatPostcode(postcode),
    });

    onCompanySelected?.();
  };

  const handleClear = () => {
    clearSearch();
    setCompanyDetails({
      companyName: '',
      companyNumber: '',
      address: '',
      postCode: '',
    });
  };

  // If a company is already selected, show the selected state
  if (companyNumber) {
    return (
      <div className="mb-4">
        <label className="form-label">Companies House Lookup</label>
        <div className="flex items-center gap-3 p-3 border border-green-200 dark:border-green-800 rounded-xl bg-green-50 dark:bg-green-900/20">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[var(--text-primary)] truncate">{companyName}</p>
            <p className="text-sm text-[var(--text-secondary)]">
              Company No: <span className="font-mono">{companyNumber}</span>
              {companyMeta?.status && (
                <span className="ml-2 text-green-600 dark:text-green-400">({companyMeta.status})</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-medium min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            Change
          </button>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Company details auto-filled from Companies House.
          Contains public sector information licensed under the{' '}
          <a
            href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Open Government Licence v3.0
          </a>.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 relative">
      <label className="form-label">Search Companies House</label>
      <div className="relative">
        <input
          type="text"
          className="form-input pr-10"
          placeholder="Start typing company name..."
          value={companyName}
          onChange={(e) => handleNameChange(e.target.value)}
          onBlur={() => setTimeout(() => setCompanyOpen(false), 200)}
          onFocus={() => companyHits.length > 0 && setCompanyOpen(true)}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-4 w-4 text-[var(--text-muted)]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Search results dropdown */}
      {companyOpen && companyHits.length > 0 && (
        <ul
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[var(--surface-border)] bg-[var(--surface-card)] shadow-lg"
          role="listbox"
          aria-label="Company search results"
        >
          {companyHits.map((item) => (
            <li
              key={item.number}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-[var(--surface-elevated)] transition-colors min-h-[44px] flex flex-col justify-center"
              onMouseDown={() => handleSelect(item)}
              role="option"
              aria-selected={false}
            >
              <div className="font-medium text-[var(--text-primary)]">{item.name}</div>
              <div className="text-xs text-[var(--text-muted)]">
                {item.number} {item.status && `\u2022 ${item.status}`}
                {item.address && ` \u2022 ${item.address}`}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-[var(--text-muted)] mt-1">
        Search for your registered company to auto-fill details. Data from{' '}
        <a
          href="https://developer.company-information.service.gov.uk/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Companies House
        </a>.
      </p>
    </div>
  );
}
