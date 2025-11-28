/**
 * Health router - public health check endpoints
 * Includes system health, database status, and security info
 */

import { z } from "zod";
import { publicProcedure, adminProcedure } from "../middleware/auth.js";
import { authDb } from "@workspace/db/auth-db";
import { sql } from "drizzle-orm";

// Health status enum
const healthStatusSchema = z.enum(["healthy", "degraded", "unhealthy"]);

// Basic health check response
const basicHealthSchema = z.object({
  status: healthStatusSchema,
  timestamp: z.string(),
  uptime: z.number(),
});

// Detailed health check response (admin only)
const detailedHealthSchema = z.object({
  status: healthStatusSchema,
  timestamp: z.string(),
  uptime: z.number(),
  version: z.string(),
  services: z.object({
    database: z.object({
      status: healthStatusSchema,
      latency: z.number().optional(),
      error: z.string().optional(),
    }),
    security: z.object({
      status: healthStatusSchema,
      arcjetEnabled: z.boolean(),
    }),
  }),
  system: z.object({
    nodeVersion: z.string(),
    platform: z.string(),
    memoryUsage: z.object({
      heapUsed: z.number(),
      heapTotal: z.number(),
      rss: z.number(),
    }),
  }),
});

// Track server start time for uptime calculation
const startTime = Date.now();

/**
 * Basic health check - public endpoint
 * Returns minimal health info for uptime monitors
 */
export const check = publicProcedure
  .route({ method: "GET", path: "/health/check" })
  .output(basicHealthSchema)
  .handler(async () => {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
    };
  });

/**
 * Ping endpoint - simple liveness check
 */
export const ping = publicProcedure
  .route({ method: "GET", path: "/health/ping" })
  .output(z.object({ pong: z.boolean() }))
  .handler(async () => {
    return { pong: true };
  });

/**
 * Database health check
 */
async function checkDatabase(): Promise<{
  status: "healthy" | "degraded" | "unhealthy";
  latency?: number;
  error?: string;
}> {
  const dbStart = Date.now();
  try {
    await authDb.execute(sql`SELECT 1`);
    return {
      status: "healthy",
      latency: Date.now() - dbStart,
    };
  } catch (err) {
    return {
      status: "unhealthy",
      latency: Date.now() - dbStart,
      error: err instanceof Error ? err.message : "Database connection failed",
    };
  }
}

/**
 * Detailed health check - admin only
 * Returns comprehensive system health information
 */
export const detailed = adminProcedure
  .output(detailedHealthSchema)
  .handler(async () => {
    const dbHealth = await checkDatabase();

    // Check if Arcjet is configured
    const arcjetEnabled = !!process.env.ARCJET_KEY;

    // Determine overall status
    let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";
    if (dbHealth.status === "unhealthy") {
      overallStatus = "unhealthy";
    } else if (dbHealth.status === "degraded" || !arcjetEnabled) {
      overallStatus = "degraded";
    }

    const memUsage = process.memoryUsage();

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      version: process.env.npm_package_version || "1.0.0",
      services: {
        database: dbHealth,
        security: {
          status: arcjetEnabled ? "healthy" : "degraded",
          arcjetEnabled,
        },
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsage: {
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memUsage.rss / 1024 / 1024),
        },
      },
    };
  });

/**
 * Ready check - for Kubernetes readiness probes
 * Checks if the service is ready to accept traffic
 */
export const ready = publicProcedure
  .route({ method: "GET", path: "/health/ready" })
  .output(
    z.object({
      ready: z.boolean(),
      checks: z.object({
        database: z.boolean(),
      }),
    })
  )
  .handler(async () => {
    const dbHealth = await checkDatabase();

    return {
      ready: dbHealth.status === "healthy",
      checks: {
        database: dbHealth.status === "healthy",
      },
    };
  });

/**
 * Live check - for Kubernetes liveness probes
 * Simple check that the service is running
 */
export const live = publicProcedure
  .route({ method: "GET", path: "/health/live" })
  .output(z.object({ alive: z.boolean() }))
  .handler(async () => {
    return { alive: true };
  });

export const healthRouter = {
  check,
  ping,
  detailed,
  ready,
  live,
};
