/**
 * Next.js auth exports
 * Import from "@workspace/auth/next"
 */

import { betterAuth, type BetterAuthOptions } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { getBaseAuthConfig, type AuthConfigParams } from "./config.js";

/**
 * Create auth instance for Next.js
 * Includes nextCookies() plugin for proper cookie handling in server components
 */
export function createNextAuth(params: AuthConfigParams) {
  const baseConfig = getBaseAuthConfig(params);

  const config: BetterAuthOptions = {
    ...baseConfig,
    plugins: [...(baseConfig.plugins || []), nextCookies()],
  };

  return betterAuth(config);
}

// Default Next.js auth instance
const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export const auth = createNextAuth({
  baseURL,
  trustedOrigins: [baseURL, "http://localhost:3001"],
});

// Re-export for convenience
export { getBaseAuthConfig, type AuthConfigParams };
