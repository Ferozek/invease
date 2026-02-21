import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  // Strict mode for React
  reactStrictMode: true,

  // Remove X-Powered-By header for security
  poweredByHeader: false,
};

export default withSentryConfig(nextConfig, {
  // Upload source maps for readable stack traces in Sentry
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Suppress noisy Sentry build logs
  silent: !process.env.CI,

  // Disable Sentry telemetry
  telemetry: false,
});
