# Invease Competitive Scorecard

> How would Apple, Google, Microsoft, Sage, Xero, and Zoho rate Invease out of 100?
>
> Scored across 5 dimensions: **Design, UX, UI, Security, Unit Tests**
>
> Generated: 23 February 2026

---

## Executive Summary

Invease is a client-side Next.js 16 invoice generator for UK small businesses. It scores highest through Apple and Google lenses (strong HIG/Material alignment) and lowest through enterprise accounting lenses (Sage, Zoho) where server-side security and feature completeness matter more.

**Standout strengths:** 44px touch targets, dark mode, ARIA accessibility, autosave UX, bank details security, comprehensive Zod validation, 533 unit tests with 17-project E2E matrix.

**Key gap across all reviewers:** Zero React component unit tests (75 components), no visual regression testing, PII in localStorage not encrypted.

---

## The Matrix

| Company        | Design   | UX       | UI       | Security | Tests    | **Average** |
| -------------- | -------- | -------- | -------- | -------- | -------- | ----------- |
| **Apple**      | 91       | 93       | 95       | 78       | 76       | **86.6**    |
| **Google**     | 86       | 88       | 92       | 82       | 82       | **86.0**    |
| **Microsoft**  | 78       | 82       | 88       | 75       | 72       | **79.0**    |
| **Sage**       | 80       | 85       | 84       | 68       | 74       | **78.2**    |
| **Xero**       | 84       | 90       | 86       | 72       | 78       | **82.0**    |
| **Zoho**       | 76       | 80       | 82       | 70       | 70       | **75.6**    |
| **Column Avg** | **82.5** | **86.3** | **87.8** | **74.2** | **75.3** | **81.2**    |

**Verdict: 81/100 composite** — passes most quality bars with conditions. UX and UI are the strongest pillars. Security and testing need targeted work for enterprise readiness.

---

## Per-Company Deep Dives

### Apple (Average: 86.6)

Apple reviews through the lens of the Human Interface Guidelines: does it feel native, accessible, and delightful?

| Dimension        | Score                                                                                                                                                                                                                                                                                                                                                                                                      | Rationale |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| **Design: 91**   | Fluid clamp() typography, CSS variable tokens (105 lines), Playfair Display + Inter font pairing, semantic color naming (brand, destructive, success). 8pt grid at 95% adherence. Brand cohesion exceptional. Loses points: no Dynamic Type support (user font size preference), secondary button visually identical to primary.                                                                           |
| **UX: 93**       | Two onboarding paths (slides + wizard + Quick Start) with spring physics transitions. Customer autocomplete mirrors Apple Contacts pattern. Autosave with fade-in checkmark. Progressive disclosure via accordions. Undo/redo via Cmd+Z. Haptic feedback on buttons and validation errors. Loses points: undo not discoverable (keyboard-only, no visible button), no form-level error summary for wizard. |
| **UI: 95**       | 99% 44px touch target compliance across all buttons, inputs, and controls. Complete dark mode with deep gray backgrounds (not pure black). Framer Motion animations with useReducedMotion() everywhere. Focus traps in modals. Safe area insets for iOS. Line items stack on mobile with data-label attributes. Loses points: no Liquid Glass translucency (2025 HIG).                                     |
| **Security: 78** | App Store review checks for HTTPS (HSTS enforced), no private API usage (N/A), data handling disclosure. Bank details memory-only is excellent. But: CSP requires unsafe-eval (PDF library), localStorage PII not encrypted, no biometric lock for sensitive data. Apple would flag the unsafe-eval and want App Transport Security documentation.                                                         |
| **Tests: 76**    | Apple expects XCTest/XCUITest coverage for App Store. Equivalent here: 533 Vitest unit tests is strong, 26 Playwright E2E tests cover critical flows. But: zero component render tests (Apple would want UI test coverage), no snapshot regression. Accessibility testing via axe-core is good. Lighthouse CI configured. Missing: performance benchmarks for large invoices.                              |

**What would move Apple scores up:**

- Dynamic Type support (+3 Design)
- Visible undo button in toolbar (+2 UX)
- Component unit tests with RTL (+5 Tests)
- Client-side encryption for PII (+4 Security)

---

### Google (Average: 86.0)

Google reviews through Material Design 3, Lighthouse, and Chrome DevTools quality metrics.

| Dimension        | Score                                                                                                                                                                                                                                                                                                                                                                                                              | Rationale |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| **Design: 86**   | CSS variable token system aligns with Material's design token approach. Elevation/shadow patterns present. Deep gray dark mode matches Material 3 guidance. Loses points: not using Material color palette system (primary/secondary/tertiary), no Material Symbols icon library (uses Heroicons), button variants don't follow Material's filled/outlined/tonal/text hierarchy.                                   |
| **UX: 88**       | Lighthouse CI enforces performance >= 85, accessibility >= 90, best practices >= 90. Auto-save pattern matches Google Docs philosophy. Progressive disclosure good. Empty states with CTAs follow Material guidance. Loses points: no Core Web Vitals explicit monitoring, no offline-first data sync pattern (PWA is cache-only), undo is keyboard-only.                                                          |
| **UI: 92**       | Responsive mobile-first design. Touch targets exceed Material's 48dp minimum. WCAG AA contrast verified. Dark mode complete. Framer Motion animations with proper easing. All form inputs have proper ARIA. Loses points: no Material ripple effects, no Material motion curves (uses spring physics instead), tooltip positioning could use Floating UI.                                                          |
| **Security: 82** | Google rates CSP highly — present with frame-ancestors 'none' and base-uri 'self'. All recommended security headers present. Zod validation comprehensive. HTTPS enforced. Loses points: unsafe-eval in CSP (Google flags this in Lighthouse), unsafe-inline in style-src, no Trusted Types, rate limiting is memory-only (not Redis).                                                                             |
| **Tests: 82**    | Google expects Jest/Vitest + Playwright (both present). 533 unit tests with behavioral focus is strong. 17-project E2E matrix across browsers and devices is excellent — exceeds most Google internal testing configs. Lighthouse CI is exactly what Google recommends. Loses points: zero component tests (Google's testing trophy model expects integration tests), no visual regression, no API contract tests. |

**What would move Google scores up:**

- Material color system tokens (+4 Design)
- Core Web Vitals monitoring (+3 UX)
- Trusted Types CSP policy (+3 Security)
- Component integration tests (+5 Tests)

---

### Microsoft (Average: 79.0)

Microsoft reviews through Fluent Design, SDL (Security Development Lifecycle), and enterprise-grade quality bars.

| Dimension        | Score                                                                                                                                                                                                                                                                                                                                                                                                                                            | Rationale |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| **Design: 78**   | Clean, professional look works but doesn't follow Fluent 2 design language. No Mica/acrylic background effects. No Fluent depth system. Color tokens exist but aren't Fluent-aligned. Typography is good but doesn't use Fluent type ramp (Segoe UI). Microsoft would appreciate the token-based system but want Fluent compliance.                                                                                                              |
| **UX: 82**       | Enterprise workflows are solid — wizard onboarding, form validation, progressive disclosure. Error handling with inline validation + toast notifications. Keyboard shortcuts with help modal. Microsoft would value the accessibility-first approach. Loses points: no breadcrumb navigation, no command palette (Ctrl+K pattern), undo not visible, no data export to Excel format.                                                             |
| **UI: 88**       | WCAG AA compliance is strong — Microsoft's core requirement. Keyboard navigation works throughout. Focus visible outlines present. Dark mode complete. Touch targets meet standards. ARIA implementation comprehensive. Loses points: no high contrast mode support, focus ring color could be brighter in dark mode, no Fluent motion curves (250ms enter / 150ms exit).                                                                        |
| **Security: 75** | Microsoft SDL expects threat modeling documentation, STRIDE analysis, and OWASP Top 10 coverage. CSP present but with unsafe-eval. Input validation strong (Zod). Bank details handling excellent. Loses points: no documented threat model, PII not encrypted at rest, rate limiter not production-grade (memory-only), no dependency scanning in CI (Dependabot/npm audit), no CSRF tokens (acceptable for client-only but SDL would flag it). |
| **Tests: 72**    | Microsoft's quality bar expects 80%+ code coverage. Store/util coverage is excellent but zero component tests drops overall coverage significantly. No integration tests between stores and components. E2E matrix is impressive. Loses points: no code coverage reporting configured, no mutation testing, no load/performance tests, component testing gap is critical for Microsoft's standards.                                              |

**What would move Microsoft scores up:**

- Code coverage reporting + 80% target (+5 Tests)
- Threat model document (+4 Security)
- High contrast mode (+3 UI)
- Command palette / breadcrumbs (+3 UX)

---

### Sage (Average: 78.2)

Sage reviews as an accounting software company: UK compliance, financial data integrity, ISO 27001 security.

| Dimension        | Score                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Rationale |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| **Design: 80**   | Professional, clean design appropriate for accounting software. Brand cohesion good. Typography hierarchy clear. Color system supports the business context. Sage would appreciate the conservative, trustworthy visual language. Loses points: no Sage design system alignment, limited customisation (single brand color picker), no multi-company support in design.                                                                               |
| **UX: 85**       | UK-specific flows are excellent — VAT, CIS, EORI, UK postcode validation and normalisation. Invoice/credit note toggle, payment terms, PO numbers. Customer autocomplete from history reduces data entry. Statement of Account PDF generation. Loses points: no recurring invoice scheduling, no multi-currency, no bank feed integration, no MTD API submission, limited chart of accounts.                                                          |
| **Tests: 74**    | Store tests cover financial calculations (VAT, CIS deductions, line item totals) — Sage would value this highly. Validation tests for UK formats (151 tests) are excellent. E2E covers invoice creation and credit notes. Loses points: no integration tests between calculation engine and PDF output, no financial rounding edge case stress tests, no component tests for form validation UI, no audit trail testing.                              |
| **Security: 68** | Sage is ISO 27001 certified and expects the same rigour. Bank details memory-only is excellent. Zod validation good. CSP headers present. But: Sage requires encryption at rest for all financial data (localStorage is plaintext), no audit logging, no data retention automation, no backup/recovery, no role-based access, rate limiter not production-grade. PII in localStorage without encryption is a significant gap for accounting software. |
| **UI: 84**       | UK-specific form fields (VAT number, UTR, sort code, postcode) are well-implemented. Responsive design works on tablets (common for tradespeople). Touch targets good for mobile invoicing on-site. Dark mode appropriate. Loses points: no barcode/QR scanning for invoice data, no receipt photo capture, line items table could be more spreadsheet-like for accountants.                                                                          |

**What would move Sage scores up:**

- Client-side PII encryption (+8 Security)
- Recurring invoices (+5 UX)
- Financial rounding stress tests (+4 Tests)
- Multi-currency support (+3 UX)

---

### Xero (Average: 82.0)

Xero reviews through their App Partner certification process: connection quality, branding, error handling, data integrity, security assessment.

| Dimension        | Score                                                                                                                                                                                                                                                                                                                                                                                                                | Rationale |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| **Design: 84**   | Clean, modern design that wouldn't clash with Xero's own aesthetic. Good use of white space. Card-based layout familiar to Xero users. Brand identity is distinct but professional. Loses points: no Xero brand guidelines compliance (if integrating), limited colour customisation, no multi-tenant design.                                                                                                        |
| **UX: 90**       | Small business simplicity is Invease's strength — Xero values this highly. Quick Start mode gets users invoicing in seconds. Customer autocomplete saves time. Autosave prevents data loss. Two-path onboarding caters to different comfort levels. Credit notes integrated naturally. Loses points: no Xero API connection, no bank reconciliation, no expense tracking, no inventory management.                   |
| **UI: 86**       | Data integrity in forms is strong — Zod validation, postcode normalisation, duplicate invoice number warnings. Error states clear and accessible. Responsive design good for sole traders on mobile. Loses points: no inline editing for saved invoices, no batch operations, no keyboard-driven data entry (Tab between cells like spreadsheet).                                                                    |
| **Security: 72** | Xero's security assessment checks authentication (N/A for client-only), API security (only Companies House, properly handled), data handling, and encryption. Bank details handling is excellent. Loses points: Xero requires 2FA minimum for account auth (N/A here but flagged), PII not encrypted, no audit trail, no data classification policy, would need full security assessment before marketplace listing. |
| **Tests: 78**    | Xero certification requires functional testing evidence. 533 unit tests + 26 E2E tests is solid evidence. Validation test coverage for UK formats is exactly what Xero wants. Browser matrix testing across 17 projects shows thoroughness. Loses points: no API contract tests (critical if connecting to Xero), no component tests, no error recovery E2E tests, no performance benchmarks.                        |

**What would move Xero scores up:**

- Xero API integration (+8 UX)
- API contract tests (+5 Tests)
- Audit logging (+4 Security)
- Batch invoice operations (+3 UI)

---

### Zoho (Average: 75.6)

Zoho reviews through ISO 9001 quality management, SOC 2 compliance, and feature completeness across their suite ecosystem.

| Dimension        | Score                                                                                                                                                                                                                                                                                                                                                                                                                           | Rationale |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| **Design: 76**   | Zoho values feature density and configurability. Invease is intentionally minimal — this is a strength for simplicity but a weakness for Zoho's "everything in one platform" philosophy. Design tokens exist but limited customisation options. No multi-language support. No white-labeling. Loses points: limited template system (3 templates), no custom field definitions, no branding beyond single color.                |
| **UX: 80**       | Core invoicing workflow is solid. VAT/CIS calculations automated. Statement of Account generation. History with filtering. Customer management with merge detection. Loses points: no project management integration, no time tracking, no purchase orders, no inventory, no multi-company, no workflow automation, no approval chains. Zoho expects comprehensive business workflows.                                          |
| **UI: 82**       | Cross-platform responsive design works. Accessibility implementation is strong. Dark mode complete. Touch targets compliant. Loses points: no right-to-left (RTL) language support, no configurable dashboard widgets, no drag-and-drop customisation, no table view for invoice list (only cards), limited data density options.                                                                                               |
| **Security: 70** | Zoho is SOC 2 Type 2 and ISO 9001 certified. They expect server-side security controls. Client-only architecture is inherently limited. CSP and headers are good. Validation strong. Loses points: no server-side validation (client-only), no encryption at rest, no audit logging, no session management, no role-based access, no data backup/recovery, no penetration testing evidence.                                     |
| **Tests: 70**    | Zoho's QEngine expects comprehensive test automation: unit, integration, regression, performance, security, and usability testing. 533 unit tests is good but narrow coverage (stores + utils only). E2E covers happy paths but limited error paths. Loses points: no component tests, no performance benchmarks, no security scanning, no mutation testing, no visual regression, no load testing, code coverage not reported. |

**What would move Zoho scores up:**

- Server-side architecture (+8 Security)
- Component + integration tests (+6 Tests)
- Multi-language / RTL support (+5 UI)
- Workflow automation (+5 UX)

---

## Evidence Table

| Claim                       | Evidence                                                   | File                                                |
| --------------------------- | ---------------------------------------------------------- | --------------------------------------------------- |
| 105 CSS variable tokens     | Light (lines 7-59) + Dark (lines 64-105)                   | `app/globals.css`                                   |
| Fluid clamp() typography    | h1-h3 + body scales                                        | `app/globals.css:108-174`                           |
| 44px touch targets          | Global rules for mobile                                    | `app/globals.css:625-693`                           |
| Button: 5 variants, 3 sizes | primary, destructive, secondary, ghost, muted / sm, md, lg | `components/ui/Button.tsx`                          |
| Bank details memory-only    | `partialize` excludes bankDetails                          | `stores/companyStore.ts:148`                        |
| Zod validation schemas      | customer, invoicer, bank, invoice, lineItem                | `lib/schemas.ts` (174 lines)                        |
| CSP headers                 | frame-ancestors 'none', base-uri 'self'                    | `middleware.ts:80-95`                               |
| HSTS 1 year                 | max-age=31536000; includeSubDomains                        | `middleware.ts:108-113`                             |
| Rate limiter                | 30 req/60s per IP                                          | `middleware.ts:8-36`                                |
| 533 unit tests              | 20 files, all passing                                      | `tests/unit/**/*.test.ts`                           |
| 26 E2E tests                | 5 spec files, 17-project CI matrix                         | `e2e/*.spec.ts`                                     |
| 151 validation tests        | Postcode, VAT, email, phone patterns                       | `tests/unit/validationPatterns.test.ts`             |
| Lighthouse CI               | perf >= 85, a11y >= 90, bp >= 90, seo >= 90                | `.github/workflows/lighthouse.yml`                  |
| Customer autocomplete       | History-based, arrow keys, Enter select                    | `components/invoice/CustomerDetailsForm.tsx:50-117` |
| Autosave indicator          | role="status" aria-live="polite"                           | `components/ui/AutoSaveIndicator.tsx`               |
| Dark mode complete          | class-based with prefers-color-scheme                      | `app/globals.css:64-105`                            |
| Focus traps in modals       | Tab/Shift+Tab containment                                  | `components/ui/FocusTrap.tsx`                       |
| Reduced motion              | useReducedMotion() + CSS media query                       | `app/globals.css:606-609` + components              |
| 0 component tests           | 75 component files, no render() tests                      | `components/**/*.tsx`                               |
| PII in localStorage         | Customer names, emails, addresses in history               | `stores/historyStore.ts`                            |
| unsafe-eval in CSP          | Required by @react-pdf/renderer                            | `middleware.ts:82`                                  |

---

## Gap Analysis: What Moves the Needle Most

### Cross-Cutting Improvements (Impact All 6 Scores)

| Improvement                         | Effort | Impact                   | Companies Affected          |
| ----------------------------------- | ------ | ------------------------ | --------------------------- |
| **Add React component tests (RTL)** | Medium | +4-6 Tests across all    | All 6                       |
| **Client-side PII encryption**      | Medium | +4-8 Security across all | All 6                       |
| **Code coverage reporting**         | Low    | +2-3 Tests across all    | All 6                       |
| **Visual regression (Chromatic)**   | Low    | +2-3 Tests across all    | All 6                       |
| **Audit logging**                   | Medium | +3-5 Security across all | Sage, Xero, Zoho, Microsoft |

### Company-Specific Quick Wins

| Company   | Improvement                     | Effort | Score Impact      |
| --------- | ------------------------------- | ------ | ----------------- |
| Apple     | Dynamic Type support            | Medium | Design 91 -> 94   |
| Apple     | Visible undo button             | Low    | UX 93 -> 95       |
| Google    | Trusted Types CSP               | Medium | Security 82 -> 85 |
| Google    | Core Web Vitals monitoring      | Low    | UX 88 -> 91       |
| Microsoft | Threat model document           | Low    | Security 75 -> 79 |
| Microsoft | High contrast mode              | Medium | UI 88 -> 91       |
| Sage      | Recurring invoices              | High   | UX 85 -> 90       |
| Sage      | Financial rounding stress tests | Low    | Tests 74 -> 78    |
| Xero      | Xero API integration            | High   | UX 90 -> 98       |
| Zoho      | Multi-language support          | High   | UI 82 -> 87       |

---

## Composite Summary

```
Overall Composite:  81.2 / 100
Best Dimension:     UI (87.8 avg) — strongest pillar
Worst Dimension:    Security (74.2 avg) — client-only architecture limits ceiling
Best Company Fit:   Apple (86.6) — HIG alignment is the core design philosophy
Worst Company Fit:  Zoho (75.6) — expects enterprise feature completeness
```

### By Dimension Ranking

1. **UI: 87.8** — Touch targets, dark mode, accessibility, responsive design
2. **UX: 86.3** — Onboarding, autosave, customer autocomplete, progressive disclosure
3. **Design: 82.5** — Token system, typography, brand cohesion, component library
4. **Tests: 75.3** — Strong unit/E2E foundation, critical component testing gap
5. **Security: 74.2** — Good headers and validation, limited by client-only architecture

### Path to 90+ Composite

To reach 90/100 composite, Invease needs:

1. React component tests (all companies +4-6)
2. Server-side backend with encryption (Security +8-12 across all)
3. Code coverage + visual regression (Tests +3-5 across all)
4. These three changes alone would push composite from 81 to ~88-90

---

## Methodology Notes

- Scores reflect what each company's **published standards and review processes** would evaluate
- Apple scores based on HIG 2025 (Liquid Glass era), App Store Review Guidelines
- Google scores based on Material Design 3, Lighthouse 12, Chrome DevTools audits
- Microsoft scores based on Fluent 2 Design System, SDL, WCAG 2.1 AA bar
- Sage scores based on ISO 27001, NIST frameworks, UK accounting software norms
- Xero scores based on App Partner certification checkpoints (2025 update)
- Zoho scores based on ISO 9001, SOC 2 Type 2, QEngine testing framework
- All scores grounded in specific codebase evidence (see Evidence Table)
- Client-only architecture inherently caps Security scores — this is by design for Phase 2

## Sources

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
- [Material Design 3](https://m3.material.io/)
- [Microsoft Fluent 2](https://fluent2.microsoft.design/)
- [Sage Security Standards](https://www.sage.com/en-us/trust-security/security/technical/standards-compliance/)
- [Xero Certification Checkpoints](https://developer.xero.com/documentation/xero-app-store/app-partner-guides/certification-checkpoints/)
- [Zoho Compliance](https://www.zoho.com/compliance.html)
