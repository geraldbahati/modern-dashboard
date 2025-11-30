/**
 * Arcjet security for Node.js/Hono applications
 * Import from "@workspace/security/node"
 */

import arcjet, { shield, detectBot, fixedWindow, slidingWindow } from "@arcjet/node";
import {
  shieldConfig,
  authRateLimitConfig,
  apiRateLimitConfig,
  defaultCharacteristics,
  getDefaultMode,
} from "./rules";

// Re-export rules for custom configurations
export * from "./rules";

/**
 * Create base Arcjet client for Node.js/Hono
 */
export const createArcjet = (key: string) => {
  return arcjet({
    key,
    characteristics: [...defaultCharacteristics],
    rules: [
      // Shield WAF - always on
      shield(shieldConfig),
      // Bot detection - allow search engines, monitors, previews
      detectBot({
        mode: getDefaultMode(),
        allow: [
          "CATEGORY:SEARCH_ENGINE",
          "CATEGORY:MONITOR",
          "CATEGORY:PREVIEW",
        ],
      }),
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
    characteristics: [...defaultCharacteristics],
    rules: [
      shield(shieldConfig),
      detectBot({
        mode: getDefaultMode(),
        allow: [
          "CATEGORY:SEARCH_ENGINE",
          "CATEGORY:MONITOR",
          "CATEGORY:PREVIEW",
        ],
      }),
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
    characteristics: [...defaultCharacteristics],
    rules: [
      shield(shieldConfig),
      detectBot({
        mode: getDefaultMode(),
        allow: [
          "CATEGORY:SEARCH_ENGINE",
          "CATEGORY:MONITOR",
          "CATEGORY:PREVIEW",
        ],
      }),
      fixedWindow(apiRateLimitConfig),
    ],
  });
};

// Re-export utilities
export { arcjet, shield, detectBot, fixedWindow, slidingWindow };
