/**
 * Environment Variable Validation
 *
 * Uses Zod to validate environment variables at build/runtime.
 * Ensures required variables are present and properly typed.
 */

import { z } from 'zod';

/**
 * Server-side environment variables schema
 * These are only available in server components and API routes
 */
const serverEnvSchema = z.object({
  // Companies House API key for company search
  COMPANIES_HOUSE_API_KEY: z.string().optional(),
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Client-side environment variables schema
 * These are exposed to the browser (must be prefixed with NEXT_PUBLIC_)
 */
const clientEnvSchema = z.object({
  // Site URL for canonical links and OG tags
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  // Feature flags (optional)
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.coerce.boolean().optional().default(false),
});

/**
 * Combined environment schema
 */
const envSchema = serverEnvSchema.merge(clientEnvSchema);

/**
 * Validate and parse environment variables
 */
function validateEnv() {
  const parsed = envSchema.safeParse({
    COMPANIES_HOUSE_API_KEY: process.env.COMPANIES_HOUSE_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  });

  if (!parsed.success) {
    console.error(
      '❌ Invalid environment variables:',
      JSON.stringify(parsed.error.format(), null, 2)
    );

    // In development, throw to alert developer
    // In production, log but don't crash (graceful degradation)
    if (process.env.NODE_ENV === 'development') {
      throw new Error('Invalid environment variables');
    }
  }

  return parsed.data ?? {
    COMPANIES_HOUSE_API_KEY: '',
    NODE_ENV: 'production' as const,
    NEXT_PUBLIC_SITE_URL: undefined,
    NEXT_PUBLIC_ENABLE_ANALYTICS: false,
  };
}

/**
 * Validated environment variables
 */
export const env = validateEnv();

/**
 * Type-safe environment variable access
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Helper to check if we're in development mode
 */
export const isDev = env.NODE_ENV === 'development';

/**
 * Helper to check if we're in production mode
 */
export const isProd = env.NODE_ENV === 'production';

/**
 * Helper to check if Companies House API is configured
 */
export const hasCompaniesHouseApi = Boolean(env.COMPANIES_HOUSE_API_KEY);
