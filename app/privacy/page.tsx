import { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.name}`,
  description: 'How we handle your data when using the Invease invoice generator.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] py-12 px-4 sm:px-6">
      <article className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
        <Link
          href="/"
          className="text-sm text-[var(--brand-blue)] hover:underline mb-8 inline-block no-underline"
        >
          &larr; Back to Invoice Generator
        </Link>

        <h1>Privacy Policy</h1>

        <p className="lead">
          Last updated: {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </p>

        <h2>Overview</h2>
        <p>
          {siteConfig.name} is a free invoice generator provided by K&R Accountants.
          We are committed to protecting your privacy and handling your data responsibly.
        </p>

        <h2>Data We Collect</h2>

        <h3>Information You Provide</h3>
        <ul>
          <li>
            <strong>Company details:</strong> Business name, address, registration numbers
            (Companies House, VAT, UTR). This is stored locally in your browser.
          </li>
          <li>
            <strong>Customer information:</strong> Names and addresses you enter for invoices.
            This stays in your browser and is never sent to our servers.
          </li>
          <li>
            <strong>Invoice data:</strong> Line items, amounts, and dates. This is processed
            entirely in your browser.
          </li>
        </ul>

        <h3>Information We DO NOT Collect</h3>
        <ul>
          <li>Bank account details (stored in session only, cleared when you close the tab)</li>
          <li>Personal identification documents</li>
          <li>Payment card information</li>
        </ul>

        <h2>How Your Data is Stored</h2>
        <p>
          All invoice data is stored locally in your browser using localStorage and sessionStorage.
          We do not have access to this data, and it is never transmitted to our servers.
        </p>
        <ul>
          <li>
            <strong>Company details:</strong> Saved in localStorage (persists across sessions)
          </li>
          <li>
            <strong>Bank details:</strong> Saved in sessionStorage only (cleared when tab closes)
          </li>
          <li>
            <strong>Invoice drafts:</strong> Saved in sessionStorage (cleared when tab closes)
          </li>
          <li>
            <strong>Invoice history:</strong> Saved in localStorage (persists across sessions)
          </li>
        </ul>

        <h2>Third-Party Services</h2>

        <h3>Companies House API</h3>
        <p>
          When you search for a company, we query the Companies House public API to retrieve
          registered business information. This is a UK government service, and their{' '}
          <a
            href="https://developer-specs.company-information.service.gov.uk/"
            target="_blank"
            rel="noopener noreferrer"
          >
            privacy policy applies
          </a>.
        </p>

        <h3>Vercel Analytics</h3>
        <p>
          We use Vercel Analytics to understand how the app is used. This collects:
        </p>
        <ul>
          <li>Page views (anonymised)</li>
          <li>Browser and device type</li>
          <li>Country (based on IP, not stored)</li>
        </ul>
        <p>
          No personal data is collected. See{' '}
          <a
            href="https://vercel.com/docs/analytics/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vercel&apos;s privacy policy
          </a>.
        </p>

        <h2>Your Rights (GDPR)</h2>
        <p>Under UK GDPR, you have the right to:</p>
        <ul>
          <li>Access your data (it&apos;s all in your browser&apos;s localStorage)</li>
          <li>Delete your data (clear your browser data or use our app&apos;s reset function)</li>
          <li>Data portability (export invoices as PDF or CSV)</li>
        </ul>

        <h2>Cookies</h2>
        <p>
          We do not use tracking cookies. The only data stored in your browser is:
        </p>
        <ul>
          <li>Your company details (localStorage)</li>
          <li>Invoice history (localStorage)</li>
          <li>Theme preference (localStorage)</li>
        </ul>

        <h2>Children&apos;s Privacy</h2>
        <p>
          This service is intended for business use. We do not knowingly collect
          data from children under 16.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. Changes will be posted on this page
          with an updated date.
        </p>

        <h2>Contact Us</h2>
        <p>
          For privacy-related questions, contact K&R Accountants at{' '}
          <a href={`mailto:${siteConfig.support.email}`}>{siteConfig.support.email}</a>.
        </p>

        <hr />

        <p className="text-sm text-[var(--text-tertiary)]">
          K&R Accountants Ltd<br />
          Data Controller for {siteConfig.name}
        </p>
      </article>
    </main>
  );
}
