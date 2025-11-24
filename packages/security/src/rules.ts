/**
 * Shared Arcjet security rules configuration
 * Used by both Next.js and Hono applications
 */

// Rule mode types
export type RuleMode = "LIVE" | "DRY_RUN";

// Default mode - use DRY_RUN for development, LIVE for production
export const getDefaultMode = (): RuleMode => {
  return process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN";
};

/**
 * Shield WAF configuration
 * Protects against SQL injection, XSS, and other common attacks
 */
export const shieldConfig = {
  mode: getDefaultMode(),
} as const;

/**
 * Bot detection configuration
 * Allows legitimate bots (search engines, monitoring) while blocking malicious ones
 */
export const botConfig = {
  mode: getDefaultMode(),
  allow: [
    "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc.
    "CATEGORY:MONITOR", // Uptime monitors
    "CATEGORY:PREVIEW", // Link previews
  ] as const,
  deny: [] as const, // Block nothing explicitly, rely on allow list
};

/**
 * Rate limiting for auth routes (stricter)
 * Prevents brute force attacks on login/signup
 */
export const authRateLimitConfig = {
  mode: getDefaultMode(),
  window: "1m",
  max: 10, // 10 requests per minute for auth routes
} as const;

/**
 * Rate limiting for general API routes
 */
export const apiRateLimitConfig = {
  mode: getDefaultMode(),
  window: "1m",
  max: 100, // 100 requests per minute for general API
} as const;

/**
 * Rate limiting for read operations (GET requests)
 * Higher limit since reads are less expensive
 */
export const readRateLimitConfig = {
  mode: getDefaultMode(),
  interval: "1m",
  max: 180, // 180 requests per minute for reads
} as const;

/**
 * Rate limiting for write operations (POST, PATCH, PUT)
 * More restrictive than reads
 */
export const writeRateLimitConfig = {
  mode: getDefaultMode(),
  interval: "1m",
  max: 40, // 40 requests per minute for writes
} as const;

/**
 * Rate limiting for heavy write operations (bulk operations, file uploads)
 * Very restrictive to prevent abuse
 */
export const heavyWriteRateLimitConfig = {
  mode: getDefaultMode(),
  interval: "1m",
  max: 2, // 2 requests per minute for heavy writes
} as const;

/**
 * Rate limiting for sensitive operations (password reset, etc.)
 */
export const sensitiveRateLimitConfig = {
  mode: getDefaultMode(),
  window: "1h",
  max: 5, // 5 requests per hour
} as const;

/**
 * Email validation configuration for signup
 */
export const emailValidationConfig = {
  mode: getDefaultMode(),
  block: [
    "DISPOSABLE", // Block disposable email addresses
    "INVALID", // Block invalid email formats
    "NO_MX_RECORDS", // Block domains without mail servers
  ],
} as const;

/**
 * Characteristics for identifying clients
 * Used for rate limiting and fingerprinting
 * Using userId as fallback when IP is not available (local development)
 */
export const defaultCharacteristics = ["userId"] as const;

/**
 * Auth route characteristics - track by userId
 */
export const authCharacteristics = ["userId"] as const;
