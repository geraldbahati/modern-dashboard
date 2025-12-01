/**
 * Security middleware for Cloudflare Workers
 * NOTE: Arcjet's Node.js SDK doesn't work in Cloudflare Workers
 * For production, use Cloudflare's built-in security features:
 * - Rate Limiting: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
 * - WAF: Configure in Cloudflare Dashboard
 * - Bot Management: Use Cloudflare Bot Management
 *
 * For now, this is a passthrough middleware
 */

import { createMiddleware } from "hono/factory";
import type { AuthVariables } from "./auth";

// Note: Arcjet doesn't support Cloudflare Workers yet
// Using passthrough middleware for now
const authArcjet = null;
const apiArcjet = null;

/**
 * Security middleware for auth routes (/api/auth/*)
 * Passthrough for now - use Cloudflare's security features in production
 */
export const authSecurityMiddleware = createMiddleware<{
  Variables: AuthVariables;
}>(async (c, next) => {
  // TODO: Implement Cloudflare Workers rate limiting
  // See: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
  await next();
});

/**
 * Security middleware for general API routes
 * Passthrough for now - use Cloudflare's security features in production
 */
export const apiSecurityMiddleware = createMiddleware<{
  Variables: AuthVariables;
}>(async (c, next) => {
  // TODO: Implement Cloudflare Workers rate limiting
  // See: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
  await next();
});
