import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Strict mode for React
  reactStrictMode: true,

  // Remove X-Powered-By header for security
  poweredByHeader: false,
};

export default nextConfig;
