'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import type { BankDetails } from '@/types/invoice';

interface PaymentQRCodeProps {
  bankDetails: BankDetails;
  amount: number;
  reference?: string;
  size?: number;
}

/** Build the payment text string from bank details */
function buildPaymentText(
  bankDetails: BankDetails,
  amount: number,
  reference?: string,
): string {
  const sortCode = bankDetails.sortCode.replace(/(\d{2})(\d{2})(\d{2})/, '$1-$2-$3');

  return [
    `PAY TO: ${bankDetails.accountName}`,
    bankDetails.bankName ? `BANK: ${bankDetails.bankName}` : null,
    `SORT CODE: ${sortCode}`,
    `ACCOUNT: ${bankDetails.accountNumber}`,
    amount > 0 ? `AMOUNT: £${amount.toFixed(2)}` : null,
    reference ? `REF: ${reference}` : null,
  ].filter(Boolean).join('\n');
}

/**
 * Payment QR Code
 * Generates a real QR code encoding UK bank payment details.
 *
 * When scanned by a phone camera, displays the payment details
 * so the payer can quickly enter them into their banking app.
 *
 * UK doesn't have a single standard QR payment format like EPC (Europe),
 * so we encode as structured plaintext that any QR scanner can read.
 */
export default function PaymentQRCode({
  bankDetails,
  amount,
  reference,
  size = 150,
}: PaymentQRCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const hasRequiredDetails = !!(bankDetails.sortCode && bankDetails.accountNumber && bankDetails.accountName);

  const paymentText = useMemo(
    () => hasRequiredDetails ? buildPaymentText(bankDetails, amount, reference) : null,
    [bankDetails, amount, reference, hasRequiredDetails]
  );

  useEffect(() => {
    if (!paymentText) return;

    let cancelled = false;

    QRCode.toDataURL(paymentText, {
      width: size,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    }).catch(() => {
      if (!cancelled) setQrDataUrl(null);
    });

    return () => { cancelled = true; };
  }, [paymentText, size]);

  if (!hasRequiredDetails || !qrDataUrl) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white p-2 rounded-xl shadow-sm border border-[var(--surface-border)]">
        <Image
          src={qrDataUrl}
          alt="QR code with payment details"
          width={size}
          height={size}
          className="block"
          unoptimized
        />
      </div>
      <p className="text-xs text-[var(--text-muted)] text-center">
        Scan to view payment details
      </p>
    </div>
  );
}

/**
 * Generate a QR code data URL for use in PDF rendering.
 * Returns a promise that resolves to a base64 data URL string.
 */
export async function generatePaymentQRDataUrl(
  bankDetails: BankDetails,
  amount: number,
  reference?: string,
): Promise<string | null> {
  if (!bankDetails.sortCode || !bankDetails.accountNumber || !bankDetails.accountName) {
    return null;
  }

  const paymentText = buildPaymentText(bankDetails, amount, reference);

  try {
    return await QRCode.toDataURL(paymentText, {
      width: 80,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    });
  } catch {
    return null;
  }
}
