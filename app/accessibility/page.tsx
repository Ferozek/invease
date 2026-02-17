import { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `Accessibility Statement | ${siteConfig.name}`,
  description: 'Our commitment to making Invease accessible to everyone.',
};

export default function AccessibilityPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] py-12 px-4 sm:px-6">
      <article className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
        <Link
          href="/"
          className="text-sm text-[var(--brand-blue)] hover:underline mb-8 inline-block no-underline"
        >
          &larr; Back to Invoice Generator
        </Link>

        <h1>Accessibility Statement</h1>

        <p className="lead">
          Last updated: {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </p>

        <h2>Our Commitment</h2>
        <p>
          {siteConfig.name} is committed to ensuring digital accessibility for people with
          disabilities. We are continually improving the user experience for everyone and
          applying the relevant accessibility standards.
        </p>

        <h2>Accessibility Features</h2>
        <p>
          We have implemented the following accessibility features following Apple Human
          Interface Guidelines and WCAG 2.1 AA standards:
        </p>

        <h3>Visual Accessibility</h3>
        <ul>
          <li>
            <strong>Dark mode support:</strong> Respects your system preference for light or
            dark colour schemes
          </li>
          <li>
            <strong>Contrast ratios:</strong> All text meets WCAG AA contrast requirements
            (4.5:1 for body text, 3:1 for large text)
          </li>
          <li>
            <strong>Scalable text:</strong> Text can be enlarged up to 200% without loss of
            functionality
          </li>
          <li>
            <strong>Focus indicators:</strong> Clear visual focus states for keyboard navigation
          </li>
        </ul>

        <h3>Motor Accessibility</h3>
        <ul>
          <li>
            <strong>Touch targets:</strong> All interactive elements are at least 44x44 pixels,
            following Apple&apos;s minimum touch target guidelines
          </li>
          <li>
            <strong>Keyboard navigation:</strong> Full keyboard access to all features
          </li>
          <li>
            <strong>No time limits:</strong> No timed interactions or auto-advancing content
          </li>
        </ul>

        <h3>Cognitive Accessibility</h3>
        <ul>
          <li>
            <strong>Clear labels:</strong> All form fields have descriptive labels
          </li>
          <li>
            <strong>Error messages:</strong> Clear, specific error messages that explain how
            to fix issues
          </li>
          <li>
            <strong>Consistent layout:</strong> Predictable navigation and page structure
          </li>
          <li>
            <strong>Auto-save:</strong> Progress is automatically saved to prevent data loss
          </li>
        </ul>

        <h3>Screen Reader Support</h3>
        <ul>
          <li>
            <strong>Semantic HTML:</strong> Proper heading hierarchy and landmark regions
          </li>
          <li>
            <strong>ARIA labels:</strong> Descriptive labels for interactive elements
          </li>
          <li>
            <strong>Live regions:</strong> Dynamic content changes are announced
          </li>
          <li>
            <strong>Skip links:</strong> Skip to main content link for keyboard users
          </li>
        </ul>

        <h3>Motion Sensitivity</h3>
        <ul>
          <li>
            <strong>Reduced motion:</strong> Animations are disabled when you have
            &quot;Reduce Motion&quot; enabled in your system settings
          </li>
          <li>
            <strong>No flashing:</strong> No content flashes more than three times per second
          </li>
        </ul>

        <h2>Assistive Technologies Tested</h2>
        <p>We test {siteConfig.name} with:</p>
        <ul>
          <li>VoiceOver on macOS and iOS</li>
          <li>NVDA on Windows</li>
          <li>Keyboard-only navigation</li>
          <li>Browser zoom up to 400%</li>
        </ul>

        <h2>Known Issues</h2>
        <p>
          We are aware of the following accessibility issues and are working to resolve them:
        </p>
        <ul>
          <li>
            PDF export may not be fully accessible for screen readers (we recommend using
            the on-screen preview for accessibility)
          </li>
        </ul>

        <h2>Feedback</h2>
        <p>
          We welcome your feedback on the accessibility of {siteConfig.name}. Please let us
          know if you encounter accessibility barriers:
        </p>
        <ul>
          <li>
            Email: <a href={`mailto:${siteConfig.support.email}`}>{siteConfig.support.email}</a>
          </li>
          <li>Subject line: &quot;Accessibility Feedback&quot;</li>
        </ul>
        <p>
          We try to respond to accessibility feedback within 5 business days.
        </p>

        <h2>Enforcement</h2>
        <p>
          If you are not satisfied with our response, you can contact the{' '}
          <a
            href="https://www.equalityhumanrights.com/en/contact-us"
            target="_blank"
            rel="noopener noreferrer"
          >
            Equality and Human Rights Commission (EHRC)
          </a>.
        </p>

        <hr />

        <p className="text-sm text-[var(--text-tertiary)]">
          This statement was prepared based on a self-assessment by K&R Accountants Ltd.
        </p>
      </article>
    </main>
  );
}
