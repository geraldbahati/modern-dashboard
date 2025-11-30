/**
 * Arcjet security for Next.js applications
 * Import from "@workspace/security/next"
 */

import arcjet, {
  shield,
  detectBot,
  fixedWindow,
  createMiddleware,
} from "@arcjet/next";
import {
  shieldConfig,
  botConfig,
  authRateLimitConfig,
  apiRateLimitConfig,
} from "./rules";

// Re-export rules for custom configurations
export * from "./rules";

/**
 * Create base Arcjet client for Next.js
 */
export const createArcjet = (key: string) => {
  return arcjet({
    key,
    rules: [
      // Shield WAF - always on
      shield(shieldConfig),
      // Bot detection
      detectBot(botConfig),
    ],
  });
};

/**
 * Create Arcjet client with auth-specific rate limiting
 * Use this for protecting /api/auth/* routes
 */
export const createAuthArcjet = (key: string) => {
  return arcjet({
    key,
    rules: [
      shield(shieldConfig),
      detectBot(botConfig),
      // Stricter rate limiting for auth routes
      fixedWindow(authRateLimitConfig),
    ],
  });
};

/**
 * Create Arcjet client with API rate limiting
 * Use this for general API routes
 */
export const createApiArcjet = (key: string) => {
  return arcjet({
    key,
    rules: [
      shield(shieldConfig),
      detectBot(botConfig),
      fixedWindow(apiRateLimitConfig),
    ],
  });
};

/**
 * Create Next.js middleware with Arcjet protection
 * Use in middleware.ts
 */
export const createArcjetMiddleware = (key: string) => {
  const aj = createArcjet(key);
  return createMiddleware(aj);
};

// Re-export utilities
export { arcjet, shield, detectBot, fixedWindow, createMiddleware };
