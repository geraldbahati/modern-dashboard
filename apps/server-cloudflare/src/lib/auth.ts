/**
 * Auth instance for the Cloudflare Workers Hono server
 * Uses the shared auth config from @workspace/auth
 *
 * Note: For Cloudflare Workers, we need to handle env vars differently
 * since they're not available at import time via process.env
 */

import { createAuth } from "@workspace/auth/server";

// Cloudflare Workers environment bindings
export type AuthEnv = {
  BETTER_AUTH_URL?: string;
  FRONTEND_URL?: string;
  BETTER_AUTH_SECRET?: string;
};

/**
 * Create auth instance with Cloudflare env bindings
 * Call this function for each request, passing env from context
 */
export function createAuthInstance(env: AuthEnv) {
  const baseURL = env.BETTER_AUTH_URL || "http://localhost:3001";
  const trustedOrigins = [
    "http://localhost:3000", // Next.js frontend (local dev)
    "http://localhost:3001", // Hono server (local dev)
    env.FRONTEND_URL, // Production frontend URL
    env.BETTER_AUTH_URL, // Production server URL
  ].filter((url) => url !== undefined) as string[];

  return createAuth({
    baseURL,
    trustedOrigins,
    basePath: "/api/auth",
  });
}

// Default auth instance for local development (using nodejs_compat process.env)
export const auth = createAuthInstance({
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  FRONTEND_URL: process.env.FRONTEND_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
});

// Export types for use in routes/middleware
export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;

// Extended user type that includes role from admin plugin
export type User = Session["user"] & {
  role?: string | null;
};
