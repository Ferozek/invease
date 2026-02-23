import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Page not found
        </h2>
        <p className="text-[var(--text-secondary)] mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 min-h-[44px] bg-[var(--brand-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Back to Invease
        </Link>
      </div>
    </div>
  );
}
