'use client';

import { useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useCompanyStore } from '@/stores/companyStore';
import { siteConfig } from '@/config/site';

export default function LogoUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { logo, logoFileName, setCompanyDetails } = useCompanyStore();

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes: readonly string[] = siteConfig.validation.allowedLogoTypes;
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload a PNG or JPEG image.',
      });
      return;
    }

    // Validate file size
    if (file.size > siteConfig.validation.maxLogoSize) {
      toast.error('File too large', {
        description: 'Logo must be under 2MB.',
      });
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = () => {
      setCompanyDetails({
        logo: reader.result as string,
        logoFileName: file.name,
      });
      toast.success('Logo uploaded', {
        description: 'Your logo will appear on invoices.',
      });
    };
    reader.onerror = () => {
      toast.error('Upload failed', {
        description: 'Could not read the file. Please try again.',
      });
    };
    reader.readAsDataURL(file);

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [setCompanyDetails]);

  const handleRemove = useCallback(() => {
    setCompanyDetails({
      logo: null,
      logoFileName: null,
    });
    toast.info('Logo removed');
  }, [setCompanyDetails]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="mb-4">
      <label className="form-label">Company Logo</label>

      {logo ? (
        <div className="flex items-center gap-4 p-3 border border-[var(--surface-border)] rounded-xl bg-[var(--surface-elevated)]">
          <img
            src={logo}
            alt="Company logo"
            className="h-12 w-auto max-w-[120px] object-contain"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-secondary)] truncate">
              {logoFileName}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Logo will appear on your invoice
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="cursor-pointer text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            title="Remove logo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--input-border)] rounded-xl cursor-pointer hover:border-[var(--brand-blue)] hover:bg-[var(--surface-elevated)] transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-[var(--text-muted)] mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-[var(--text-secondary)] font-medium">
            Click to upload logo
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            PNG or JPEG, max 2MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
