/**
 * Analytics Router - Comprehensive analytics and insights
 */

import { z } from "zod";
import {
  readSecurityProcedure,
  publicReadSecurityProcedure,
} from "../middleware/security.js";
import { protectedProcedure } from "../middleware/auth.js";
import { AnalyticsService } from "../services/analytics";

/**
 * Dashboard Overview - High-level metrics
 */
export const getDashboardOverview = readSecurityProcedure
  .input(
    z.object({
      period: z.enum(["today", "7d", "30d", "90d", "1y", "all"]).default("30d"),
    })
  )
  .output(
    z.object({
      totalUsers: z.number(),
      totalProjects: z.number(),
      totalTasks: z.number(),
      completedTasks: z.number(),
      activeMembers: z.number(),
      completionRate: z.number(),
      trends: z.object({
        users: z.number(),
        projects: z.number(),
        tasks: z.number(),
      }),
    })
  )
  .handler(async ({ input }) => {
    return AnalyticsService.getDashboardOverview(input);
  });

/**
 * Project Analytics - Project performance metrics
 */
export const getProjectAnalytics = protectedProcedure
  .input(
    z.object({
      projectId: z.string().uuid(),
      period: z.enum(["7d", "30d", "90d", "all"]).default("30d"),
    })
  )
  .output(
    z.object({
      totalTasks: z.number(),
      completedTasks: z.number(),
      inProgressTasks: z.number(),
      todoTasks: z.number(),
      completionRate: z.number(),
      velocity: z.number(),
      averageCompletionTime: z.number(),
      overduePercentage: z.number(),
    })
  )
  .handler(async ({ input }) => {
    return AnalyticsService.getProjectAnalytics(input);
  });

/**
 * Task Distribution - Overview of task statuses
 */
export const getTaskDistribution = protectedProcedure
  .input(
    z.object({
      projectId: z.string().uuid().optional(),
      organizationId: z.string().optional(),
    })
  )
  .output(
    z.object({
      todo: z.number(),
      inProgress: z.number(),
      done: z.number(),
      byPriority: z.object({
        low: z.number(),
        medium: z.number(),
        high: z.number(),
      }),
    })
  )
  .handler(async ({ input }) => {
    return AnalyticsService.getTaskDistribution(input);
  });

/**
 * Resource Allocation - Team workload and capacity
 */
export const getResourceAllocation = protectedProcedure
  .input(
    z.object({
      organizationId: z.string().optional(),
      projectId: z.string().uuid().optional(),
    })
  )
  .output(
    z.object({
      workload: z.array(
        z.object({
          name: z.string(),
          assigned: z.number(),
          capacity: z.number(),
          image: z.string().nullable(),
        })
      ),
      projectDistribution: z.array(
        z.object({
          subject: z.string(),
          A: z.number(),
          fullMark: z.number(),
        })
      ),
      availability: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          role: z.string(),
          image: z.string().nullable(),
          status: z.enum(["available", "busy", "overloaded"]),
          currentTask: z.string().nullable(),
        })
      ),
    })
  )
  .handler(async ({ input, context }) => {
    return AnalyticsService.getResourceAllocation({
      userId: context.user.id,
      ...input,
    });
  });

/**
 * Predictive Analytics - AI-powered project forecasting
 */
export const getPredictiveAnalytics = protectedProcedure
  .input(
    z.object({
      projectId: z.string().uuid(),
      forecastDays: z.number().min(7).max(90).default(30),
    })
  )
  .output(
    z.object({
      forecast: z.array(
        z.object({
          date: z.string(),
          actual: z.number().nullable(),
          predicted: z.number().nullable(),
          lowerBound: z.number().nullable(),
          upperBound: z.number().nullable(),
        })
      ),
      insights: z.array(
        z.object({
          id: z.string(),
          type: z.enum(["positive", "negative", "neutral"]),
          title: z.string(),
          description: z.string(),
          impact: z.enum(["high", "medium", "low"]),
        })
      ),
      drivers: z.array(
        z.object({
          name: z.string(),
          impact: z.number(),
        })
      ),
      summary: z.object({
        predictedCompletionDate: z.date(),
        confidenceScore: z.number(),
        riskLevel: z.enum(["low", "medium", "high"]),
      }),
    })
  )
  .handler(async ({ input }) => {
    return AnalyticsService.getPredictiveAnalytics(input);
  });

/**
 * Detailed User Analytics - With full chart data
 */
export const getUserAnalyticsDetailed = protectedProcedure
  .input(
    z.object({
      userId: z.string().optional(),
      period: z.enum(["7d", "30d", "90d"]).default("30d"),
      includeCharts: z.boolean().default(true),
    })
  )
  .output(
    z.object({
      activity: z.array(z.object({ date: z.string(), tasks: z.number() })),
      taskDistribution: z.array(
        z.object({ name: z.string(), value: z.number(), color: z.string() })
      ),
      performance: z.array(
        z.object({
          week: z.string(),
          completed: z.number(),
          assigned: z.number(),
        })
      ),
      metrics: z.object({
        totalTasks: z.number(),
        completionRate: z.number(),
        avgCompletionTime: z.number(),
        efficiency: z.number(),
      }),
    })
  )
  .handler(async ({ input, context }) => {
    return AnalyticsService.getUserAnalyticsDetailed({
      userId: input.userId || context.user.id,
      period: input.period,
      includeCharts: input.includeCharts,
    });
  });

// Export router
export const analyticsRouter = {
  getDashboardOverview,
  getProjectAnalytics,
  getTaskDistribution,
  getResourceAllocation,
  getPredictiveAnalytics,
  getUserAnalyticsDetailed,
};
