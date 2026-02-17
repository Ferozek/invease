import type { Metadata, Viewport } from 'next';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
import { siteConfig } from '@/config/site';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: ['invoice', 'invoice generator', 'free invoice', 'UK VAT', 'sales invoice', 'K&R Accountants'],
  authors: [{ name: 'K&R Accountants', url: siteConfig.support.website }],
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: 'website',
    locale: 'en_GB',
  },
  // PWA Configuration
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Invease',
  },
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

// Viewport configuration for PWA (iOS safe areas)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0b4f7a' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Skip link for keyboard navigation - Apple HIG accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50
            focus:px-4 focus:py-2 focus:bg-[var(--brand-blue)] focus:text-white focus:rounded-lg
            focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          Skip to main content
        </a>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
        {/* Global aria-live region for screen reader announcements */}
        <div
          id="status-announcer"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
        <Analytics />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
