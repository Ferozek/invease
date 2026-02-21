import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only send errors in production
  enabled: process.env.NODE_ENV === 'production',

  // Sample rate for error events
  sampleRate: 1.0,

  // Performance monitoring — sample 20% of transactions
  tracesSampleRate: 0.2,
});
