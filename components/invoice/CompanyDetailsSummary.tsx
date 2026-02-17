'use client';

import { useCompanyStore } from '@/stores/companyStore';
import { isSampleCompanyName } from '@/config/sampleData';

/**
 * CompanyDetailsSummary - Read-only display of saved company details
 * Following Apple HIG: Show saved data as summary, not duplicate editable forms
 */
export default function CompanyDetailsSummary() {
  const {
    logo,
    companyName,
    companyNumber,
    vatNumber,
    eoriNumber,
    address,
    postCode,
    cisStatus,
    cisUtr,
  } = useCompanyStore();

  const isCis = cisStatus !== 'not_applicable';
  const isSample = isSampleCompanyName(companyName);

  return (
    <div className="space-y-4">
      {/* Sample data indicator */}
      {isSample && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
          <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <span className="text-blue-700 dark:text-blue-300">
            This is sample data. Click &quot;Edit Details&quot; to add your own.
          </span>
        </div>
      )}

      {/* Logo and Name */}
      <div className="flex items-start gap-4">
        {logo && (
          <img
            src={logo}
            alt="Company logo"
            className="h-12 w-auto max-w-[80px] object-contain rounded border border-[var(--surface-border)]"
          />
        )}
        <div className="flex-1">
          <p className={`font-semibold ${isSample ? 'text-[var(--text-muted)] italic' : 'text-[var(--text-primary)]'}`}>
            {companyName || 'Your Company Name'}
          </p>
          <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line">{address}</p>
          <p className="text-sm text-[var(--text-secondary)]">{postCode}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        {companyNumber && (
          <div>
            <p className="text-[var(--text-muted)] text-xs">Company No.</p>
            <p className="font-medium text-[var(--text-primary)]">{companyNumber}</p>
          </div>
        )}
        {vatNumber && (
          <div>
            <p className="text-[var(--text-muted)] text-xs">VAT No.</p>
            <p className="font-medium text-[var(--text-primary)]">{vatNumber}</p>
          </div>
        )}
        {eoriNumber && (
          <div>
            <p className="text-[var(--text-muted)] text-xs">EORI</p>
            <p className="font-medium text-[var(--text-primary)]">{eoriNumber}</p>
          </div>
        )}
        {isCis && cisUtr && (
          <div>
            <p className="text-[var(--text-muted)] text-xs">CIS UTR</p>
            <p className="font-medium text-[var(--text-primary)]">{cisUtr}</p>
          </div>
        )}
      </div>

      {/* CIS Status Badge */}
      {isCis && (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs">
          <span className="text-amber-700">CIS Subcontractor</span>
          <span className="font-medium text-amber-800">
            {cisStatus === 'gross_payment' && '0% (Gross)'}
            {cisStatus === 'standard' && '20% (Verified)'}
            {cisStatus === 'unverified' && '30% (Unverified)'}
          </span>
        </div>
      )}
    </div>
  );
}
