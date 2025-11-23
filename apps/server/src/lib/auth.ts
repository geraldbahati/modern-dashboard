/**
 * Auth instance for the Hono server
 * Uses the shared auth config from @workspace/auth
 */

import { createAuth } from "@workspace/auth/server";

// Environment configuration
const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3001";
const trustedOrigins = [
  "http://localhost:3000", // Next.js frontend
  "http://localhost:3001", // Hono server
];

// Create auth instance using shared config
export const auth = createAuth({
  baseURL,
  trustedOrigins,
  basePath: "/api/auth",
});

// Export types for use in routes/middleware
export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];
