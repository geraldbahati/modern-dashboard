/**
 * Security middleware for Cloudflare Workers
 * Uses Cloudflare's native security features and custom WAF/bot detection
 */

import { createMiddleware } from "hono/factory";
import {
  checkSecurity,
  type RateLimitBinding,
} from "@workspace/security/cloudflare";
import type { AuthVariables } from "./auth";

// Type for Cloudflare bindings
type SecurityBindings = {
  AUTH_RATE_LIMITER?: RateLimitBinding;
  API_RATE_LIMITER?: RateLimitBinding;
};

/**
 * Security middleware for auth routes (/api/auth/*)
 * Applies stricter rate limiting (configured in wrangler.jsonc)
 */
export const authSecurityMiddleware = createMiddleware<{
  Variables: AuthVariables;
  Bindings: SecurityBindings;
}>(async (c, next) => {
  const user = c.get("user");
  const userId = user?.id || "anonymous";

  const decision = await checkSecurity({
    rateLimiter: c.env.AUTH_RATE_LIMITER,
    userId,
    userAgent: c.req.header("user-agent"),
    url: c.req.url,
    body: c.req.method !== "GET" ? await c.req.text() : undefined,
  });

  if (!decision.allowed) {
    const statusCode = decision.reason === "RATE_LIMIT" ? 429 : 403;
    return c.json(
      {
        error: decision.reason || "FORBIDDEN",
        message: decision.message || "Request blocked",
      },
      statusCode
    );
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
  const user = c.get("user");
  const userId = user?.id || "anonymous";

  const decision = await checkSecurity({
    rateLimiter: c.env.API_RATE_LIMITER,
    userId,
    userAgent: c.req.header("user-agent"),
    url: c.req.url,
    body: c.req.method !== "GET" ? await c.req.text() : undefined,
  });

  if (!decision.allowed) {
    const statusCode = decision.reason === "RATE_LIMIT" ? 429 : 403;
    return c.json(
      {
        error: decision.reason || "FORBIDDEN",
        message: decision.message || "Request blocked",
      },
      statusCode
    );
  }

  await next();
});
