import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only send errors in production
  enabled: process.env.NODE_ENV === 'production',

  // Sample rate for error events (1.0 = 100%)
  sampleRate: 1.0,

  // Performance monitoring — sample 20% of transactions
  tracesSampleRate: 0.2,

  // Session replay for debugging (sample 10%, 100% on error)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
});

// Required by @sentry/nextjs for App Router navigation tracking
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
