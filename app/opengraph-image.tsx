import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Invease — Free Invoice Generator for UK Businesses';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0b4f7a 0%, #063a5c 50%, #042a42 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Invoice icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'rgba(255, 255, 255, 0.15)',
            marginBottom: 24,
          }}
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-0.02em',
            marginBottom: 12,
          }}
        >
          Invease
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255, 255, 255, 0.85)',
            marginBottom: 40,
          }}
        >
          Free Invoice Generator for UK Businesses
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 16 }}>
          {['Free Forever', 'UK VAT & CIS', 'Privacy-First'].map((text) => (
            <div
              key={text}
              style={{
                padding: '10px 24px',
                borderRadius: 999,
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: 18,
                fontWeight: 500,
              }}
            >
              {text}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            fontSize: 16,
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          By K&R Accountants Ltd
        </div>
      </div>
    ),
    { ...size }
  );
}
