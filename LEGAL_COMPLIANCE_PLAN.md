# Legal Compliance Verification Plan

## Overview

This document outlines the steps to verify and ensure legal compliance for Invease in England & Wales, covering GDPR, HMRC, Companies House, and general UK business law.

---

## Stage 1: Self-Assessment Checklists (Free)

### 1.1 ICO GDPR Self-Assessment

**Source:** [ICO Data Protection Self Assessment](https://ico.org.uk/for-organisations/advice-for-small-organisations/getting-started-with-gdpr/data-protection-self-assessment-medium-businesses/)

Complete the ICO's official checklist covering:

- [ ] Lawful basis for processing (legitimate interests for invoice generation)
- [ ] Right to be informed (privacy policy completeness)
- [ ] Data minimisation (only collecting necessary data)
- [ ] Storage limitation (localStorage retention policy)
- [ ] Individual rights (access, erasure, portability)

**Key 2026 Update:** From June 2026, users must first complain to the controller (us) before escalating to ICO. We need a complaints handling process.

### 1.2 HMRC VAT Invoice Checklist

**Source:** [HMRC Invoice Requirements](https://www.quadient.com/en-gb/learn/invoicing/hrmc-invoice-requirements-uk)

Our invoices MUST include:

- [x] Unique sequential invoice number
- [x] Invoice date
- [x] Tax point (supply date) if different
- [x] Seller name, address, VAT number
- [x] Buyer name and address
- [x] Description of goods/services
- [x] Quantity and unit price
- [x] Total excluding VAT
- [x] VAT rate per item
- [x] Total VAT
- [x] Total including VAT
- [x] Currency (GBP)

**Invoice Types:**

- Full VAT Invoice: Over £250 (we support this ✅)
- Simplified VAT Invoice: Under £250 retail (we support this ✅)
- CIS deductions: We show deduction amounts ✅

### 1.3 Companies House Data Usage

We use the Companies House API for company lookups. Review:

- [x] Only displaying public information (company name, address, number)
- [x] Not storing Companies House data permanently
- [x] Attributing data source in footer
- [ ] Check API terms of use compliance

---

## Stage 2: Legal Document Review

### 2.1 Current Documents Created

| Document                | Status     | Needs Review       |
| ----------------------- | ---------- | ------------------ |
| Privacy Policy          | ✅ Created | Yes - by solicitor |
| Terms of Service        | ✅ Created | Yes - by solicitor |
| Accessibility Statement | ✅ Created | Self-review OK     |

### 2.2 Missing Documents to Consider

| Document                  | Required?                 | Priority |
| ------------------------- | ------------------------- | -------- |
| Cookie Policy             | No (we don't use cookies) | N/A      |
| GDPR Complaints Procedure | Yes (from June 2026)      | Medium   |
| Data Processing Agreement | Only if B2B SaaS          | Low      |
| Acceptable Use Policy     | Nice to have              | Low      |

### 2.3 How Apple Structures Legal Pages

**Source:** [Apple Privacy Policy](https://www.apple.com/legal/privacy/)

Apple's approach:

1. **Layered disclosure** - Summary first, then details
2. **Plain language** - Avoids legal jargon where possible
3. **Specific data types** - Lists exactly what data is collected
4. **Service-specific sections** - Different rules for different products
5. **Contact information** - Clear DPO/privacy contact
6. **Update notices** - 1 week advance notice for material changes
7. **PDF download** - Printable version available

**Action:** Review our privacy policy against Apple's structure.

---

## Stage 3: Professional Legal Review

### Option A: Solicitor Review (Recommended)

**Cost:** £200-400 for privacy policy + terms review
**Source:** [Contract Review Services](https://www.catalystlaw.co.uk/business-contract-review.html)

Specialists to consider:

- **Adlex Solicitors** - Website & app terms specialists
- **General commercial solicitor** - For basic contract review

What to ask them to check:

1. Privacy Policy complies with UK GDPR
2. Terms of Service are enforceable
3. Limitation of liability is valid
4. No missing mandatory disclosures

### Option B: Legal Template Services

**Cost:** £30-50 for pre-made templates
**Source:** [Stay Legal](https://staylegal.co.uk/product/standard-package/)

Provides solicitor-written templates for:

- Privacy Policy
- Terms & Conditions
- Cookie Policy
- Acceptable Use
- Copyright Notice

**Pros:** Cheaper than bespoke
**Cons:** May not fit our specific use case (invoice generator)

### Option C: Hybrid Approach (Best Value)

1. Use our custom-written documents
2. Pay solicitor £200 for a review/amendments
3. Get sign-off that they're compliant

---

## Stage 4: Specific Compliance Areas

### 4.1 GDPR Compliance

**ICO Guidance:** [UK GDPR Resources](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/)

| Requirement             | Our Status       | Action                               |
| ----------------------- | ---------------- | ------------------------------------ |
| Privacy notice          | ✅ Created       | Solicitor review                     |
| Lawful basis documented | ⚠️ Implicit      | Add explicit basis to privacy policy |
| Data retention policy   | ✅ In policy     | Verify localStorage timings          |
| Subject access requests | ⚠️ Manual        | Data is local, user has access       |
| Right to erasure        | ✅ Clear browser | Document in policy                   |
| Data breach procedure   | ❌ Missing       | Create internal process              |
| Complaints procedure    | ❌ Missing       | Required by June 2026                |

### 4.2 HMRC/Making Tax Digital

**Source:** [MTD Compliance Guide](https://www.invoice-guru.co.uk/post/making-tax-digital-explained-essential-compliance-steps-for-uk-businesses-in-2026)

**Important:** Invease is an invoice GENERATOR, not accounting software.

- We generate invoices for download
- We do NOT submit to HMRC
- We do NOT store accounting records
- Users must use MTD-compatible software separately

**Disclaimer needed:** Add to Terms that:

> "Invease generates invoices for your records. For Making Tax Digital compliance, you must use HMRC-recognised accounting software to submit quarterly updates and tax returns."

### 4.3 Invoice Legal Requirements

**Source:** [Sprintlaw UK Invoice Guide](https://sprintlaw.co.uk/articles/uk-invoice-requirements-a-step-by-step-guide-to-writing-legally-compliant-invoices/)

| Requirement                   | Status | Notes                    |
| ----------------------------- | ------ | ------------------------ |
| Seller name & address         | ✅     | From onboarding          |
| Buyer name & address          | ✅     | Customer details form    |
| Unique invoice number         | ✅     | Sequential, customisable |
| Invoice date                  | ✅     | Date picker              |
| Supply date if different      | ⚠️     | Not explicit - could add |
| Description of goods/services | ✅     | Line items               |
| Unit price & quantity         | ✅     | Line items               |
| VAT breakdown                 | ✅     | Totals section           |
| Payment terms                 | ✅     | Configurable             |
| Company registration          | ✅     | If Ltd company           |
| VAT number                    | ✅     | If VAT registered        |

### 4.4 Companies House Data

**Source:** [Companies House API Terms](https://developer.company-information.service.gov.uk/)

Requirements:

- [ ] Display Crown Copyright notice when showing CH data
- [ ] Don't cache data longer than 24 hours
- [ ] Rate limit API calls (we have this ✅)
- [ ] Add attribution in UI

---

## Stage 5: Implementation Checklist

### Immediate Actions (This Week)

- [ ] Add MTD disclaimer to Terms of Service
- [ ] Add Companies House attribution to company search
- [ ] Add supply date field option to invoice
- [ ] Create data breach notification template (internal)
- [ ] Add explicit lawful basis to Privacy Policy

### Short-term Actions (This Month)

- [ ] Complete ICO self-assessment checklist
- [ ] Get solicitor review of Privacy Policy + Terms (£200-400)
- [ ] Implement June 2026 complaints procedure
- [ ] Add "last updated" dates that auto-update

### Pre-Launch Actions

- [ ] Solicitor sign-off received
- [ ] All ICO checklist items green
- [ ] Test invoice output against HMRC requirements
- [ ] Internal data breach procedure documented

---

## Stage 6: Ongoing Compliance

### Monitoring

- Subscribe to ICO newsletter for guidance updates
- Review HMRC MTD updates quarterly
- Annual privacy policy review

### Record Keeping

- Document when legal documents were last reviewed
- Keep copy of solicitor's review letter
- Log any data subject requests (even if zero)

---

## Cost Summary

| Item                      | Cost     | Priority                 |
| ------------------------- | -------- | ------------------------ |
| ICO Self-Assessment       | Free     | Do now                   |
| Solicitor document review | £200-400 | Before public launch     |
| Legal template service    | £30-50   | Alternative to solicitor |
| Annual legal review       | £100-200 | Post-launch              |

**Recommended approach:** Self-assess first, then £200 solicitor review for sign-off.

---

## Sources

- [ICO UK GDPR Guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/)
- [ICO Checklists](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/checklists/)
- [HMRC Invoice Requirements](https://www.quadient.com/en-gb/learn/invoicing/hrmc-invoice-requirements-uk)
- [UK VAT Invoice Requirements](https://www.taxually.com/blog/understanding-hmrc-vat-invoice-requirements-in-the-uk)
- [Making Tax Digital 2026](https://www.invoice-guru.co.uk/post/making-tax-digital-explained-essential-compliance-steps-for-uk-businesses-in-2026)
- [Apple Privacy Policy](https://www.apple.com/legal/privacy/)
- [Solicitor Review Costs](https://www.catalystlaw.co.uk/business-contract-review.html)
- [Legal Templates UK](https://staylegal.co.uk/product/standard-package/)
