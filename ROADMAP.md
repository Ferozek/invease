# Invease: Complete Product Roadmap

**Created:** 2026-02-21
**Last Updated:** 2026-02-21
**Status:** Phases 1-2 complete. Phase 2.5 next.

---

## Where We Are Now

**Invease v1.0 — "The Invoice Generator"**

A single-page web app that creates professional UK invoices. Everything runs in the browser. No accounts, no backend, no server-side data. PWA-installable.

| What works                     | Tech                         |
| ------------------------------ | ---------------------------- |
| Invoice + credit note creation | React 19, Next.js 16         |
| UK VAT / CIS / Companies House | Client-side calculations     |
| PDF generation + download      | @react-pdf/renderer          |
| Invoice history (50 max)       | localStorage                 |
| Mobile sharing (WhatsApp etc.) | Web Share API                |
| Offline support                | Service worker PWA           |
| Error tracking                 | Sentry                       |
| Legal compliance               | GDPR, HMRC, Companies House  |
| Feedback mechanism             | Footer mailto: link          |
| Analytics                      | Vercel Analytics (free tier) |

**Production Readiness: 10/10**

---

## User Context

| Aspect               | Answer                                                           |
| -------------------- | ---------------------------------------------------------------- |
| **Primary Users**    | K&R clients initially, then general public                       |
| **Use Frequency**    | Weekly or ad-hoc monthly                                         |
| **Device Split**     | ~50/50 mobile and desktop                                        |
| **User Types**       | Contractors (laptop), builders (phone), office workers (desktop) |
| **Current Feedback** | One real user said "it was good"                                 |
| **Business Model**   | Free value-add now -> Premium SAAS later                         |

---

## The Complete Journey

```
Phase 2.5: Dashboard & Payment Tracking     <- still client-side       NEXT
Phase 3:   Backend + Email + Recurring       <- backend enters          PLANNED
Phase 3.5: Expo Mobile App                   <- native mobile           PLANNED
Phase 4:   Expense Tracking                  <- camera, receipts        PLANNED
Phase 5:   MTD / HMRC Integration            <- the business case       PLANNED
Phase 6:   Multi-User (Accountant + Client)  <- the platform            PLANNED
```

Each phase builds naturally on the previous one. No phase requires rewriting what came before.

---

## Competitive Landscape

### How we compare

|                  | Zoho Books Free      | Xero (from £29/mo) | **Invease**                 |
| ---------------- | -------------------- | ------------------ | --------------------------- |
| Price            | Free (<£35K revenue) | £29/mo             | **Free (no cap)**           |
| Account required | Yes                  | Yes                | **No**                      |
| Data stored      | Their servers        | Their servers      | **Your device only**        |
| Setup time       | 10-15 min            | 10-15 min          | **30 seconds**              |
| Complexity       | Full accounting      | Full accounting    | **Just invoicing**          |
| Offline works    | No                   | No                 | **Yes (PWA)**               |
| UK-specific      | Generic              | Generic            | **UK-first (VAT, CIS, CH)** |

### Competitor MTD pricing

- **Zoho Books:** Free plan includes MTD VAT, MTD ITSA, SA103F/S reports. Revenue cap <£35K. 1,000 invoices/year.
- **Xero:** No free tier. Starts £29/mo (£5.80 promo for 3 months). Full MTD support.
- **Clear Books:** Free MTD software for sole traders + landlords. Quarterly HMRC submissions.
- **QuickFile:** Free, HMRC-recognised, full MTD ITSA support.

### Our strategic position

Invease can't out-feature Zoho or Xero. It wins on **simplicity, speed, and privacy**:

- Fastest way to create a UK invoice (30 seconds, no account)
- Data never leaves the user's device
- Free forever with no revenue cap
- UK-first: VAT, CIS, Companies House built in

### Features to adopt from competitors

| Feature                   | Who has it              | Our phase | Why                                   |
| ------------------------- | ----------------------- | --------- | ------------------------------------- |
| Payment status tracking   | Everyone                | 2.5       | Table stakes — "who owes me?"         |
| Automated payment chasers | Xero, Zoho              | 3         | Xero's killer feature                 |
| Receipt scanning          | Zoho (free!), Xero      | 4         | Camera -> categorise -> done          |
| SA103F/SA103S reports     | Zoho (free!)            | 5         | Self-employment summary from data     |
| CIS returns to HMRC       | Zoho (paid)             | 5         | Valuable for K&R construction clients |
| Quarterly MTD submissions | Zoho, Xero, Clear Books | 5         | Legal requirement from April 2026     |

### Features NOT to add

- **Bank reconciliation** — full accounting software territory, not our lane
- **Full bookkeeping/ledger** — we're an invoice generator, not Sage
- **Payroll** — out of scope entirely

---

## Completed Phases

### Phase 1: Core Production (COMPLETE)

| Area               | Status | Key items                                                                                               |
| ------------------ | ------ | ------------------------------------------------------------------------------------------------------- |
| Legal & Compliance | Done   | Privacy Policy, Terms (MTD disclaimer), Accessibility Statement, GDPR, footer links                     |
| Security           | Done   | CSP headers, rate limiting (30 req/min), HSTS, bank details NEVER persisted, `unsafe-eval` dev-only     |
| PWA                | Done   | Service worker v2, offline fallback, PNG icons (192/512), iOS splash screens, manifest                  |
| Error Tracking     | Done   | Sentry v10.39.0, `instrumentation-client.ts` (Turbopack-compatible), source maps, global error boundary |
| SEO                | Done   | robots.txt, sitemap.xml, enhanced metadata, canonical URL                                               |
| Build & Compat     | Done   | Autoprefixer, cross-browser testing, Lighthouse CI (90+ scores)                                         |
| Code Quality       | Done   | InvoicePDF split (675->250 lines), doc type switch confirm, deduplication, UX polish                    |

### Phase 1.5: Legal Compliance (COMPLETE)

| Item                                                   | Status                                                   |
| ------------------------------------------------------ | -------------------------------------------------------- |
| ICO GDPR self-assessment                               | Done                                                     |
| Companies House OGL v3.0 attribution                   | Done                                                     |
| Supply date field (HMRC tax point)                     | Done                                                     |
| Data breach notification procedure                     | Done (`DATA_BREACH_PROCEDURE.md`)                        |
| Lawful basis (legitimate interests) in Privacy Policy  | Done                                                     |
| Complaints procedure (ICO escalation, June 2026 ready) | Done                                                     |
| Static legal page dates                                | Done                                                     |
| Solicitor review of Privacy/Terms                      | **Pending (£200-400, recommended before public launch)** |

**Legal compliance detail:**

| Requirement                    | Status | Notes                                                                                         |
| ------------------------------ | ------ | --------------------------------------------------------------------------------------------- |
| **GDPR**                       | Done   | Lawful basis documented, retention policy, subject access, right to erasure, breach procedure |
| **HMRC VAT Invoice**           | Done   | All required fields: sequential number, dates, seller/buyer, line items, VAT breakdown, CIS   |
| **Companies House**            | Done   | OGL v3.0 attribution, API rate limited, public info only                                      |
| **Invoice Legal Requirements** | Done   | Company reg, VAT number, payment terms, all per UK law                                        |

### Phase 2: User Testing Prep (COMPLETE)

| Item                                                        | Status                           |
| ----------------------------------------------------------- | -------------------------------- |
| Feedback mechanism (Footer mailto: admin@kraccountants.com) | Done                             |
| Vercel Analytics enabled (free tier)                        | Done                             |
| Deploy to production domain                                 | **Pending stakeholder decision** |
| Test with 10+ K&R clients                                   | **Pending deployment**           |

### Full Feature Inventory (Already Built)

- Apple HIG Touch Targets (44px minimum)
- Haptic Feedback (Vibration API)
- Animation System (Framer Motion) with Reduced Motion Support
- Autocomplete attributes on form inputs
- Quick Start mode (Skip -> straight to invoice with sample data)
- Dark Mode Support (system preference + manual toggle)
- Responsive Design (18 device profiles tested)
- E2E Test Coverage (54+ Playwright tests across 9 suites)
- Auto-save with visual indicator
- Undo/Redo functionality (Cmd+Z / Cmd+Shift+Z via Zundo)
- Web Share API integration (mobile)
- Email Invoice (Web Share on mobile, mailto: on desktop)
- Swipe-to-delete gestures
- UK VAT/CIS calculations (0%, 5%, 20%, reverse charge, CIS 20%/30%)
- PDF generation with A4 skeleton loading
- Companies House integration with OGL v3.0 attribution
- Credit notes (toggle, CN numbering, PDF, history integration)
- Invoice numbering (customisable patterns: INV-{YEAR}-{SEQ:3} etc.)
- Logo upload (2MB max, PNG/JPEG)
- Legal pages (Privacy, Terms with MTD, Accessibility)
- Security headers & rate limiting
- PWA (offline page, service worker, PNG icons, iOS splash)
- Sentry error tracking (production, Turbopack-compatible)
- Centralized logging (Sentry-integrated)
- Zod validation schemas
- Shared utilities (invoiceUtils, dateUtils, cisUtils, bankDetailsUtils, formatters)
- Keyboard shortcuts (Cmd+Shift+D download, Cmd+Shift+N new, etc.)
- Payment QR code component
- Recent customers dropdown (last 5)

### Nice-to-Have for v1.1

- Open Graph image (`/public/og-image.png`)
- Structured data (JSON-LD)
- First-run hints and tooltips
- Keyboard shortcut hints
- Custom analytics events (invoice created, PDF downloaded)
- Solicitor sign-off on legal docs (£200-400)

---

## Phase 2.5: "Know Your Business" (Dashboard)

**Status:** IN PROGRESS (~90% complete)
**Apple principle:** _Surface intelligence from data you already have._

We already have invoice history. Turn it into insights — no new data entry needed.

### What to build

| Feature              | Why                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| **Dashboard view**   | Total invoiced this month/quarter/year, outstanding amount                                             |
| **Payment status**   | Toggle invoices paid/unpaid/overdue (simple field on SavedInvoice)                                     |
| **Overdue alerts**   | Payment terms + invoice date = automatic overdue detection                                             |
| **Client list**      | Auto-built from invoice history (recentCustomers already exists)                                       |
| **Quick stats**      | "3 invoices overdue, £2,450 outstanding"                                                               |
| **Bank transfer UX** | Prominent payment section on PDF, auto-generated payment reference, QR code with bank details + amount |

### Why this phase matters

- **No backend needed** — extends existing localStorage history
- **Stickiness** — users come back to check their dashboard
- **Natural evolution** — "you made invoices, here's what they tell you"
- **Sets up Phase 3** — payment tracking needs "who owes me" before "remind them"

### Technical approach

- Add `status: 'draft' | 'sent' | 'paid' | 'overdue'` to `SavedInvoice` type
- Add `paidDate?: string` and `sentDate?: string` fields
- New `/dashboard` route (or dashboard tab on home page)
- Reuse existing `historyStore.ts` — add selectors for filtering by status
- Auto-detect overdue: `if (status !== 'paid' && dueDate < today)`

### Bank transfer UX improvements (no backend needed)

| Improvement                      | Detail                                                       |
| -------------------------------- | ------------------------------------------------------------ |
| Prominent payment section on PDF | Larger, clearer bank details area                            |
| Auto-generated payment reference | Invoice number as reference so user can match bank transfers |
| QR code on PDF                   | Encode sort code + account number + amount + reference       |
| "Mark as paid" button            | Manual toggle on history panel                               |

### Dashboard design direction (Apple pattern)

Use Apple Card / Stocks / Health patterns — NOT Activity Rings. Finance = awareness, not behaviour change.

| Component             | What                                                     | Apple inspiration         |
| --------------------- | -------------------------------------------------------- | ------------------------- |
| **Collection ring**   | Single ring: "£5,200 collected of £8,000 invoiced" (65%) | Apple Card spending wheel |
| **Stat cards**        | "3 overdue · £2,450 outstanding" — glanceable cards      | Health app summary cards  |
| **Monthly sparkline** | Income trend over last 6 months                          | Stocks app                |
| **Status dots**       | Green (paid), amber (sent), red (overdue) per invoice    | Activity app daily view   |

**Do NOT add:** streaks, badges, achievements, multiple rings, leaderboards, gamification. This is a business tool, not fitness.

### Edge cases & Apple UX patterns (apply across all phases)

Think "how would Apple handle this?" for every edge case. Clarity over cleverness.

| Edge Case                                                  | How Apple Would Handle It                                                                                                                                                                                                                                                              | Phase                        |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| **Negative outstanding (prepayment/overpayment)**          | Show "Credit Balance" in green with "Customer has prepaid" — don't show confusing negative numbers                                                                                                                                                                                     | 2.5                          |
| **Credit note exceeds invoice total**                      | Allow it — partial refunds and prepayments are valid business scenarios                                                                                                                                                                                                                | 2.5                          |
| **Credit note has no "payment status"**                    | Hide status filter tabs when viewing Credit Notes tab — CNs aren't paid/unpaid                                                                                                                                                                                                         | 2.5                          |
| **Mark as Paid — discoverability**                         | Status indicator text always visible (not hidden on mobile). Circle = tap target. Apple Reminders pattern.                                                                                                                                                                             | 2.5                          |
| **0 invoices this period**                                 | Show empty dashboard with "No invoices this month" — don't hide the dashboard entirely                                                                                                                                                                                                 | 2.5                          |
| **All invoices paid (100% ring)**                          | Ring turns green. Celebrate subtly — just the colour change, no confetti                                                                                                                                                                                                               | 2.5                          |
| **User marks paid then unpaid**                            | Allow freely — no confirmation needed (it's a toggle, not destructive)                                                                                                                                                                                                                 | 2.5                          |
| **Customer pays different amount (£25 instead of £24.99)** | Phase 2.5: binary paid/unpaid only — user marks paid regardless of exact amount. Phase 3+: Stripe/GoCardless auto-reconciles exact amounts. Overpayment/underpayment tracking is Phase 3 backend territory. For now, "paid" means "I've been paid for this" not "exact amount matched" | 2.5 (simple) / 3 (exact)     |
| **Overdue but partially paid**                             | Not supported yet (paid is binary). Phase 3 could add partial payments via Stripe                                                                                                                                                                                                      | 3                            |
| **Multiple currencies**                                    | Not in scope. UK-first = GBP only. If needed later, add as Phase 6                                                                                                                                                                                                                     | 6                            |
| **Invoice deleted after payment**                          | Payment status is on the SavedInvoice — deleting it removes the record. Warn in confirmation dialog                                                                                                                                                                                    | 2.5                          |
| **Bank details not provided**                              | PDF shows "Contact us for payment details" — graceful fallback, no broken layout                                                                                                                                                                                                       | 2.5                          |
| **CIS + bank transfer**                                    | Payment section shows Net Payable (after CIS deduction), not gross total                                                                                                                                                                                                               | 2.5                          |
| **Customer name typos create duplicates**                  | Apple Contacts autocomplete: as-you-type suggestions from invoice history, selecting fills all fields. Prevents "ABC Ltd" vs "ABC LIMITED" drift. Proper customer IDs + merge/dedup in Phase 3                                                                                         | 2.5 (autocomplete) / 3 (IDs) |
| **Swipe gestures undiscoverable**                          | Apple Mail pattern: first time user opens history, first unpaid invoice briefly peeks right to reveal green "Paid" button. One-time hint, stored in localStorage. Explicit button row always visible as fallback                                                                       | 2.5                          |

### Customer autocomplete (Apple Contacts pattern)

- As user types customer name, matching suggestions appear below the input
- Suggestions built from ALL invoice history (deduped by lowercase name, most recent wins)
- Selecting a suggestion fills name, email, address, postCode — no retyping
- Shows invoice count per customer ("3 invs") for recognition
- When field is empty + focused, shows top 5 most recent customers
- Keyboard nav: arrow keys, enter to select, escape to dismiss
- Solves 90% of the customer identification problem without a backend

### Statement of Account (PDF download, no backend needed)

A customer asks: "What do I owe you?" — the user needs to send them a single document.

| Element               | Detail                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| **Entry point**       | History panel → search/filter for customer → "Statement" button appears                                 |
| **Data source**       | `selectUniqueCustomers()` selector groups invoices by customer name                                     |
| **PDF content**       | Company header, customer details, date range, table of all invoices + credit notes with running balance |
| **Running balance**   | Invoice = +amount, Credit note = -amount, sorted chronologically                                        |
| **Status column**     | Paid/Unpaid/Overdue per line                                                                            |
| **Summary footer**    | Total invoiced, total paid, total outstanding                                                           |
| **File naming**       | `Statement-{CustomerName}-{Date}.pdf`                                                                   |
| **No backend needed** | All data is in localStorage history, @react-pdf/renderer for PDF                                        |

**Why Apple would include this:** It's the natural answer to "I invoiced this customer 5 times — show me the full picture." Apple Health does this with summary reports. Apple Card does this with monthly statements. It's expected in finance tools.

### Swipe gestures (Apple Mail bidirectional pattern)

- **Swipe right** → reveals green "Paid" button (or orange "Undo" if already paid)
- **Swipe left** → reveals red "Delete" button (existing)
- **Credit notes** → swipe left only (no payment status)
- **First-time hint** → first unpaid invoice peeks right briefly to teach the gesture
- **Explicit button row** → always visible below each invoice as fallback for non-gesture users

### Effort: ~2-3 days

---

## Phase 3: "Stay Connected" (Backend + Email + Recurring)

**Status:** PLANNED
**Apple principle:** _The platform enables the ecosystem._

This is the **App Store moment** — Invease stops being a tool and becomes a service. User accounts enable everything that follows.

### What to build

| Feature                  | Why                                                        |
| ------------------------ | ---------------------------------------------------------- |
| **User accounts**        | Email/password or Google sign-in                           |
| **Cloud sync**           | Invoices, clients, settings sync across devices            |
| **Email delivery**       | Send invoices directly from Invease                        |
| **Recurring invoices**   | Monthly/weekly auto-generation                             |
| **Payment reminders**    | Automated "your invoice is overdue" emails                 |
| **Client database**      | Full client management (not just recent 5)                 |
| **Online payment links** | Stripe Connect + GoCardless — "Pay Now" button on invoices |

### The backend decision

| Option                         | Pros                                                        | Cons                         |
| ------------------------------ | ----------------------------------------------------------- | ---------------------------- |
| **Supabase**                   | Postgres + Auth + Realtime, generous free tier, open source | Another service to manage    |
| **Vercel Postgres + NextAuth** | Stays in Vercel ecosystem, simple                           | Less features out of the box |
| **Firebase**                   | Real-time sync, good mobile SDK                             | Google lock-in, NoSQL        |

**Recommendation: Supabase** — Auth, Postgres, Realtime, Storage all in one. Free tier covers early usage. Scales well. Works with both Next.js and Expo.

### Key architecture shift

The app becomes **offline-first with sync**:

```
User creates invoice (works offline)
    -> Saved locally (as now)
    -> When online, syncs to Supabase
    -> Available on any device
```

The user never feels the backend. It's invisible. Apple approach.

### Email delivery

Use **Resend** (by Vercel team) — simple API, generous free tier (100 emails/day), works with React Email for beautiful templates.

### Online payment links (Stripe Connect + GoCardless)

Requires backend because OAuth token exchange is server-side (security requirement).

**User flow:** Settings > Payment Gateways > "Connect Stripe" > OAuth > done. Every invoice gets "Pay Now".

**What we wire up:**

| Component                    | Purpose                                                              |
| ---------------------------- | -------------------------------------------------------------------- |
| OAuth redirect endpoint      | Sends user to Stripe/GoCardless auth page                            |
| OAuth callback endpoint      | Receives auth code back                                              |
| Token exchange (server-side) | Swaps code for access token (Stripe secret key can't be client-side) |
| Token storage (Supabase)     | Securely stores access token per user                                |
| Payment Link creation API    | Auto-generates per-invoice payment URL with correct amount           |
| Webhook endpoint             | Receives "payment completed" → auto-marks invoice as paid            |

**Fees (paid by the business, not the customer):**

| Provider   | Fee                   | Best for                                 |
| ---------- | --------------------- | ---------------------------------------- |
| Stripe     | 1.4% + 20p (UK cards) | Instant card/Apple Pay/Google Pay        |
| GoCardless | 1% + 20p (capped £4)  | Direct debit, recurring, larger invoices |

**Customer experience:** Receives invoice → clicks "Pay Now" → pays by card or bank → invoice auto-marked paid.

### Effort: ~2-3 weeks

---

## Phase 3.5: "Take It With You" (Expo Mobile App)

**Status:** PLANNED
**Apple principle:** _The best device for the job._

### Matt's take on Expo (Senior Dev)

> "Bit of a faff setup but you'll be banging out mobile apps (on device and simulator) once you've set it up. Don't be scared of the initial setup cause when done it's easy."

### Why Expo and why now

- **After Phase 3** (not before) — the mobile app needs a backend for sync
- **React Native via Expo** shares React knowledge, TypeScript, Zustand
- **Expo Router** mirrors Next.js App Router patterns
- **Camera access** needed for Phase 4 (receipt capture)
- **Push notifications** needed for payment reminders
- **App Store presence** builds trust

### What we can reuse (from codebase analysis — ~70% reusable)

**Copy directly (0 changes needed) — 14 files:**

- All types (`types/invoice.ts`)
- All config (`config/constants.ts`, `config/sampleData.ts`)
- All pure lib (`validationPatterns.ts`, `dateUtils.ts`, `invoiceNumbering.ts`, `cisUtils.ts`, `bankDetailsUtils.ts`, `textFormatters.ts`, `formatters.ts`, `invoiceUtils.ts`, `schemas.ts`, `companiesHouse.ts`, `templates/pdfTemplates.ts`)

**Adapt (swap storage/imports) — 6 files:**

- 4 Zustand stores -> swap `localStorage` with `AsyncStorage`
- `logger.ts` -> swap `@sentry/nextjs` with `@sentry/react-native`
- `haptics.ts` -> swap Vibration API with `expo-haptics`

**New for mobile:**

- React Native UI components (replace HTML/Tailwind)
- Expo Router navigation
- PDF generation (different library — `react-native-pdf` or server-side)
- Push notifications (`expo-notifications`)
- Camera (`expo-camera`)

### Monorepo structure

```
invease/
├── apps/
│   ├── web/           # Current Next.js app (moved here)
│   └── mobile/        # New Expo app
├── packages/
│   └── shared/        # Extracted shared code
│       ├── types/     # TypeScript interfaces
│       ├── lib/       # Pure business logic (14+ files)
│       ├── stores/    # Zustand stores (with storage adapter pattern)
│       └── config/    # Constants, sample data
├── package.json       # Workspace root
└── turbo.json         # Turborepo config (optional)
```

**Storage adapter pattern** (makes stores work on both platforms):

```typescript
// packages/shared/stores/createStorage.ts
// Web: returns localStorage wrapper
// Mobile: returns AsyncStorage wrapper
// Store code stays identical
```

### Expo setup steps (Matt's "bit of a faff")

1. `npx create-expo-app apps/mobile --template tabs`
2. Set up Expo Router (file-based routing, like Next.js)
3. Configure EAS Build (for device builds)
4. Link shared packages via workspace config
5. Set up Expo Dev Client (for native module testing)
6. Configure splash screen, app icon, bundle ID

### Key Expo resources

- [Expo Docs](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/) — file-based routing like Next.js
- [EAS Build](https://docs.expo.dev/build/introduction/) — cloud builds for iOS/Android
- [Expo Go](https://expo.dev/go) — test on device without building

**iOS Developer Account:** $99/year — needed before App Store submission. Can develop and test without it using Expo Go + simulator.

### Effort: ~1-2 weeks for setup + basic invoicing feature parity

---

## Phase 4: "Your Money, Organised" (Expenses)

**Status:** PLANNED
**Apple principle:** _Reduce friction to zero._

This is the **killer feature for mobile**. Nobody types expenses on a website — they snap a photo right after buying something.

### What to build

| Feature                   | Platform                                 |
| ------------------------- | ---------------------------------------- |
| **Receipt capture**       | Mobile (camera)                          |
| **OCR / auto-categorise** | Cloud (Google Vision or similar)         |
| **Expense categories**    | Both (travel, materials, office, etc.)   |
| **Monthly totals**        | Both (dashboard integration)             |
| **Tax summary**           | Both (income vs expenses, estimated tax) |
| **Reports export**        | Both (CSV/PDF for accountant review)     |

### Why Phase 4 justifies the mobile app

The Expo app from Phase 3.5 starts as "invoicing on your phone." Phase 4 makes it "your business in your pocket." The camera feature is the reason people download the native app instead of using the PWA.

### Effort: ~3-4 weeks

---

## Phase 5: "Tax, Sorted" (MTD / HMRC Integration)

**Status:** PLANNED
**Apple principle:** _It just works._

This is the **business case for K&R**. From April 2026, sole traders with income >£50,000 must use MTD. K&R's clients need this.

### What to build

| Feature                   | Notes                                            |
| ------------------------- | ------------------------------------------------ |
| **HMRC API integration**  | Sandbox testing -> production approval           |
| **Digital records**       | Income (from invoices) + expenses (from Phase 4) |
| **Quarterly submissions** | Auto-generated from data, one-tap submit         |
| **SA103F/SA103S reports** | Self-employment summary (Zoho has this free)     |
| **CIS returns to HMRC**   | For construction industry K&R clients            |
| **K&R as MTD agent**      | Accountant reviews -> submits on client's behalf |
| **Year-end support**      | Final Declaration preparation                    |

### HMRC Production Credentials Process

K&R Accountants Ltd has an active production credential request on the HMRC Developer Hub. Sandbox app "KR VAT Obligations Bot" exists (last API call: 12 Sep 2025).

**Requirements to get production credentials:**

| Requirement                                    | Status  | Notes                                                     |
| ---------------------------------------------- | ------- | --------------------------------------------------------- |
| Questionnaire 1 (Software Developer Checklist) | Pending | Company details, endpoints, VAT schemes, compliance       |
| Questionnaire 2 (WCAG 2.1 AA Accessibility)    | Pending | Full WCAG criterion-by-criterion audit                    |
| Fraud Prevention Headers (FPH)                 | Pending | Must send headers on all API calls, pass HMRC testing     |
| T&C + Privacy Policy URLs                      | Pending | Must be publicly accessible (needs production deploy)     |
| Sandbox testing (fresh)                        | Pending | HMRC retains logs 14 days only — test close to submission |
| Legal Declaration on screen                    | Pending | Must show exact HMRC text before VAT submission           |

**Questionnaire 1 pre-fill (for reference):**

| Question                    | Answer                                               |
| --------------------------- | ---------------------------------------------------- |
| In-house or Retail?         | In-house (K&R clients) initially, retail later       |
| Product type                | Full digital record keeping (when Phase 4-5 built)   |
| VAT schemes                 | Standard (0%, 5%, 20%), Reverse Charge               |
| Endpoints developed         | VAT obligations (sandbox)                            |
| Meets "Digital" definition? | Yes (when MTD features built, per VAT Notice 700/22) |
| Manual keying boxes 1-9?    | No — auto-populated from digital records             |
| UK standards (dates, £)?    | Yes                                                  |
| GDPR compliant?             | Yes                                                  |
| WCAG 2.1 AA?                | Yes                                                  |
| White label?                | No                                                   |

### HMRC API Roadmap (from Developer Hub emails)

| API                         | Status              | When to integrate | Notes                                                              |
| --------------------------- | ------------------- | ----------------- | ------------------------------------------------------------------ |
| **VAT (MTD) API**           | Live                | Phase 5 core      | Submit/view returns, obligations, liabilities, payments, penalties |
| **Initiate Payment API**    | **Live (Dec 2025)** | Phase 5           | Trigger HMRC payment directly from software                        |
| **HMRC Assist for VAT**     | **April 2027**      | Phase 5+          | Submission feedback sent back through software                     |
| **Check UK VAT Number API** | Live                | Phase 3+          | Validate customer VAT numbers (usage restrictions apply)           |
| **GOV.UK One Login**        | Transitioning       | Monitor           | Replacing Government Gateway — no OAuth changes yet                |
| **Self Assessment APIs**    | Live                | Phase 5           | Individual calculations, losses, income sources                    |
| **CIS Deductions API**      | Live                | Phase 5           | Construction industry submissions                                  |

**Key HMRC updates:**

- All developer queries now via online Support Form (not email)
- AI Guidelines for software developers published on GOV.UK — review and comply
- Direct Debit mandate consultation coming for VAT/PAYE payments — monitor outcome

### HMRC Technical Requirements

- Register as MTD-compatible software on [HMRC Developer Hub](https://developer.service.hmrc.gov.uk/)
- Sandbox environment for testing
- OAuth 2.0 for user authorization
- Meet minimum functional standards
- Production approval process (questionnaires + FPH testing)

### Effort: ~6-8 weeks (including HMRC approval process)

---

## Phase 6: "Better Together" (Multi-User Platform)

**Status:** PLANNED
**Apple principle:** _Individual tools, better together._

### What to build

| Feature                 | Notes                                  |
| ----------------------- | -------------------------------------- |
| **Accountant portal**   | K&R sees all client dashboards         |
| **Client invitations**  | "Connect with your accountant"         |
| **Review workflow**     | Accountant reviews, comments, approves |
| **Practice management** | K&R manages all clients in one place   |
| **Notifications**       | Client submits -> accountant notified  |

### This is the SAAS moment

- **Free tier:** Basic invoicing (current)
- **Pro tier (£5-10/month):** Email delivery, recurring, expenses, reports
- **Business tier (£15-25/month):** MTD submission, accountant collaboration
- **K&R clients:** Free Business tier (competitive advantage for K&R)

### Effort: ~4-6 weeks

---

## How Apple Would Sequence This

Apple never launches everything at once. Each release has ONE headline:

| Release    | Headline             | Tagline                                      |
| ---------- | -------------------- | -------------------------------------------- |
| v1.0 (NOW) | "Create invoices"    | "Professional invoices in minutes"           |
| v1.5       | "Track your money"   | "See who owes you, at a glance"              |
| v2.0       | "Send invoices"      | "Create, send, get paid — all in one place"  |
| v2.5       | "Invease for iPhone" | "Your business in your pocket"               |
| v3.0       | "Track expenses"     | "Snap it. Categorise it. Done."              |
| v4.0       | "Tax, sorted"        | "Invease talks to HMRC so you don't have to" |
| v5.0       | "Better together"    | "Your accountant, connected"                 |

Each version is usable on its own. Each adds one clear reason to upgrade.

---

## What NOT to Do (Anti-Patterns)

1. **Don't build the mobile app before the backend** — it'll need sync, and you'll build it twice
2. **Don't add user accounts before you need them** — Phase 2.5 works without accounts
3. **Don't build expense tracking on web only** — the camera is the whole point
4. **Don't try to get HMRC approval before having a working product** — build first, certify after
5. **Don't over-engineer the monorepo** — start simple, extract shared code when the mobile app actually needs it
6. **Don't try to out-feature Zoho/Xero** — compete on simplicity, speed, and privacy

---

## Architecture Summary

```
invease/
├── app/                    # Next.js 16 App Router
│   ├── api/company-search/ # Companies House proxy
│   ├── privacy/            # Privacy Policy page
│   ├── terms/              # Terms of Service page
│   ├── accessibility/      # Accessibility Statement page
│   ├── layout.tsx          # Root layout + PWA + SEO meta
│   ├── page.tsx            # Main app (single page)
│   ├── global-error.tsx    # Sentry error boundary
│   └── globals.css         # Design tokens
├── components/
│   ├── ui/                 # Reusable (Button, FormField, ConfirmDialog, etc.)
│   ├── invoice/            # Invoice-specific (forms, preview, email)
│   ├── wizard/             # Onboarding steps
│   ├── settings/           # User preferences
│   ├── shared/             # Footer, CompanySearch
│   └── pdf/                # PDF rendering (InvoicePDF, pdfStyles, preview, download)
├── stores/                 # Zustand state
│   ├── companyStore.ts     # Company (persisted to localStorage)
│   ├── invoiceStore.ts     # Invoice draft (sessionStorage)
│   ├── settingsStore.ts    # User prefs (persisted)
│   └── historyStore.ts     # Invoice history (persisted, 50 max)
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities
│   ├── formatters.ts       # Currency, line total, VAT display
│   ├── dateUtils.ts        # getTodayISO, formatDateUK, calculateDueDate
│   ├── cisUtils.ts         # CIS deduction rate + status label
│   ├── bankDetailsUtils.ts # hasBankDetails, hasPartialBankDetails
│   ├── invoiceUtils.ts     # getValidLineItems, copyLineItemsToStore
│   ├── schemas.ts          # Zod validation schemas
│   ├── logger.ts           # Centralized logging (Sentry-integrated)
│   ├── companiesHouse.ts   # UK company API client
│   └── haptics.ts          # Vibration feedback
├── config/
│   ├── site.ts             # Site config + feature flags
│   └── constants.ts        # VAT rates, business types
└── public/
    ├── manifest.json       # PWA manifest
    ├── sw.js               # Service worker v2
    ├── robots.txt          # SEO
    └── sitemap.xml         # SEO
```

### Feature Flags (`config/site.ts`)

```javascript
features: {
  multipleInvoices: false,  // Future: manage multiple drafts
  emailInvoice: true,       // Web Share API (mobile) + mailto: (desktop)
  invoiceHistory: true,     // localStorage history (implemented)
  logoUpload: true,         // Company logo upload
  quickStart: true,         // Skip -> straight to invoice with sample data
}
```

### Data Persistence

| Data            | Storage         | Why                        |
| --------------- | --------------- | -------------------------- |
| Company details | localStorage    | Persists across sessions   |
| Bank details    | **Memory ONLY** | Security — never persisted |
| Invoice draft   | sessionStorage  | Clears on tab close        |
| Invoice history | localStorage    | Versioned migration (v2)   |
| Settings        | localStorage    | Numbering, preferences     |

---

## Timeline Summary

| Phase   | What                         | Infra Change       | Effort    |
| ------- | ---------------------------- | ------------------ | --------- |
| **2.5** | Dashboard + payment tracking | None (client-side) | 2-3 days  |
| **3**   | Backend + email + recurring  | Supabase + Resend  | 2-3 weeks |
| **3.5** | Expo mobile app              | Monorepo + Expo    | 1-2 weeks |
| **4**   | Expense tracking + receipts  | Camera + OCR       | 3-4 weeks |
| **5**   | MTD / HMRC integration       | HMRC API           | 6-8 weeks |
| **6**   | Multi-user platform          | Role-based access  | 4-6 weeks |

**Total to complete product: ~4-6 months of active development**

---

## Decision Log

| Date       | Decision                                                | Rationale                                                                                                                                                                                           | Made By           |
| ---------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 2026-02-17 | Created strategy doc                                    | Need clarity before more dev                                                                                                                                                                        | Team              |
| 2026-02-17 | Use Web Share API for mobile                            | Free, native, no backend                                                                                                                                                                            | Research          |
| 2026-02-17 | Prioritize Quick Start mode                             | Fix main UX pain point                                                                                                                                                                              | Research          |
| 2026-02-17 | Expense tracking to backlog                             | Not in initial scope                                                                                                                                                                                | Stakeholder       |
| 2026-02-17 | Bank details memory-only                                | Security — never persist to localStorage                                                                                                                                                            | Stakeholder + Dev |
| 2026-02-21 | P0-P3: Code quality refactoring                         | Split monolith, deduplicate, UX polish                                                                                                                                                              | Dev               |
| 2026-02-21 | Sentry via instrumentation-client.ts                    | Turbopack (Next.js 16) requires this pattern                                                                                                                                                        | Dev               |
| 2026-02-21 | Phase 1.5 legal compliance                              | GDPR lawful basis, CH attribution, supply date, breach procedure                                                                                                                                    | Stakeholder + Dev |
| 2026-02-21 | Feedback email: admin@kraccountants.com                 | Separate from info@ for tracking                                                                                                                                                                    | Stakeholder       |
| 2026-02-21 | Solicitor review deferred                               | Self-assessment done; £200-400 before public launch                                                                                                                                                 | Stakeholder       |
| 2026-02-21 | Consolidate docs into single ROADMAP.md                 | 7 files with overlap causing confusion                                                                                                                                                              | Dev               |
| 2026-02-21 | Supabase recommended for backend                        | Auth + Postgres + Realtime, free tier, works with Expo                                                                                                                                              | Research          |
| 2026-02-21 | Expo after backend (Phase 3.5 not 3)                    | Mobile needs sync; don't build twice                                                                                                                                                                | Matt (Senior Dev) |
| 2026-02-21 | Bank transfer UX in Phase 2.5                           | Improve PDF payment section, QR code, payment ref — no backend needed                                                                                                                               | Stakeholder       |
| 2026-02-21 | Payment gateways (Stripe/GoCardless) in Phase 3         | Requires backend for OAuth token exchange — can't be client-side                                                                                                                                    | Research          |
| 2026-02-21 | Open Banking deferred                                   | TrueLayer/Yapily pricing opaque, enterprise-focused, not mature for small invoicing                                                                                                                 | Research          |
| 2026-02-21 | No admin portal until Phase 3+                          | All data is client-side — nothing to administrate. Admin tooling when backend exists                                                                                                                | Stakeholder + Dev |
| 2026-02-21 | No data selling, ever                                   | Destroys privacy advantage vs Zoho/Xero, GDPR requires explicit consent, not commercially viable at scale                                                                                           | Stakeholder       |
| 2026-02-21 | Revenue model: freemium SAAS (Phase 6)                  | Cleaner than data monetisation. Free tier → Pro £5-10/mo → Business £15-25/mo. K&R clients free Business tier                                                                                       | Stakeholder       |
| 2026-02-21 | Aggregate anonymised analytics OK                       | Product improvement + marketing stats ("10K invoices generated") are fine under legitimate interests                                                                                                | Research          |
| 2026-02-21 | Dashboard: single collection ring, not Activity Rings   | Apple uses rings for behaviour change (fitness), not finance. Finance = awareness → use Apple Card/Stocks patterns. One ring: "£X collected of £Y invoiced". No gamification, no badges, no streaks | Research          |
| 2026-02-21 | Customer autocomplete, not separate dropdown            | Apple Contacts pattern: as-you-type suggestions in the name field itself. Fills all fields on selection. Separate "recent customers" button was undiscoverable — deleted                            | UX                |
| 2026-02-21 | Swipe right = mark as paid (Apple Mail pattern)         | Bidirectional swipe: right=paid (green), left=delete (red). One-time peek animation teaches the gesture. Explicit button row kept as fallback                                                       | UX                |
| 2026-02-21 | Statement of Account: client-side PDF, no backend       | Group invoices by customer name from localStorage, render with @react-pdf/renderer. Running balance, status per line. Natural extension of history                                                  | Stakeholder + Dev |
| 2026-02-21 | Customer identification: name-based now, IDs in Phase 3 | Autocomplete prevents most typo-based duplicates. Proper customer master list with merge/dedup needs Phase 3 backend                                                                                | Dev               |

---

## Open Questions

1. Production domain: `invoices.kraccountants.com` or separate?
2. When to start user testing with K&R clients?
3. Budget for solicitor review (£200-400)?
4. Budget for iOS developer account ($99/year) — when ready?
5. Phase 2.5 prioritisation — dashboard first or payment tracking first?
6. HMRC Questionnaire timeline — when to submit?
7. Direct Debit mandate consultation outcome — impact on payment APIs?

---

## References & Sources

### HMRC

- [HMRC Developer Hub](https://developer.service.hmrc.gov.uk/)
- [MTD Service Guide](https://developer.service.hmrc.gov.uk/guides/income-tax-mtd-end-to-end-service-guide/)
- [MTD Software List](https://www.gov.uk/guidance/find-software-thats-compatible-with-making-tax-digital-for-income-tax)
- [AI Guidelines for Developers](https://www.gov.uk/government/publications/guidelines-for-using-generative-artificial-intelligence-if-youre-a-software-developer)

### Competitors

- [Zoho Books MTD](https://www.zoho.com/uk/books/making-tax-digital-accounting-software/)
- [Zoho Books UK Pricing](https://www.zoho.com/uk/books/pricing/)
- [Xero MTD for SA](https://www.xero.com/uk/programme/making-tax-digital/self-assessment-changes-mtd/)
- [Clear Books Free MTD](https://www.clearbooks.co.uk/free-mtd-software/)
- [QuickFile MTD ITSA](https://www.quickfile.co.uk/making-tax-digital-income-tax-and-self-assessment)
- [Xero Pricing 2026](https://www.linktly.com/guides/xero-pricing/)

### Design

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Google Material Design 3](https://m3.material.io/)

### Legal

- [ICO UK GDPR Guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/)
- [HMRC Invoice Requirements](https://www.quadient.com/en-gb/learn/invoicing/hrmc-invoice-requirements-uk)
- [Solicitor Review Costs](https://www.catalystlaw.co.uk/business-contract-review.html)

### Technical

- [Expo Docs](https://docs.expo.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [Resend (Email)](https://resend.com/)
- [Web Share API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)
