import { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `Terms of Service | ${siteConfig.name}`,
  description: 'Terms and conditions for using the Invease invoice generator.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] py-12 px-4 sm:px-6">
      <article className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
        <Link
          href="/"
          className="text-sm text-[var(--brand-blue)] hover:underline mb-8 inline-block no-underline"
        >
          &larr; Back to Invoice Generator
        </Link>

        <h1>Terms of Service</h1>

        <p className="lead">
          Last updated: {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </p>

        <h2>1. Introduction</h2>
        <p>
          {siteConfig.name} (&quot;the Service&quot;) is a free invoice generation tool provided by
          K&R Accountants Ltd (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By using this Service,
          you agree to these terms.
        </p>

        <h2>2. Service Description</h2>
        <p>
          {siteConfig.name} allows you to:
        </p>
        <ul>
          <li>Create professional invoices for your business</li>
          <li>Calculate UK VAT and CIS deductions</li>
          <li>Export invoices as PDF documents</li>
          <li>Store invoice history locally in your browser</li>
        </ul>

        <h2>3. No Account Required</h2>
        <p>
          The Service operates entirely in your browser. No registration or account creation
          is required. Your data is stored locally and is not transmitted to our servers.
        </p>

        <h2>4. Free to Use</h2>
        <p>
          This Service is provided free of charge to support small businesses. We reserve the
          right to introduce premium features in the future, but basic invoice generation
          will remain free.
        </p>

        <h2>5. Your Responsibilities</h2>
        <p>When using the Service, you agree to:</p>
        <ul>
          <li>Provide accurate business information</li>
          <li>Use invoices only for legitimate business purposes</li>
          <li>Comply with UK tax regulations (VAT, CIS, etc.)</li>
          <li>Keep your own records as required by law</li>
          <li>Not use the Service for fraudulent purposes</li>
        </ul>

        <h2>6. Accuracy of Calculations</h2>
        <p>
          While we strive to ensure accurate VAT and CIS calculations, you are responsible
          for verifying all figures before issuing invoices. The Service provides calculations
          based on standard UK rates, but your specific circumstances may vary.
        </p>
        <p>
          <strong>Important:</strong> This Service does not constitute accounting or tax advice.
          For complex tax matters, please consult a qualified accountant.
        </p>

        <h2>7. Making Tax Digital (MTD) Compliance</h2>
        <p>
          {siteConfig.name} is an <strong>invoice generator</strong>, not accounting software.
          While our invoices meet HMRC formatting requirements, you are responsible for:
        </p>
        <ul>
          <li>Using HMRC-recognised Making Tax Digital software to keep digital records</li>
          <li>Submitting quarterly updates to HMRC (if required under MTD rules)</li>
          <li>Filing your Final Declaration by 31 January following the tax year</li>
          <li>Retaining invoices for at least 6 years as required by HMRC</li>
        </ul>
        <p>
          From April 2026, MTD for Income Tax applies to sole traders and landlords with
          qualifying income above £50,000. Consult{' '}
          <a
            href="https://www.gov.uk/guidance/find-software-thats-compatible-with-making-tax-digital-for-income-tax"
            target="_blank"
            rel="noopener noreferrer"
          >
            HMRC&apos;s list of compatible software
          </a>{' '}
          for MTD compliance.
        </p>

        <h2>8. Data Storage</h2>
        <p>
          All data is stored locally in your browser. We recommend:
        </p>
        <ul>
          <li>Downloading PDF copies of all invoices for your records</li>
          <li>Backing up important invoice data</li>
          <li>Being aware that clearing browser data will remove stored information</li>
        </ul>

        <h2>9. Intellectual Property</h2>
        <p>
          The Service, including its design, code, and branding, is owned by K&R Accountants Ltd.
          You may use the Service to create invoices for your business, but you may not:
        </p>
        <ul>
          <li>Copy or replicate the Service</li>
          <li>Remove our branding or attribution</li>
          <li>Use the Service for competing commercial purposes</li>
        </ul>

        <h2>10. Limitation of Liability</h2>
        <p>
          The Service is provided &quot;as is&quot; without warranties of any kind. To the maximum
          extent permitted by law:
        </p>
        <ul>
          <li>We are not liable for any errors in generated invoices</li>
          <li>We are not liable for data loss (including browser data)</li>
          <li>We are not liable for any business decisions made based on Service output</li>
          <li>Our total liability is limited to £0 (as this is a free service)</li>
        </ul>

        <h2>11. Service Availability</h2>
        <p>
          We aim to keep the Service available 24/7, but we do not guarantee uptime.
          We may suspend or discontinue the Service at any time without notice.
        </p>

        <h2>12. Changes to Terms</h2>
        <p>
          We may update these terms at any time. Continued use of the Service after changes
          constitutes acceptance of the new terms.
        </p>

        <h2>13. Governing Law</h2>
        <p>
          These terms are governed by the laws of England and Wales. Any disputes will be
          subject to the exclusive jurisdiction of English courts.
        </p>

        <h2>14. Contact</h2>
        <p>
          For questions about these terms, contact us at{' '}
          <a href={`mailto:${siteConfig.support.email}`}>{siteConfig.support.email}</a>.
        </p>

        <hr />

        <p className="text-sm text-[var(--text-tertiary)]">
          K&R Accountants Ltd<br />
          Registered in England and Wales
        </p>
      </article>
    </main>
  );
}
