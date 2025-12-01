/**
 * Security middleware for Cloudflare Workers
 * Uses Arcjet for rate limiting and bot protection (via Node compatibility)
 */

import { createMiddleware } from "hono/factory";
import { createAuthArcjet, createApiArcjet } from "@workspace/security/node";
import type { AuthVariables } from "./auth";
import type { IncomingMessage } from "node:http";

// Type for Cloudflare bindings
type SecurityBindings = {
  ARCJET_KEY: string;
};

/**
 * Security middleware for auth routes (/api/auth/*)
 * Applies stricter rate limiting
 */
export const authSecurityMiddleware = createMiddleware<{
  Variables: AuthVariables;
  Bindings: SecurityBindings;
}>(async (c, next) => {
  const key = c.env.ARCJET_KEY;
  if (!key) {
    console.warn("ARCJET_KEY not set - skipping security checks");
    return await next();
  }

  const user = c.get("user");
  const userId = user?.id || "anonymous";

  const aj = createAuthArcjet(key);
  const decision = await aj.protect(c.req.raw as unknown as IncomingMessage, {
    userId,
  });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return c.json(
        { error: "Too Many Requests", message: "Please slow down" },
        429
      );
    }
    return c.json({ error: "Forbidden", message: "Access denied" }, 403);
  }

  await next();
});

/**
 * Security middleware for general API routes
 * Applies standard rate limiting
 */
export const apiSecurityMiddleware = createMiddleware<{
  Variables: AuthVariables;
  Bindings: SecurityBindings;
}>(async (c, next) => {
  const key = c.env.ARCJET_KEY;
  if (!key) {
    console.warn("ARCJET_KEY not set - skipping security checks");
    return await next();
  }

  const user = c.get("user");
  const userId = user?.id || "anonymous";

  const aj = createApiArcjet(key);
  const decision = await aj.protect(c.req.raw as unknown as IncomingMessage, {
    userId,
  });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return c.json(
        { error: "Too Many Requests", message: "Please slow down" },
        429
      );
    }
    return c.json({ error: "Forbidden", message: "Access denied" }, 403);
  }

  await next();
});
