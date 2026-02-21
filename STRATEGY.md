# Invease Strategic Planning Document

**Created:** 2026-02-17
**Status:** ACTIVE - Ready for senior dev review
**Last Updated:** 2026-02-17

---

## Vision Statement

Invease is a **free invoice generator** that will eventually become part of a larger **K&R Accountants toolkit** supporting:

- Invoice creation → Expense tracking → MTD submission to HMRC
- Free tier for K&R clients, premium SAAS for general public
- K&R acts as MTD agent for clients who want hands-off submission

---

## User Context (Confirmed)

| Aspect               | Answer                                                           |
| -------------------- | ---------------------------------------------------------------- |
| **Primary Users**    | K&R clients initially, then general public                       |
| **Use Frequency**    | Weekly or ad-hoc monthly                                         |
| **Device Split**     | ~50/50 mobile and desktop                                        |
| **User Types**       | Contractors (laptop), builders (phone), office workers (desktop) |
| **Current Feedback** | One real user said "it was good"                                 |
| **Business Model**   | Free value-add now → Premium SAAS later                          |

---

## Current Feature Inventory

### ✅ Implemented & Working

| Feature                            | Status   | Notes                                  |
| ---------------------------------- | -------- | -------------------------------------- |
| Multi-step onboarding (5 steps)    | ✅ Works | **Pain point - too heavy**             |
| Companies House API lookup         | ✅ Works | Auto-fills company details             |
| UK VAT calculations (0%, 5%, 20%)  | ✅ Works | Standard/reduced/zero-rated            |
| Reverse charge VAT                 | ✅ Works | For B2B cross-border                   |
| CIS (Construction Industry Scheme) | ✅ Works | 20%/30% deductions                     |
| PDF generation & download          | ✅ Works | Client-side, no server needed          |
| Invoice history (localStorage)     | ✅ Works | Last 50 invoices saved                 |
| Recent customers quick-fill        | ✅ Works | Last 5 customers                       |
| Customizable invoice numbering     | ✅ Works | Patterns: PREFIX-YEAR-SEQ              |
| Logo upload                        | ✅ Works | 2MB max, PNG/JPEG                      |
| Dark mode                          | ✅ Works | System preference + manual toggle      |
| PWA (installable)                  | ✅ Works | Service worker, manifest               |
| Offline support                    | ✅ Works | Cached assets work offline             |
| Apple HIG accessibility            | ✅ Works | 44px touch targets, ARIA, keyboard nav |
| Haptic feedback                    | ✅ Works | Vibration API on supported devices     |

### ⚠️ Feature Flags (Disabled in config/site.ts)

```javascript
features: {
  multipleInvoices: false,  // Manage multiple drafts
  emailInvoice: false,      // Send via email
  invoiceHistory: false,    // Actually IS implemented
  logoUpload: true,
}
```

### ❌ Not Implemented Yet

| Feature                       | Priority | Notes                         |
| ----------------------------- | -------- | ----------------------------- |
| Mobile share (WhatsApp, etc.) | **HIGH** | Use Web Share API - FREE      |
| Email invoice                 | MEDIUM   | Needs SendGrid or similar ($) |
| Recurring invoices            | MEDIUM   | Schedule + reminder           |
| Payment tracking              | MEDIUM   | Mark paid/unpaid              |
| Client database               | LOW      | Store customer details        |
| Multi-currency                | LOW      | GBP only currently            |
| Expense tracking              | BACKLOG  | Future phase                  |
| MTD HMRC submission           | BACKLOG  | Future phase                  |

---

## Mobile Sharing Solution (FREE)

### Web Share API - Native Device Sharing

The [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) allows sharing files directly to WhatsApp, Telegram, Email, Messages, etc. **No SendGrid needed.**

**How it works:**

```javascript
// After PDF is generated
if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
  await navigator.share({
    title: "Invoice #INV-001",
    text: "Please find attached invoice",
    files: [pdfFile],
  });
}
```

**Compatibility:**

- ✅ iOS Safari (14.5+)
- ✅ Android Chrome
- ✅ Android Firefox
- ⚠️ Desktop: Limited (macOS Safari works)

**Fallback:** Download button for unsupported browsers.

**Implementation:** Add "Share" button next to "Download PDF" that triggers native share sheet.

---

## Competitor Analysis

### Xero Invoice

- **Strengths:** Clean UX, mobile app, integrations, recurring invoices
- **Weaknesses:** Paid ($15+/month), complex for simple invoicing
- **UX Pattern:** Recent updates focus on cleaner invoice list view, due date tags, light/dark mode
- **Source:** [Xero Blog](https://blog.xero.com/product-updates/updates-to-our-xero-apps/)

### Zoho Invoice

- **Strengths:** Free tier, 4.8★ mobile app, expense tracking, payment reminders
- **Weaknesses:** Mobile editing limitations, template constraints
- **UX Pattern:** "Create and send invoices in just a tap", snap expense receipts
- **Source:** [Zoho Invoice Mobile](https://www.zoho.com/us/invoice/mobile-apps/)

### QuickBooks

- **Strengths:** MTD compatible, accountant-friendly, robust reporting
- **Weaknesses:** Expensive, overkill for simple invoicing
- **Source:** [QuickBooks MTD](https://quickbooks.intuit.com/uk/making-tax-digital/software/)

### What Competitors Do Well (To Adopt)

1. **One-tap invoice creation** - Zoho lets you invoice in seconds
2. **Progress visibility** - Xero shows invoice status at a glance
3. **Receipt capture** - Snap photos of expenses (future feature)
4. **Payment reminders** - Automatic follow-up
5. **Clean mobile UX** - Nearly full-featured mobile experience

### Invease Differentiators

1. **UK-First** - VAT, CIS, Companies House built-in
2. **Privacy** - No account required, data stays local
3. **Free** - No subscription for core features
4. **K&R Support** - Direct accountant assistance available
5. **Simple** - Just invoicing, not full accounting

---

## The Onboarding Problem & Apple-Style Solution

### Current Problem

5-step wizard required before ANY action. User friction is high.

### How Apple Would Do It

**Apple Design Principles:**

1. **Defer decisions** - Don't ask until needed
2. **Progressive disclosure** - Show only what's relevant now
3. **Reduce friction** - Minimize required inputs
4. **Smart defaults** - Pre-fill where possible

### Proposed "Quick Start" Flow

```
┌─────────────────────────────────────────────────────────┐
│  CURRENT FLOW (5 steps before invoicing)                │
│  ────────────────────────────────────────               │
│  Open App → Business Type → Company Details →           │
│  Tax Details → Bank Details → Review → FINALLY Invoice  │
└─────────────────────────────────────────────────────────┘

                         ↓ CHANGE TO ↓

┌─────────────────────────────────────────────────────────┐
│  APPLE-STYLE FLOW (Invoice immediately)                 │
│  ────────────────────────────────────────               │
│  Open App → Start Invoice → Fill as you go              │
│  ↓                                                      │
│  "Save my details for next time?" → Optional setup      │
└─────────────────────────────────────────────────────────┘
```

### Implementation Options

**Option A: "Quick Invoice" Button (Recommended)**

- Skip onboarding entirely
- Show single-page invoice form
- FROM/TO fields inline
- "Save my details" checkbox at bottom
- First-time users get tooltip hints

**Option B: Minimal Onboarding (2 steps max)**

1. Business type (sole trader/company) - affects VAT/CIS display
2. Bank details (needed for payment info)

- Everything else can be entered on invoice directly

**Option C: Template Selection**

- Show 3 pre-filled sample invoices
- User picks closest match and modifies
- Progressive profiling as they use

---

## Product Roadmap

### Phase 1: Production Ready (Current Focus)

**Goal:** Ship to production, ready for senior dev review

| Task                            | Status  | Priority |
| ------------------------------- | ------- | -------- |
| Fix mobile Safari overflow      | ✅ Done | -        |
| Fix Companies House API         | ✅ Done | -        |
| Add Web Share API for mobile    | ✅ Done | -        |
| Implement Quick Start mode      | ✅ Done | -        |
| Add autoprefixer for CSS compat | 🔲 TODO | MEDIUM   |
| Cross-browser testing           | 🔲 TODO | MEDIUM   |
| Lighthouse audit (90+ scores)   | 🔲 TODO | MEDIUM   |
| Senior dev code review          | 🔲 TODO | HIGH     |

### Phase 2: User Testing

**Goal:** Get feedback from 10+ K&R clients

| Task                                                      | Priority |
| --------------------------------------------------------- | -------- |
| Deploy to production domain (invoices.kraccountants.com?) | HIGH     |
| Create feedback mechanism                                 | MEDIUM   |
| Track usage analytics (Vercel Analytics)                  | LOW      |
| Iterate based on feedback                                 | HIGH     |

### Phase 3: Premium Features

**Goal:** Features that differentiate and enable monetization

| Feature            | Free Tier   | Premium   |
| ------------------ | ----------- | --------- |
| Basic invoicing    | ✅          | ✅        |
| Invoice history    | ✅ (50 max) | Unlimited |
| PDF download       | ✅          | ✅        |
| Mobile share       | ✅          | ✅        |
| Email delivery     | ❌          | ✅        |
| Recurring invoices | ❌          | ✅        |
| Payment tracking   | ❌          | ✅        |
| Client database    | ❌          | ✅        |
| Custom branding    | ❌          | ✅        |
| Priority support   | ❌          | ✅        |

### Phase 4: Extended Toolkit (Future)

**Goal:** Full K&R client toolkit

| Feature                          | Notes                     |
| -------------------------------- | ------------------------- |
| Expense tracking                 | Snap receipts, categorize |
| MTD income/expense submission    | HMRC API integration      |
| Tax summary reports              | For K&R to review         |
| Multi-user (accountant + client) | Shared access             |
| Native iOS/Android apps          | When demand exists        |

---

## MTD Integration Notes (For Future Reference)

### HMRC Requirements (April 2026+)

- Applies to self-employed with income >£50,000
- Must keep digital records
- Submit quarterly updates via compatible software
- **K&R is an MTD agent** - can submit on behalf of clients

### API Integration

- [HMRC Developer Hub](https://developer.service.hmrc.gov.uk/guides/income-tax-mtd-end-to-end-service-guide/)
- Requires sandbox testing → production approval
- Must meet HMRC's minimum functional standards

### Compatible Software List

- [GOV.UK MTD Software](https://www.gov.uk/guidance/find-software-thats-compatible-with-making-tax-digital-for-income-tax)

---

## Technical Architecture Summary

```
invease/
├── app/                    # Next.js App Router
│   ├── api/company-search/ # Companies House proxy
│   ├── layout.tsx          # Root layout + PWA config
│   ├── page.tsx            # Main app (single page)
│   └── globals.css         # Design tokens
├── components/
│   ├── ui/                 # Reusable (Button, FormField, etc.)
│   ├── invoice/            # Invoice-specific
│   ├── wizard/             # Onboarding steps
│   ├── settings/           # User preferences
│   └── pdf/                # PDF rendering
├── stores/                 # Zustand state
│   ├── companyStore.ts     # Company (persisted)
│   ├── invoiceStore.ts     # Invoice draft (session)
│   ├── settingsStore.ts    # User prefs (persisted)
│   └── historyStore.ts     # Invoice history (persisted)
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities
│   ├── companiesHouse.ts   # UK company API
│   ├── validationPatterns.ts # UK validation (VAT, postcode)
│   └── haptics.ts          # Vibration feedback
├── config/
│   ├── site.ts             # Site config + feature flags
│   └── constants.ts        # VAT rates, business types
└── public/
    ├── manifest.json       # PWA manifest
    └── sw.js               # Service worker
```

### Architecture Improvements (P0–P3 Refactoring)

| Stage | Description                                   | Status  | Score    |
| ----- | --------------------------------------------- | ------- | -------- |
| P0    | InvoicePDF.tsx monolith split (675→250 lines) | ✅ Done | 9.5→9.6  |
| P1    | Document type switch confirmation             | ✅ Done | 9.6→9.7  |
| P2    | Remaining duplication cleanup                 | ✅ Done | 9.7→9.8  |
| P3    | UX polish (validation + loading)              | 🔲 TODO | 9.8→10.0 |

---

## Immediate Next Steps

### Before More Development:

1. ✅ Strategic planning document (this file)
2. 🔲 Stakeholder sign-off on Quick Start approach
3. 🔲 Confirm production domain

### Development Priority:

1. **Web Share API** - Native sharing for mobile (1-2 hours)
2. **Quick Start mode** - Skip onboarding option (4-6 hours)
3. **CSS compatibility** - Add autoprefixer (30 min)
4. **Testing** - Cross-browser, Lighthouse audit (2-3 hours)

### Questions for Stakeholder:

1. Approve "Quick Start" approach for onboarding?
2. Production domain: `invoices.kraccountants.com` or separate?
3. When to start user testing with K&R clients?
4. Budget for iOS developer account ($99/year) - when ready?

---

## Decision Log

| Date       | Decision                          | Rationale                                                                 | Made By           |
| ---------- | --------------------------------- | ------------------------------------------------------------------------- | ----------------- |
| 2026-02-17 | Created strategy doc              | Need clarity before more dev                                              | Team              |
| 2026-02-17 | Use Web Share API for mobile      | Free, native, no backend                                                  | Research          |
| 2026-02-17 | Prioritize Quick Start mode       | Fix main UX pain point                                                    | Research          |
| 2026-02-17 | Expense tracking to backlog       | Not in initial scope                                                      | Stakeholder       |
| 2026-02-17 | Implemented Web Share API         | Share button in PDF preview modal                                         | Dev               |
| 2026-02-17 | Bank details opt-in persistence   | Checkbox to remember locally, no auth needed                              | Stakeholder + Dev |
| 2026-02-21 | P0: Split InvoicePDF.tsx monolith | Reduce 675-line file, eliminate 3-way CIS duplication, extract bank utils | Dev               |
| 2026-02-21 | P1: Doc type switch confirmation  | Prevent accidental data loss on Invoice↔Credit Note toggle                | Dev               |
| 2026-02-21 | P2: Duplication cleanup           | Replace inline dates with getTodayISO(), extract copyLineItemsToStore     | Dev               |

---

## References

### Official Design Guidelines

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) - Primary UX reference
  - Key sections: [Inputs](https://developer.apple.com/design/human-interface-guidelines/inputs), [Layout](https://developer.apple.com/design/human-interface-guidelines/layout), [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
  - iOS 26 introduces "Liquid Glass" design language
- [Google Material Design 3](https://m3.material.io/) - Secondary UX reference
  - [Material 3 Expressive](https://m3.material.io/blog/material-3-expressive-update) - Springy animations, emotional design
  - Key sections: [Components](https://m3.material.io/components), [Foundations](https://m3.material.io/foundations)

### Competitor Apps

- [Xero Invoice App](https://www.xero.com/us/explore/invoice-app/)
- [Zoho Invoice Mobile](https://www.zoho.com/us/invoice/mobile-apps/)

### Technical Documentation

- [Web Share API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)
- [HMRC MTD Guide](https://developer.service.hmrc.gov.uk/guides/income-tax-mtd-end-to-end-service-guide/)
- [GOV.UK MTD Software List](https://www.gov.uk/guidance/find-software-thats-compatible-with-making-tax-digital-for-income-tax)

### UX Best Practices

- [Fintech UX Best Practices 2026](https://www.eleken.co/blog-posts/fintech-ux-best-practices)
