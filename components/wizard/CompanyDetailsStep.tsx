'use client';

import Button from '@/components/ui/Button';
import CollapsibleSection from '@/components/ui/CollapsibleSection';
import LogoUpload from '@/components/shared/LogoUpload';
import CompanySearch from '@/components/shared/CompanySearch';
import { useCompanyStore } from '@/stores/companyStore';
import { toTitleCase, formatPostcode } from '@/lib/textFormatters';
import type { BusinessType, CisStatus } from '@/types/invoice';

interface CompanyDetailsStepProps {
  businessType: BusinessType;
  onBack: () => void;
  onComplete: () => void;
}

export default function CompanyDetailsStep({
  businessType,
  onBack,
  onComplete,
}: CompanyDetailsStepProps) {
  const {
    companyName,
    companyNumber,
    vatNumber,
    eoriNumber,
    address,
    postCode,
    cisStatus,
    cisUtr,
    bankDetails,
    setCompanyDetails,
    setCisDetails,
    setBankDetails,
  } = useCompanyStore();

  // Helper to check if CIS is enabled
  const isCisEnabled = cisStatus !== 'not_applicable';

  // Auto-expand sections if data already exists
  const hasTaxDetails = !!vatNumber || !!eoriNumber;

  // Determine field labels based on business type
  const getNameLabel = () => {
    switch (businessType) {
      case 'sole_trader':
        return 'Trading Name';
      case 'partnership':
        return 'Partnership Name';
      case 'limited_company':
        return 'Company Name';
      default:
        return 'Business Name';
    }
  };

  // Validate required fields
  const isValid =
    companyName.trim() !== '' &&
    address.trim() !== '' &&
    postCode.trim() !== '' &&
    bankDetails.accountNumber.trim() !== '' &&
    bankDetails.sortCode.trim() !== '' &&
    bankDetails.accountName.trim() !== '' &&
    bankDetails.bankName.trim() !== '' &&
    // CIS validation: UTR required if CIS is enabled
    (!isCisEnabled || cisUtr.trim().length === 10);

  return (
    <div>
      <h2 className="text-xl font-semibold text-[var(--brand-blue)] mb-2">
        Your Business Details
      </h2>
      <p className="text-[var(--text-secondary)] mb-6">
        These details will be saved and used on all your invoices.
      </p>

      {/* Logo Upload */}
      <LogoUpload />

      {/* Companies House Search - only for Ltd companies */}
      {businessType === 'limited_company' && <CompanySearch />}

      {/* ========== REQUIRED FIELDS ========== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="form-label form-label-required">{getNameLabel()}</label>
          <input
            type="text"
            className="form-input"
            placeholder={`Your ${getNameLabel().toLowerCase()}`}
            value={companyName}
            onChange={(e) => setCompanyDetails({ companyName: e.target.value })}
            onBlur={(e) => setCompanyDetails({ companyName: toTitleCase(e.target.value) })}
          />
        </div>

        {/* Company Number - only for Ltd companies */}
        {businessType === 'limited_company' && (
          <div>
            <label className="form-label">Company Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="8 digit company number"
              value={companyNumber}
              onChange={(e) => setCompanyDetails({ companyNumber: e.target.value })}
            />
          </div>
        )}

        <div>
          <label className="form-label form-label-required">Post Code</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., SW1A 1AA"
            value={postCode}
            onChange={(e) => setCompanyDetails({ postCode: e.target.value })}
            onBlur={(e) => setCompanyDetails({ postCode: formatPostcode(e.target.value) })}
          />
        </div>

        <div className={businessType === 'limited_company' ? '' : 'md:col-span-2'}>
          <label className="form-label form-label-required">Address</label>
          <textarea
            className="form-input"
            rows={3}
            placeholder="Your business address"
            value={address}
            onChange={(e) => setCompanyDetails({ address: e.target.value })}
            onBlur={(e) => setCompanyDetails({ address: toTitleCase(e.target.value) })}
          />
        </div>
      </div>

      {/* ========== OPTIONAL: TAX DETAILS ========== */}
      <CollapsibleSection
        title="Tax Details"
        description="VAT and EORI numbers (optional)"
        defaultOpen={hasTaxDetails}
        className="mb-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">VAT Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., GB123456789"
              value={vatNumber}
              onChange={(e) => setCompanyDetails({ vatNumber: e.target.value })}
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Only if VAT registered
            </p>
          </div>
          <div>
            <label className="form-label">EORI Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., GB123456789000"
              value={eoriNumber}
              onChange={(e) => setCompanyDetails({ eoriNumber: e.target.value })}
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              For importing/exporting goods
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* ========== OPTIONAL: CIS SUBCONTRACTOR ========== */}
      <CollapsibleSection
        title="CIS Subcontractor"
        description="For construction industry workers"
        defaultOpen={isCisEnabled}
        className="mb-6"
      >
        <p className="text-[var(--text-secondary)] text-sm mb-4">
          If you work in construction and receive payments from contractors, you may need to register for CIS.
        </p>

        <label className="flex items-center gap-3 cursor-pointer mb-4">
          <input
            type="checkbox"
            className="w-5 h-5 rounded border-slate-300 text-[var(--brand-blue)] focus:ring-[var(--brand-blue)]"
            checked={isCisEnabled}
            onChange={(e) => {
              if (e.target.checked) {
                setCisDetails({ cisStatus: 'standard' });
              } else {
                setCisDetails({ cisStatus: 'not_applicable', cisUtr: '' });
              }
            }}
          />
          <span className="text-slate-700">I am a CIS registered subcontractor</span>
        </label>

        {isCisEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-[var(--brand-blue)]">
            <div>
              <label className="form-label form-label-required">UTR Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="10 digit number"
                maxLength={10}
                value={cisUtr}
                onChange={(e) => {
                  // Only allow digits
                  const value = e.target.value.replace(/\D/g, '');
                  setCisDetails({ cisUtr: value });
                }}
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Your Unique Taxpayer Reference from HMRC
              </p>
            </div>
            <div>
              <label className="form-label form-label-required">CIS Status</label>
              <select
                className="form-input"
                value={cisStatus}
                onChange={(e) => setCisDetails({ cisStatus: e.target.value as CisStatus })}
              >
                <option value="gross_payment">Gross Payment (0% deduction)</option>
                <option value="standard">Verified (20% deduction)</option>
                <option value="unverified">Unverified (30% deduction)</option>
              </select>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Check with your contractor or HMRC for your status
              </p>
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* ========== REQUIRED: BANK DETAILS ========== */}
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        Bank Details
      </h3>
      <p className="text-[var(--text-secondary)] text-sm mb-4">
        These will appear on your invoices for customers to pay you.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label form-label-required">Account Number</label>
          <input
            type="text"
            className="form-input"
            placeholder="8 digits"
            value={bankDetails.accountNumber}
            onChange={(e) => setBankDetails({ accountNumber: e.target.value })}
          />
        </div>
        <div>
          <label className="form-label form-label-required">Sort Code</label>
          <input
            type="text"
            className="form-input"
            placeholder="XX-XX-XX"
            value={bankDetails.sortCode}
            onChange={(e) => setBankDetails({ sortCode: e.target.value })}
          />
        </div>
        <div>
          <label className="form-label form-label-required">Account Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="Account holder name"
            value={bankDetails.accountName}
            onChange={(e) => setBankDetails({ accountName: e.target.value })}
            onBlur={(e) => setBankDetails({ accountName: toTitleCase(e.target.value) })}
          />
        </div>
        <div>
          <label className="form-label form-label-required">Bank Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Barclays"
            value={bankDetails.bankName}
            onChange={(e) => setBankDetails({ bankName: e.target.value })}
            onBlur={(e) => setBankDetails({ bankName: toTitleCase(e.target.value) })}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-8">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          disabled={!isValid}
          onClick={onComplete}
        >
          Save & Continue to Invoice
        </Button>
      </div>
    </div>
  );
}
