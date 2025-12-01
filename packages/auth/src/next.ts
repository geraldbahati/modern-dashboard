/**
 * Next.js auth exports
 * Import from "@workspace/auth/next"
 */

import { betterAuth, type BetterAuthOptions } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { getBaseAuthConfig, type AuthConfigParams } from "./config";

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
const isProduction = process.env.NODE_ENV === "production";

console.log("[Next Auth] Initializing with baseURL:", baseURL);
console.log("[Next Auth] NODE_ENV:", process.env.NODE_ENV);
console.log("[Next Auth] Is production:", isProduction);

export const auth = createNextAuth({
  baseURL,
  trustedOrigins: [
    baseURL,
    "http://localhost:3001",
    "http://localhost:3000",
    "http://server:3001", // Docker internal
    "http://web:3000", // Docker internal
    ...(isProduction
      ? [
          "https://modern-dashboard-web.vercel.app",
          "https://modern-dashboard-server.journeytoharvard.workers.dev",
        ]
      : []),
  ],
});

// Re-export for convenience
export { getBaseAuthConfig, type AuthConfigParams };
