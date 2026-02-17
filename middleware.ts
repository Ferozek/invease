import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware
 * Adds security headers including Content Security Policy
 *
 * Security Features:
 * - CSP to prevent XSS attacks
 * - X-Frame-Options to prevent clickjacking
 * - X-Content-Type-Options to prevent MIME sniffing
 * - Referrer-Policy for privacy
 * - Permissions-Policy to control browser features
 */
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();

  // Content Security Policy
  // Note: 'unsafe-inline' required for Next.js inline styles and Framer Motion
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-eval in dev
    "style-src 'self' 'unsafe-inline'", // Tailwind/CSS-in-JS requires unsafe-inline
    "img-src 'self' data: blob:", // data: for base64 logo, blob: for PDF preview
    "font-src 'self'",
    "connect-src 'self' https://api.company-information.service.gov.uk https://vitals.vercel-insights.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  // Set security headers
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Strict Transport Security (HSTS) - only in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  return response;
}

// Apply middleware to all routes except static files and API routes that need different CSP
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, icons, manifest (static assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)',
  ],
};
