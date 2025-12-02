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
  INTERNAL_API_KEY?: string;
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

  // Bypass Arcjet for internal requests
  const internalToken = c.req.header("x-internal-token");
  const expectedToken =
    c.env.INTERNAL_API_KEY ||
    "e4539e9b6edb44aaf974adf22b62c0aa5c2e8af1b42e2a46ac71042e1bfc5165";

  console.log("CF Security Debug:", {
    received: internalToken ? internalToken.substring(0, 5) + "..." : "none",
    expected: expectedToken ? expectedToken.substring(0, 5) + "..." : "none",
    match: internalToken === expectedToken,
    keyLength: expectedToken?.length,
  });

  if (internalToken === expectedToken) {
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
