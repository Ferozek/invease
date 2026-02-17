'use client';

import { useCompanyStore } from '@/stores/companyStore';
import { toTitleCase, formatPostcode } from '@/lib/textFormatters';
import LogoUpload from '@/components/shared/LogoUpload';

export default function CompanyDetailsForm() {
  const {
    businessType,
    companyName,
    companyNumber,
    vatNumber,
    eoriNumber,
    address,
    postCode,
    setCompanyDetails,
  } = useCompanyStore();

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

  return (
    <>
      <LogoUpload />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        {businessType === 'limited_company' && (
          <div>
            <label className="form-label">Company Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="Optional"
              value={companyNumber}
              onChange={(e) => setCompanyDetails({ companyNumber: e.target.value })}
            />
          </div>
        )}
        <div>
          <label className="form-label">VAT Number</label>
          <input
            type="text"
            className="form-input"
            placeholder="Optional"
            value={vatNumber}
            onChange={(e) => setCompanyDetails({ vatNumber: e.target.value })}
          />
        </div>
        <div>
          <label className="form-label">EORI Number</label>
          <input
            type="text"
            className="form-input"
            placeholder="Optional - for imports/exports"
            value={eoriNumber}
            onChange={(e) => setCompanyDetails({ eoriNumber: e.target.value })}
          />
        </div>
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
    </>
  );
}
