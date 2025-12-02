/**
 * Arcjet security middleware for Hono
 * Protects routes with rate limiting, bot detection, and WAF
 */

import { createMiddleware } from "hono/factory";
import { createAuthArcjet, createApiArcjet } from "@workspace/security/node";
import type { AuthVariables } from "./auth.js";
import type { IncomingMessage } from "node:http";

const ARCJET_KEY = process.env.ARCJET_KEY;

// Initialize Arcjet clients
const authArcjet = ARCJET_KEY ? createAuthArcjet(ARCJET_KEY) : null;
const apiArcjet = ARCJET_KEY ? createApiArcjet(ARCJET_KEY) : null;

/**
 * Security middleware for auth routes (/api/auth/*)
 * Applies stricter rate limiting to prevent brute force attacks
 */
export const authSecurityMiddleware = createMiddleware<{
  Variables: AuthVariables;
}>(async (c, next) => {
  if (!authArcjet) {
    console.warn("ARCJET_KEY not set - security middleware disabled");
    return next();
  }

  // Get userId for rate limiting (use "anonymous" for unauthenticated requests)
  const user = c.get("user");
  const userId = user?.id || "anonymous";

  const decision = await authArcjet.protect(
    c.req.raw as unknown as IncomingMessage,
    { userId }
  );

  if (decision.isDenied()) {
    return c.json(
      {
        error: "Forbidden",
        reason: decision.reason.isRateLimit()
          ? "Too many requests"
          : "Access denied",
      },
      403
    );
  }

  await next();
});

/**
 * Security middleware for general API routes
 * Applies standard rate limiting and bot protection
 */
export const apiSecurityMiddleware = createMiddleware<{
  Variables: AuthVariables;
}>(async (c, next) => {
  if (!apiArcjet) {
    console.warn("ARCJET_KEY not set - security middleware disabled");
    return next();
  }

  // Bypass Arcjet for internal requests
  const internalToken = c.req.header("x-internal-token");
  const expectedToken = process.env.INTERNAL_API_KEY || "your-secret-key";
  if (internalToken === expectedToken) {
    return next();
  }

  // Get userId for rate limiting (use "anonymous" for unauthenticated requests)
  const user = c.get("user");
  const userId = user?.id || "anonymous";

  const decision = await apiArcjet.protect(
    c.req.raw as unknown as IncomingMessage,
    { userId }
  );

  if (decision.isDenied()) {
    return c.json(
      {
        error: "Forbidden",
        reason: decision.reason.isRateLimit()
          ? "Too many requests"
          : "Access denied",
      },
      403
    );
  }

  await next();
});
