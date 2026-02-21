# Production Readiness Plan

## Current Score: 9.8/10 (Updated: 2026-02-21)

### Overview

This document outlines all remaining work to achieve full production readiness.

---

## ✅ COMPLETED (Session 2026-02-17)

### 1. Legal & Compliance ✅ (2/10 → 9/10)

- [x] Create `/app/privacy/page.tsx` - Privacy Policy page
- [x] Create `/app/terms/page.tsx` - Terms of Service page (includes MTD disclaimer Section 7)
- [x] Create `/app/accessibility/page.tsx` - Accessibility Statement
- [x] Add footer links to legal pages (`/components/shared/Footer.tsx`)
- [x] GDPR compliance information in privacy policy
- [ ] Add cookie consent banner (if analytics enabled) - _Not needed yet (Vercel Analytics is privacy-compliant)_

### 2. Security Hardening ✅ (8/10 → 10/10)

- [x] Companies House API key in backend proxy (`/app/api/company-search/route.ts`)
- [x] Rate limiting middleware (30 req/min per IP)
- [x] CSP headers (`/middleware.ts`) including `frame-src blob:` for PDF preview
- [x] X-Frame-Options, X-Content-Type-Options
- [x] Referrer-Policy, Permissions-Policy
- [x] HSTS in production
- [x] poweredByHeader disabled

### 3. PWA Assets ✅ (5/10 → 8/10)

- [x] Create `/public/offline.html` fallback
- [x] Update service worker for offline support (v2)
- [x] SVG icons in manifest (works in modern browsers)
- [ ] Generate PNG icons (192x192, 512x512) - _Nice to have for older browsers_
- [ ] iOS splash screens - _Nice to have_

---

## 🟠 REMAINING (Post-MVP OK)

### 4. Error Tracking (Current: 3/10)

**Optional for beta, recommended for production**

- [ ] Initialize Sentry SDK
- [ ] Configure source maps upload
- [ ] Setup performance monitoring

### 5. First-Time User Experience (Current: 7.5/10)

**Polish for v1.1**

- [ ] Activate `FirstRunHint` components in forms
- [ ] Add keyboard shortcut hints (Cmd/Ctrl+S, etc.)
- [ ] Improve empty state messaging
- [ ] Add "What's this?" tooltips on complex fields

### 6. Analytics (Current: 3/10)

**Post-launch when needed**

- [ ] Enable Web Vitals reporting
- [ ] Add custom event tracking (invoice created, PDF downloaded)
- [ ] Setup conversion funnel tracking

### 7. SEO & Social (Current: 4/10)

**Post-launch when marketing**

- [ ] Add Open Graph image (`/public/og-image.png`)
- [ ] Add structured data (JSON-LD)
- [ ] Generate sitemap.xml
- [ ] Add robots.txt

---

## Code Quality & Architecture Refactoring

**Target: 10/10 (from 9.5/10)**

### P0: InvoicePDF.tsx Monolith Split ✅

- [x] Extract PDF styles to `components/pdf/pdfStyles.ts` (~328 lines)
- [x] Create `lib/cisUtils.ts` — consolidated CIS logic (3 sources → 1)
- [x] Create `lib/bankDetailsUtils.ts` — consolidated bank checks (3 sources → 1)
- [x] Delete 8 duplicate helper functions from InvoicePDF.tsx
- [x] Import shared formatters from `lib/formatters.ts` and `lib/dateUtils.ts`
- [x] InvoicePDF.tsx reduced from 675 → ~250 lines

### P1: Document Type Switch Confirmation ✅

- [x] Add confirmation dialog when switching Invoice ↔ Credit Note with data
- [x] Reuse existing ConfirmDialog component (no new components)

### P2: Remaining Duplication Cleanup ✅

- [x] Replace 4x inline `toISOString().split('T')[0]` with `getTodayISO()`
- [x] Extract line item copy logic (3 copies) to `lib/invoiceUtils.ts`

### P3: UX Polish [ ]

- [ ] Add inline validation to credit note original invoice number field
- [ ] Add A4 skeleton loading to PDF preview modal

---

## 🟢 ALREADY COMPLETE (10/10)

- ✅ Apple HIG Touch Targets (44px minimum, including InfoIcon)
- ✅ Haptic Feedback (Vibration API, including validation errors)
- ✅ Animation System (Framer Motion)
- ✅ Reduced Motion Support (CollapsibleSection, EmptyState)
- ✅ Autocomplete attributes on form inputs
- ✅ Quick Start mode (Skip → straight to invoice with sample data)
- ✅ Dark Mode Support
- ✅ Responsive Design (18 device profiles tested)
- ✅ E2E Test Coverage (290+ tests passing)
- ✅ Auto-save with visual indicator
- ✅ Undo/Redo functionality
- ✅ Web Share API integration
- ✅ Swipe-to-delete gestures
- ✅ UK VAT/CIS calculations
- ✅ PDF generation
- ✅ Companies House integration
- ✅ Legal pages (Privacy, Terms, Accessibility)
- ✅ Security headers & rate limiting
- ✅ Offline fallback page
- ✅ Email Invoice (Web Share API on mobile, mailto: on desktop)
- ✅ Customer email field in invoice form
- ✅ Bank details security (never persisted to localStorage)
- ✅ CSP hardened (no unsafe-eval in production)
- ✅ Centralized logging utility (ready for Sentry upgrade)
- ✅ Zod validation schemas (lib/schemas.ts)
- ✅ Shared utilities (invoiceUtils.ts, dateUtils.ts)
- ✅ Code deduplication (getValidLineItems, getTodayISO)

---

## Summary

**Ready for Beta Launch:** YES ✅

The app is now ready for beta testing with real users. All critical items have been addressed:

- Legal compliance (Privacy Policy, Terms, Accessibility)
- Security hardening (CSP, rate limiting, API proxy)
- PWA basics (offline page, service worker)
- Comprehensive test coverage

**Remaining for v1.0 Production:**

- Sentry error tracking (recommended)
- PNG icon generation (for older browsers)

**Nice-to-have for v1.1:**

- First-run hints and tooltips
- Keyboard shortcut hints
- SEO/social meta tags
- Analytics events

---

## Files Created This Session

1. `/app/privacy/page.tsx` - Privacy Policy
2. `/app/terms/page.tsx` - Terms of Service
3. `/app/accessibility/page.tsx` - Accessibility Statement
4. `/components/shared/Footer.tsx` - Footer with legal links
5. `/public/offline.html` - Offline fallback page
6. `/components/invoice/EmailInvoiceButton.tsx` - Standalone email button (Web Share + mailto)

## Files Modified This Session

1. `/app/page.tsx` - Added Footer import and component
2. `/middleware.ts` - Added rate limiting, CSP (unsafe-eval only in dev)
3. `/next.config.ts` - Added security options
4. `/public/sw.js` - Added offline.html caching, bumped to v2
5. `/public/manifest.json` - Updated to use SVG icons
6. `/types/invoice.ts` - Added email to CustomerDetails
7. `/stores/invoiceStore.ts` - Added email to default customer
8. `/config/sampleData.ts` - Added email to sample customer
9. `/components/invoice/CustomerDetailsForm.tsx` - Added email input field
10. `/components/pdf/PDFPreviewModal.tsx` - Added Email button with handleEmail
11. `/stores/companyStore.ts` - Removed bank details persistence (security)
12. `/components/wizard/BankDetailsStep.tsx` - Removed "Remember" checkbox
13. `/lib/logger.ts` - NEW: Centralized logging utility
14. `/lib/companiesHouse.ts` - Replaced console.warn with logger
15. `/lib/env.ts` - Replaced console.error with logger
16. `/components/ui/ErrorBoundary.tsx` - Replaced console.error with logger
17. `/components/ServiceWorkerRegister.tsx` - Replaced console with logger
