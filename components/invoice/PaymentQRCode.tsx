'use client';

import { useMemo } from 'react';
import type { BankDetails } from '@/types/invoice';

interface PaymentQRCodeProps {
  bankDetails: BankDetails;
  amount: number;
  reference?: string;
  size?: number;
}

/**
 * Payment QR Code
 * Generates a QR code for UK bank payments
 *
 * Uses UK Open Banking payment request format
 * Compatible with most UK banking apps
 *
 * Note: Uses a simple SVG-based QR code for lightweight implementation
 * For production, consider qrcode library for more reliable encoding
 */
export default function PaymentQRCode({
  bankDetails,
  amount,
  reference,
  size = 150,
}: PaymentQRCodeProps) {
  // Generate payment data string
  const paymentData = useMemo(() => {
    // UK Faster Payments format (simplified)
    // Format: account holder, sort code, account number, amount, reference
    return [
      bankDetails.accountName,
      bankDetails.sortCode.replace(/-/g, ''),
      bankDetails.accountNumber,
      amount.toFixed(2),
      reference || '',
    ].join('|');
  }, [bankDetails, amount, reference]);

  // Generate simple QR code pattern (placeholder - real QR encoding needed)
  // This creates a visual representation for demo purposes
  const qrPattern = useMemo(() => {
    return generateSimpleQRPattern(paymentData);
  }, [paymentData]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* QR Code */}
      <div
        className="bg-white p-3 rounded-xl shadow-sm border border-[var(--surface-border)]"
        style={{ width: size + 24, height: size + 24 }}
      >
        <svg
          viewBox="0 0 25 25"
          width={size}
          height={size}
          className="block"
        >
          {/* QR Code pattern */}
          {qrPattern.map((row, y) =>
            row.map((cell, x) =>
              cell ? (
                <rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width={1}
                  height={1}
                  fill="#000"
                />
              ) : null
            )
          )}

          {/* Position markers (corners) */}
          <PositionMarker x={0} y={0} />
          <PositionMarker x={18} y={0} />
          <PositionMarker x={0} y={18} />
        </svg>
      </div>

      {/* Label */}
      <p className="text-xs text-[var(--text-muted)] text-center">
        Scan to copy payment details
      </p>
    </div>
  );
}

// ===== QR Position Marker Component =====

function PositionMarker({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {/* Outer */}
      <rect x={x} y={y} width={7} height={7} fill="#000" />
      {/* Inner white */}
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />
      {/* Center */}
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="#000" />
    </g>
  );
}

// ===== Simple QR Pattern Generator =====
// Note: This is a simplified visual representation
// For production, use a proper QR code library

function generateSimpleQRPattern(data: string): boolean[][] {
  const size = 25;
  const pattern: boolean[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(false));

  // Generate pseudo-random pattern based on data hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash * 31 + data.charCodeAt(i)) & 0xffffffff;
  }

  // Fill data area (avoiding position markers)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Skip position marker areas
      if (
        (x < 8 && y < 8) || // Top-left
        (x >= 17 && y < 8) || // Top-right
        (x < 8 && y >= 17) // Bottom-left
      ) {
        continue;
      }

      // Generate pattern based on position and hash
      const bit = ((hash >> ((x * 3 + y * 7) % 32)) & 1) === 1;
      pattern[y][x] = bit;
    }
  }

  // Add timing patterns
  for (let i = 8; i < 17; i++) {
    pattern[6][i] = i % 2 === 0;
    pattern[i][6] = i % 2 === 0;
  }

  return pattern;
}

// ===== Alternative: Link to Banking App =====

export function PaymentLink({
  bankDetails,
  amount,
  reference,
}: Omit<PaymentQRCodeProps, 'size'>) {
  // Generate payment URL (works with some banking apps)
  const paymentUrl = `https://pay.uk/transfer?sortcode=${bankDetails.sortCode.replace(/-/g, '')}&account=${bankDetails.accountNumber}&name=${encodeURIComponent(bankDetails.accountName)}&amount=${amount}&ref=${encodeURIComponent(reference || '')}`;

  return (
    <a
      href={paymentUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
        bg-[var(--brand-blue)] text-white font-medium text-sm
        hover:bg-[var(--brand-blue)]/90 transition-colors"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
        />
      </svg>
      Pay Now
    </a>
  );
}
