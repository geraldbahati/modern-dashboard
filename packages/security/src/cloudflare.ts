/**
 * Cloudflare Workers security implementation
 * Uses Cloudflare's native Rate Limiting API
 * Import from "@workspace/security/cloudflare"
 */

// Re-export rules for configuration
export * from "./rules";

/**
 * Cloudflare Rate Limit binding type
 * https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
 */
export interface RateLimitBinding {
  limit(options: {
    key: string | { [key: string]: string };
  }): Promise<RateLimitResult>;
}

export interface RateLimitResult {
  success: boolean;
}

/**
 * Security decision result for Cloudflare Workers
 */
export interface SecurityDecision {
  allowed: boolean;
  reason?: "RATE_LIMIT" | "BOT" | "SHIELD" | "FORBIDDEN";
  message?: string;
}

/**
 * Check if request exceeds rate limit using Cloudflare's Rate Limiting API
 *
 * @param rateLimiter - Cloudflare Rate Limit binding from env
 * @param userId - User ID or "anonymous" for unauthenticated requests
 * @returns Security decision
 *
 * @example
 * ```ts
 * const decision = await checkRateLimit(c.env.RATE_LIMITER, userId);
 * if (!decision.allowed) {
 *   return c.json({ error: decision.message }, 429);
 * }
 * ```
 */
export async function checkRateLimit(
  rateLimiter: RateLimitBinding | undefined,
  userId: string
): Promise<SecurityDecision> {
  // If rate limiter is not configured, allow the request
  if (!rateLimiter) {
    console.warn("Rate limiter binding not configured - allowing request");
    return { allowed: true };
  }

  try {
    const result = await rateLimiter.limit({ key: userId });

    if (!result.success) {
      return {
        allowed: false,
        reason: "RATE_LIMIT",
        message: "Too many requests. Please slow down.",
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Fail open - allow the request if rate limiter fails
    return { allowed: true };
  }
}

/**
 * Simple bot detection for Cloudflare Workers
 * Uses User-Agent header to detect common bots
 *
 * For production, use Cloudflare Bot Management:
 * https://developers.cloudflare.com/bots/
 */
export function detectBot(userAgent: string | null): SecurityDecision {
  if (!userAgent) {
    return { allowed: true };
  }

  const ua = userAgent.toLowerCase();

  // Allow search engines and monitors
  const allowedBots = [
    "googlebot",
    "bingbot",
    "slackbot",
    "twitterbot",
    "facebookexternalhit",
    "linkedinbot",
    "discordbot",
    "uptimerobot",
    "pingdom",
  ];

  // Block known malicious bots
  const blockedBots = [
    "scrapy",
    "crawler",
    "spider",
    "scraper",
    "bot",
  ];

  // Check if it's an allowed bot
  if (allowedBots.some((bot) => ua.includes(bot))) {
    return { allowed: true };
  }

  // Check if it's a blocked bot
  if (blockedBots.some((bot) => ua.includes(bot))) {
    return {
      allowed: false,
      reason: "BOT",
      message: "Automated traffic blocked.",
    };
  }

  return { allowed: true };
}

/**
 * Basic WAF (Web Application Firewall) checks
 * Detects common attack patterns in requests
 *
 * For production, use Cloudflare WAF:
 * https://developers.cloudflare.com/waf/
 */
export function checkWAF(url: string, body?: string): SecurityDecision {
  const suspiciousPatterns = [
    // SQL Injection
    /(\bor\b|\band\b).*(=|<|>)/i,
    /union.*select/i,
    /select.*from/i,
    /(;|\s)drop\s+(table|database)/i,

    // XSS
    /<script.*>/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onload, etc.

    // Path Traversal
    /\.\.\//,
    /\.\.\\\\/,

    // Command Injection
    /[;&|`$()]/,
  ];

  const fullText = `${url} ${body || ""}`;

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fullText)) {
      return {
        allowed: false,
        reason: "SHIELD",
        message: "Request blocked by security policy.",
      };
    }
  }

  return { allowed: true };
}

/**
 * Combined security check for Cloudflare Workers
 * Runs all security checks: rate limit, bot detection, WAF
 *
 * @example
 * ```ts
 * const decision = await checkSecurity({
 *   rateLimiter: c.env.RATE_LIMITER,
 *   userId: user?.id || "anonymous",
 *   userAgent: c.req.header("user-agent"),
 *   url: c.req.url,
 *   body: await c.req.text(),
 * });
 *
 * if (!decision.allowed) {
 *   return c.json({ error: decision.message }, 403);
 * }
 * ```
 */
export async function checkSecurity(options: {
  rateLimiter?: RateLimitBinding;
  userId: string;
  userAgent?: string | null;
  url: string;
  body?: string;
}): Promise<SecurityDecision> {
  // Check rate limit first
  const rateLimitDecision = await checkRateLimit(
    options.rateLimiter,
    options.userId
  );
  if (!rateLimitDecision.allowed) {
    return rateLimitDecision;
  }

  // Check for bots
  const botDecision = detectBot(options.userAgent || null);
  if (!botDecision.allowed) {
    return botDecision;
  }

  // Check WAF rules
  const wafDecision = checkWAF(options.url, options.body);
  if (!wafDecision.allowed) {
    return wafDecision;
  }

  return { allowed: true };
}
