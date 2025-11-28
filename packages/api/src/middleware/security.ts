/**
 * oRPC security middlewares using Arcjet
 * Provides rate limiting and security protection for API routes
 */

import { ORPCError } from "@orpc/server";
import {
  createArcjet,
  slidingWindow,
  readRateLimitConfig,
  writeRateLimitConfig,
  heavyWriteRateLimitConfig,
} from "@workspace/security/node";
import { publicProcedure, protectedProcedure } from "./auth.js";
import type { IncomingMessage } from "node:http";

// Get Arcjet key from environment
const ARCJET_KEY = process.env.ARCJET_KEY || "";

// Base Arcjet client with shield and bot detection
const baseArcjet = createArcjet(ARCJET_KEY);

// Create dedicated Arcjet instances at module level to maintain state across requests
// IMPORTANT: These must be constants, not functions, to maintain state between requests

/**
 * Read operations rate limiter (180 req/min)
 * For GET requests - list, getById, etc.
 */
const readArcjet = baseArcjet.withRule(
  slidingWindow(readRateLimitConfig)
);

/**
 * Write operations rate limiter (40 req/min)
 * For POST, PATCH, PUT requests - create, update
 */
const writeArcjet = baseArcjet.withRule(
  slidingWindow(writeRateLimitConfig)
);

/**
 * Heavy write operations rate limiter (2 req/min)
 * For bulk operations, file uploads, etc.
 */
const heavyWriteArcjet = baseArcjet.withRule(
  slidingWindow(heavyWriteRateLimitConfig)
);

/**
 * Standard security (shield + bot detection only, no rate limit)
 * For routes that need protection but custom rate limiting
 */
const standardArcjet = baseArcjet;

// ============================================================================
// Security Middlewares for Protected Routes (require authentication)
// ============================================================================

/**
 * Read security middleware - for GET/list operations
 * Rate limit: 180 requests per minute
 */
export const readSecurityProcedure = protectedProcedure.use(
  async ({ context, next }) => {
    const decision = await readArcjet.protect(context.request as unknown as IncomingMessage, {
      userId: context.user.id,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new ORPCError("TOO_MANY_REQUESTS", {
          message: "Too many read requests. Please slow down.",
        });
      }

      if (decision.reason.isBot()) {
        throw new ORPCError("FORBIDDEN", {
          message: "Automated traffic blocked.",
        });
      }

      if (decision.reason.isShield()) {
        throw new ORPCError("FORBIDDEN", {
          message: "Request blocked by security policy.",
        });
      }

      throw new ORPCError("FORBIDDEN", {
        message: "Request blocked.",
      });
    }

    return next({ context });
  }
);

/**
 * Write security middleware - for POST/PATCH/PUT operations
 * Rate limit: 40 requests per minute
 */
export const writeSecurityProcedure = protectedProcedure.use(
  async ({ context, next }) => {
    const decision = await writeArcjet.protect(context.request as unknown as IncomingMessage, {
      userId: context.user.id,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new ORPCError("TOO_MANY_REQUESTS", {
          message: "Too many write requests. Please slow down.",
        });
      }

      if (decision.reason.isBot()) {
        throw new ORPCError("FORBIDDEN", {
          message: "Automated traffic blocked.",
        });
      }

      if (decision.reason.isShield()) {
        throw new ORPCError("FORBIDDEN", {
          message: "Request blocked by security policy.",
        });
      }

      throw new ORPCError("FORBIDDEN", {
        message: "Request blocked.",
      });
    }

    return next({ context });
  }
);

/**
 * Heavy write security middleware - for bulk/expensive operations
 * Rate limit: 2 requests per minute
 */
export const heavyWriteSecurityProcedure = protectedProcedure.use(
  async ({ context, next }) => {
    const decision = await heavyWriteArcjet.protect(context.request as unknown as IncomingMessage, {
      userId: context.user.id,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new ORPCError("TOO_MANY_REQUESTS", {
          message: "Too many heavy write requests. Please slow down.",
        });
      }

      if (decision.reason.isBot()) {
        throw new ORPCError("FORBIDDEN", {
          message: "Automated traffic blocked.",
        });
      }

      if (decision.reason.isShield()) {
        throw new ORPCError("FORBIDDEN", {
          message: "Request blocked by security policy.",
        });
      }

      throw new ORPCError("FORBIDDEN", {
        message: "Request blocked.",
      });
    }

    return next({ context });
  }
);

/**
 * Standard security middleware - shield + bot detection only
 * No rate limiting, for routes with custom rate limit needs
 */
export const standardSecurityProcedure = protectedProcedure.use(
  async ({ context, next }) => {
    const decision = await standardArcjet.protect(context.request as unknown as IncomingMessage, {
      userId: context.user.id,
    });

    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        throw new ORPCError("FORBIDDEN", {
          message: "Automated traffic blocked.",
        });
      }

      if (decision.reason.isShield()) {
        throw new ORPCError("FORBIDDEN", {
          message: "Request blocked by security policy (WAF).",
        });
      }

      throw new ORPCError("FORBIDDEN", {
        message: "Request blocked.",
      });
    }

    return next({ context });
  }
);

// ============================================================================
// Security Middlewares for Public Routes (no authentication required)
// ============================================================================

/**
 * Public read security middleware
 * For public GET routes without authentication
 */
export const publicReadSecurityProcedure = publicProcedure.use(
  async ({ context, next }) => {
    // For public routes, use anonymous userId since we can't identify the user
    const decision = await readArcjet.protect(context.request as unknown as IncomingMessage, {
      userId: "anonymous",
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new ORPCError("TOO_MANY_REQUESTS", {
          message: "Too many requests. Please slow down.",
        });
      }

      if (decision.reason.isBot()) {
        throw new ORPCError("FORBIDDEN", {
          message: "Automated traffic blocked.",
        });
      }

      if (decision.reason.isShield()) {
        throw new ORPCError("FORBIDDEN", {
          message: "Request blocked by security policy.",
        });
      }

      throw new ORPCError("FORBIDDEN", {
        message: "Request blocked.",
      });
    }

    return next({ context });
  }
);

/**
 * Public standard security middleware
 * Shield + bot detection for public routes
 */
export const publicStandardSecurityProcedure = publicProcedure.use(
  async ({ context, next }) => {
    const decision = await standardArcjet.protect(context.request as unknown as IncomingMessage, {
      userId: "anonymous",
    });

    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        throw new ORPCError("FORBIDDEN", {
          message: "Automated traffic blocked.",
        });
      }

      if (decision.reason.isShield()) {
        throw new ORPCError("FORBIDDEN", {
          message: "Request blocked by security policy.",
        });
      }

      throw new ORPCError("FORBIDDEN", {
        message: "Request blocked.",
      });
    }

    return next({ context });
  }
);
