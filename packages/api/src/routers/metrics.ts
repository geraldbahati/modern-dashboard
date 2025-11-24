/**
 * Metrics router - oRPC procedures for dashboard metrics
 */

import { sql, count, gte, and, eq } from "drizzle-orm";
import { publicReadSecurityProcedure } from "../middleware/security";
import { dashboardMetricsSchema, type MetricTrend } from "../schemas";
import { authDb } from "@workspace/db/auth-db";
import * as authSchema from "@workspace/db/auth-db/schema";
import { appDb } from "@workspace/db/app-db";
import * as appSchema from "@workspace/db/app-db/schema";

/**
 * Calculate trend based on change percentage
 */
function calculateTrend(change: number): MetricTrend {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "neutral";
}

/**
 * Calculate percentage change between two values
 */
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Get dashboard metrics
 * Returns all key metrics for the dashboard in a single call
 *
 * Uses publicReadSecurityProcedure for rate limiting (180 req/min)
 */
export const getDashboardMetrics = publicReadSecurityProcedure
  .output(dashboardMetricsSchema)
  .handler(async () => {
    const now = new Date();

    // Date ranges
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // =========================================================================
    // 1. Active Users (users with sessions in last 7 days)
    // =========================================================================
    const [activeUsersCurrentResult] = await authDb
      .select({ count: count() })
      .from(authSchema.session)
      .where(
        and(
          gte(authSchema.session.createdAt, sevenDaysAgo),
          gte(authSchema.session.expiresAt, now)
        )
      );

    const [activeUsersPreviousResult] = await authDb
      .select({ count: count() })
      .from(authSchema.session)
      .where(
        and(
          gte(authSchema.session.createdAt, fourteenDaysAgo),
          sql`${authSchema.session.createdAt} < ${sevenDaysAgo}`
        )
      );

    const activeUsersCurrent = activeUsersCurrentResult?.count ?? 0;
    const activeUsersPrevious = activeUsersPreviousResult?.count ?? 0;
    const activeUsersChange = calculateChange(activeUsersCurrent, activeUsersPrevious);

    // =========================================================================
    // 2. Average Task Completion Time (in hours)
    // =========================================================================
    const [avgCompletionTimeResult] = await appDb
      .select({
        avgHours: sql<number>`
          COALESCE(
            AVG(
              EXTRACT(EPOCH FROM (${appSchema.tasks.completedAt} - ${appSchema.tasks.createdAt})) / 3600
            ),
            0
          )
        `.as("avg_hours"),
      })
      .from(appSchema.tasks)
      .where(
        and(
          eq(appSchema.tasks.status, "done"),
          gte(appSchema.tasks.completedAt, sevenDaysAgo)
        )
      );

    const [avgCompletionTimePrevResult] = await appDb
      .select({
        avgHours: sql<number>`
          COALESCE(
            AVG(
              EXTRACT(EPOCH FROM (${appSchema.tasks.completedAt} - ${appSchema.tasks.createdAt})) / 3600
            ),
            0
          )
        `.as("avg_hours"),
      })
      .from(appSchema.tasks)
      .where(
        and(
          eq(appSchema.tasks.status, "done"),
          gte(appSchema.tasks.completedAt, fourteenDaysAgo),
          sql`${appSchema.tasks.completedAt} < ${sevenDaysAgo}`
        )
      );

    const avgCompletionHours = Math.round(avgCompletionTimeResult?.avgHours ?? 0);
    const avgCompletionHoursPrev = Math.round(avgCompletionTimePrevResult?.avgHours ?? 0);
    // For response time, negative change is good (faster)
    const avgTimeChange = avgCompletionHoursPrev > 0
      ? -calculateChange(avgCompletionHours, avgCompletionHoursPrev)
      : 0;

    // =========================================================================
    // 3. Task Completion Rate (last 30 days)
    // =========================================================================
    const [totalTasksResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(gte(appSchema.tasks.createdAt, thirtyDaysAgo));

    const [completedTasksResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(
        and(
          eq(appSchema.tasks.status, "done"),
          gte(appSchema.tasks.createdAt, thirtyDaysAgo)
        )
      );

    const [totalTasksPrevResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(
        and(
          gte(appSchema.tasks.createdAt, sixtyDaysAgo),
          sql`${appSchema.tasks.createdAt} < ${thirtyDaysAgo}`
        )
      );

    const [completedTasksPrevResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(
        and(
          eq(appSchema.tasks.status, "done"),
          gte(appSchema.tasks.createdAt, sixtyDaysAgo),
          sql`${appSchema.tasks.createdAt} < ${thirtyDaysAgo}`
        )
      );

    const totalTasks = totalTasksResult?.count ?? 0;
    const completedTasks = completedTasksResult?.count ?? 0;
    const totalTasksPrev = totalTasksPrevResult?.count ?? 0;
    const completedTasksPrev = completedTasksPrevResult?.count ?? 0;

    const completionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;
    const completionRatePrev = totalTasksPrev > 0
      ? Math.round((completedTasksPrev / totalTasksPrev) * 100)
      : 0;
    const completionChange = completionRate - completionRatePrev;

    // =========================================================================
    // 4. Total Projects (this month vs last month)
    // =========================================================================
    const [totalProjectsResult] = await appDb
      .select({ count: count() })
      .from(appSchema.projects)
      .where(eq(appSchema.projects.status, "active"));

    const [newProjectsThisMonthResult] = await appDb
      .select({ count: count() })
      .from(appSchema.projects)
      .where(
        and(
          eq(appSchema.projects.status, "active"),
          gte(appSchema.projects.createdAt, startOfMonth)
        )
      );

    const [newProjectsLastMonthResult] = await appDb
      .select({ count: count() })
      .from(appSchema.projects)
      .where(
        and(
          eq(appSchema.projects.status, "active"),
          gte(appSchema.projects.createdAt, startOfLastMonth),
          sql`${appSchema.projects.createdAt} <= ${endOfLastMonth}`
        )
      );

    const totalProjects = totalProjectsResult?.count ?? 0;
    const newProjectsThisMonth = newProjectsThisMonthResult?.count ?? 0;
    const newProjectsLastMonth = newProjectsLastMonthResult?.count ?? 0;
    const projectsChange = newProjectsThisMonth - newProjectsLastMonth;

    return {
      activeUsers: {
        label: "Active Users",
        value: activeUsersCurrent,
        change: activeUsersChange,
        trend: calculateTrend(activeUsersChange),
        period: "vs last 7 days",
      },
      avgResponseTime: {
        label: "Avg. Completion Time",
        value: avgCompletionHours,
        unit: "hrs",
        change: avgTimeChange,
        trend: calculateTrend(avgTimeChange),
        period: "vs last 7 days",
      },
      taskCompletion: {
        label: "Task Completion",
        value: completionRate,
        unit: "%",
        change: completionChange,
        trend: calculateTrend(completionChange),
        period: "vs last 30 days",
      },
      totalProjects: {
        label: "Total Projects",
        value: totalProjects,
        change: projectsChange,
        trend: calculateTrend(projectsChange),
        period: "vs last month",
      },
    };
  });

// Metrics router
export const metricsRouter = {
  getDashboardMetrics,
};
