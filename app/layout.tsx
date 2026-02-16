import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
import { siteConfig } from '@/config/site';

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
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
      </body>
    </html>
  );
}
