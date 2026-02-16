'use client';

import { useCompanyStore } from '@/stores/companyStore';

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

  return (
    <div className="space-y-4">
      {/* Logo and Name */}
      <div className="flex items-start gap-4">
        {logo && (
          <img
            src={logo}
            alt="Company logo"
            className="h-12 w-auto max-w-[80px] object-contain rounded border border-slate-200"
          />
        )}
        <div className="flex-1">
          <p className="font-semibold text-slate-900">{companyName}</p>
          <p className="text-sm text-slate-600 whitespace-pre-line">{address}</p>
          <p className="text-sm text-slate-600">{postCode}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        {companyNumber && (
          <div>
            <p className="text-slate-500 text-xs">Company No.</p>
            <p className="font-medium text-slate-700">{companyNumber}</p>
          </div>
        )}
        {vatNumber && (
          <div>
            <p className="text-slate-500 text-xs">VAT No.</p>
            <p className="font-medium text-slate-700">{vatNumber}</p>
          </div>
        )}
        {eoriNumber && (
          <div>
            <p className="text-slate-500 text-xs">EORI</p>
            <p className="font-medium text-slate-700">{eoriNumber}</p>
          </div>
        )}
        {isCis && cisUtr && (
          <div>
            <p className="text-slate-500 text-xs">CIS UTR</p>
            <p className="font-medium text-slate-700">{cisUtr}</p>
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
