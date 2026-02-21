/**
 * Site Configuration
 * Centralized configuration for easy migration to K&R subdomain
 */

export const siteConfig = {
  name: 'Invease',
  description: 'Free Invoice Generator for K&R Accountants Clients',
  tagline: 'Create professional invoices in minutes',

  // Easy to change when moving to subdomain
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://invease.vercel.app',

  // Branding - can inherit from K&R when integrated
  branding: {
    showKRLogo: false, // Set to true when integrated with K&R
    logoUrl: '/assets/kr-logo.png',
    primaryColor: '#0b4f7a', // K&R blue
    secondaryColor: '#c61f2b', // K&R red
  },

  // Feature flags for future expansion
  features: {
    multipleInvoices: false, // Future: manage multiple invoices
    emailInvoice: true,      // Web Share API (mobile) + mailto: (desktop)
    invoiceHistory: true,    // localStorage history (implemented)
    logoUpload: true,        // Allow company logo upload
    quickStart: true,        // Skip → straight to invoice with sample data
    dashboard: true,         // Dashboard summary card on main page
  },

  // VAT rates available (UK)
  vatRates: [
    { value: '0', label: '0% (Zero-rated)' },
    { value: '5', label: '5% (Reduced)' },
    { value: '20', label: '20% (Standard)' },
  ],

  // Validation limits
  validation: {
    maxLogoSize: 2 * 1024 * 1024, // 2MB
    allowedLogoTypes: ['image/png', 'image/jpeg'],
    maxCompanyNameLength: 100,
    maxAddressLength: 500,
    maxDescriptionLength: 200,
  },

  // Contact for support (K&R)
  support: {
    email: 'info@kraccountants.com',
    feedbackEmail: 'admin@kraccountants.com',
    website: 'https://kraccountants.com',
  },
} as const;

export type SiteConfig = typeof siteConfig;
