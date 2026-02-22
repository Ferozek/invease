# Invease QA Checklist

Pre-production verification checklist. Run all checks before deploying to production.

---

## Quick Commands

```bash
# Run all automated checks
npm run type-check && npm run lint && npm run test:unit && npm run test:e2e

# Individual checks
npm run type-check    # TypeScript validation
npm run lint          # ESLint
npm run test:unit     # Unit tests (604 Vitest tests across 20 files)
npm run test:smoke    # Quick E2E smoke tests (~10s)
npm run test:e2e      # Full E2E test suite (26 Playwright tests across 5 suites)
npm run build         # Production build
```

---

## Automated Checks ✅

### 1. Build & Type Safety

- [ ] `npm run build` passes without errors
- [ ] `npm run type-check` shows no TypeScript errors
- [ ] `npm run lint` shows no ESLint errors

### 2. Unit Tests

- [ ] `npm run test:unit` - Full unit suite (604 tests across 20 files)

### 3. E2E Tests

- [ ] `npm run test:smoke` - Basic functionality (3 tests)
- [ ] `npm run test:e2e` - Full suite (26 tests across 5 suites)
  - Smoke + accessibility (smoke.spec.ts)
  - Onboarding wizard flow (onboarding.spec.ts)
  - Invoice form + validation (invoice-form.spec.ts)
  - PDF + documents (pdf-and-documents.spec.ts)
  - Dashboard + payment tracking (dashboard.spec.ts)

---

## Manual Checks 🔍

### 4. Core User Flows

#### First-Time User

- [ ] Clear localStorage, load app → Wizard appears
- [ ] Complete wizard as Sole Trader → Reaches main form
- [ ] Complete wizard as Limited Company → Companies House search works
- [ ] Bank details entered → Not visible in DevTools localStorage

#### Invoice Creation

- [ ] Fill customer details → Appears in preview immediately
- [ ] Add multiple line items → Totals calculate correctly
- [ ] Change VAT rates → VAT/Total update correctly
- [ ] Download PDF → PDF opens, all data present

#### Data Persistence

- [ ] Fill company details → Refresh page → Details persist
- [ ] Fill bank details → Refresh page → Bank details cleared (security)
- [ ] Save invoice to history → Appears in history panel
- [ ] Load invoice from history → All fields restored

### 5. Accessibility (Apple HIG)

#### Keyboard Navigation

- [ ] Tab through entire app without mouse
- [ ] Skip link works (Tab → Enter → Jumps to main content)
- [ ] Focus visible on all interactive elements
- [ ] Escape closes modals/panels

#### Screen Reader

- [ ] Wizard steps announce progress
- [ ] Form errors announced on blur
- [ ] Buttons have descriptive labels
- [ ] Tables have proper headers

#### Touch Targets

- [ ] All buttons ≥ 44px (test on mobile)
- [ ] Checkboxes/radios easy to tap
- [ ] Close buttons accessible

### 6. Cross-Browser Testing

| Browser | Desktop | Mobile    |
| ------- | ------- | --------- |
| Chrome  | [ ]     | [ ]       |
| Safari  | [ ]     | [ ] (iOS) |
| Firefox | [ ]     | [ ]       |
| Edge    | [ ]     | -         |

### 7. Dark Mode

- [ ] Toggle dark mode → All text readable
- [ ] Form inputs visible in dark mode
- [ ] Preview card has proper contrast
- [ ] No hardcoded colors (check for `#fff`, `#000`, `slate-`)

### 8. Performance

- [ ] Lighthouse Performance score ≥ 90
- [ ] Lighthouse Accessibility score ≥ 95
- [ ] First Contentful Paint < 1.5s
- [ ] No layout shifts during hydration

### 9. Security

- [ ] Bank details NOT in localStorage (check DevTools)
- [ ] No API keys exposed in client bundle
- [ ] CSP headers present (check Network tab)
- [ ] HTTPS enforced

### 10. PWA

- [ ] manifest.json loads correctly
- [ ] App installable on iOS (Add to Home Screen)
- [ ] App opens in standalone mode
- [ ] Correct icon on home screen
- [ ] Offline page shows when disconnected

### 11. Legal Pages

- [ ] /privacy page loads correctly
- [ ] /terms page loads correctly (includes MTD disclaimer)
- [ ] /accessibility page loads correctly
- [ ] Footer links present and working
- [ ] Back navigation works from legal pages
- [ ] K&R Accountants attribution correct

### 12. Rate Limiting & Security Headers

- [ ] API returns 429 after 30 requests/minute
- [ ] Content-Security-Policy header present
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Strict-Transport-Security present (production)

---

## Pre-Deploy Commands

```bash
# Full verification (run before merge to main)
npm run type-check && \
npm run lint && \
npm run test:unit && \
npm run build && \
npm run test:e2e

# Deploy
git push origin main  # Triggers Vercel deployment
```

---

## Issue Reporting

If you find issues, check:

1. Console for JavaScript errors
2. Network tab for failed requests
3. React DevTools for component state
4. Zustand DevTools for store state

Report issues at: https://github.com/Ferozek/invease/issues

---

## Version History

| Version | Date       | Changes                                                          |
| ------- | ---------- | ---------------------------------------------------------------- |
| 1.0.0   | 2026-02-17 | Initial QA checklist                                             |
| 1.1.0   | 2026-02-22 | Added unit tests section, corrected E2E counts, fixed issue link |
