/**
 * Analytics Router - Comprehensive analytics and insights
 */

import { z } from "zod";
import { sql, count, eq, and, gte } from "drizzle-orm";
import { readSecurityProcedure } from "../middleware/security";
import { protectedProcedure } from "../middleware/auth";
import { authDb } from "@workspace/db/auth-db";
import * as authSchema from "@workspace/db/auth-db/schema";
import { appDb } from "@workspace/db/app-db";
import * as appSchema from "@workspace/db/app-db/schema";

// Helper to get date range
function getDateRange(period: string): Date {
  const now = new Date();
  const ranges: Record<string, Date> = {
    today: new Date(now.setHours(0, 0, 0, 0)),
    "7d": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    "30d": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    "90d": new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    "1y": new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
  };
  return ranges[period] ?? ranges["30d"]!;
}

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
    const startDate = input.period === "all" ? new Date(0) : getDateRange(input.period);
    const now = new Date();
    const halfPeriod = new Date((now.getTime() + startDate.getTime()) / 2);

    // Total users
    const [usersResult] = await authDb
      .select({ count: count() })
      .from(authSchema.user);
    const totalUsers = usersResult?.count ?? 0;

    // Total projects (active)
    const [projectsResult] = await appDb
      .select({ count: count() })
      .from(appSchema.projects)
      .where(eq(appSchema.projects.status, "active"));
    const totalProjects = projectsResult?.count ?? 0;

    // Total tasks in period
    const [tasksResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(gte(appSchema.tasks.createdAt, startDate));
    const totalTasks = tasksResult?.count ?? 0;

    // Completed tasks in period
    const [completedResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(
        and(
          eq(appSchema.tasks.status, "done"),
          gte(appSchema.tasks.createdAt, startDate)
        )
      );
    const completedTasks = completedResult?.count ?? 0;

    // Active members (users with sessions in last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const [activeMembersResult] = await authDb
      .select({ count: sql<number>`COUNT(DISTINCT ${authSchema.session.userId})` })
      .from(authSchema.session)
      .where(
        and(
          gte(authSchema.session.createdAt, sevenDaysAgo),
          gte(authSchema.session.expiresAt, now)
        )
      );
    const activeMembers = Number(activeMembersResult?.count ?? 0);

    // Completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Trends (compare first half vs second half of period)
    const [usersFirstHalf] = await authDb
      .select({ count: count() })
      .from(authSchema.user)
      .where(sql`${authSchema.user.createdAt} < ${halfPeriod}`);

    const [projectsFirstHalf] = await appDb
      .select({ count: count() })
      .from(appSchema.projects)
      .where(
        and(
          gte(appSchema.projects.createdAt, startDate),
          sql`${appSchema.projects.createdAt} < ${halfPeriod}`
        )
      );

    const [projectsSecondHalf] = await appDb
      .select({ count: count() })
      .from(appSchema.projects)
      .where(gte(appSchema.projects.createdAt, halfPeriod));

    const [tasksFirstHalf] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(
        and(
          gte(appSchema.tasks.createdAt, startDate),
          sql`${appSchema.tasks.createdAt} < ${halfPeriod}`
        )
      );

    const [tasksSecondHalf] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(gte(appSchema.tasks.createdAt, halfPeriod));

    const projectsFirst = projectsFirstHalf?.count ?? 0;
    const projectsSecond = projectsSecondHalf?.count ?? 0;
    const tasksFirst = tasksFirstHalf?.count ?? 0;
    const tasksSecond = tasksSecondHalf?.count ?? 0;

    return {
      totalUsers,
      totalProjects,
      totalTasks,
      completedTasks,
      activeMembers,
      completionRate,
      trends: {
        users: totalUsers > 0 ? Math.round(((totalUsers - (usersFirstHalf?.count ?? 0)) / Math.max(usersFirstHalf?.count ?? 1, 1)) * 100) : 0,
        projects: projectsFirst > 0 ? Math.round(((projectsSecond - projectsFirst) / projectsFirst) * 100) : 0,
        tasks: tasksFirst > 0 ? Math.round(((tasksSecond - tasksFirst) / tasksFirst) * 100) : 0,
      },
    };
  });

/**
 * User Analytics - Per-user performance metrics
 */
export const getUserAnalytics = protectedProcedure
  .input(
    z.object({
      userId: z.string().optional(),
      period: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
    })
  )
  .output(
    z.object({
      tasksCreated: z.number(),
      tasksCompleted: z.number(),
      projectsOwned: z.number(),
      organizationsMember: z.number(),
      activityScore: z.number(),
      completionRate: z.number(),
    })
  )
  .handler(async ({ input, context }) => {
    const userId = input.userId || context.user.id;
    const startDate = getDateRange(input.period);

    // Tasks created by user
    const userProjects = await appDb
      .select({ id: appSchema.projects.id })
      .from(appSchema.projects)
      .where(eq(appSchema.projects.ownerId, userId));

    const projectIds = userProjects.map(p => p.id);

    let tasksCreated = 0;
    let tasksCompleted = 0;

    if (projectIds.length > 0) {
      const [createdResult] = await appDb
        .select({ count: count() })
        .from(appSchema.tasks)
        .where(
          and(
            sql`${appSchema.tasks.projectId} IN ${projectIds}`,
            gte(appSchema.tasks.createdAt, startDate)
          )
        );
      tasksCreated = createdResult?.count ?? 0;

      const [completedResult] = await appDb
        .select({ count: count() })
        .from(appSchema.tasks)
        .where(
          and(
            sql`${appSchema.tasks.projectId} IN ${projectIds}`,
            eq(appSchema.tasks.status, "done"),
            gte(appSchema.tasks.completedAt, startDate)
          )
        );
      tasksCompleted = completedResult?.count ?? 0;
    }

    // Projects owned
    const [projectsResult] = await appDb
      .select({ count: count() })
      .from(appSchema.projects)
      .where(eq(appSchema.projects.ownerId, userId));
    const projectsOwned = projectsResult?.count ?? 0;

    // Organizations member of
    const [orgsResult] = await authDb
      .select({ count: count() })
      .from(authSchema.member)
      .where(eq(authSchema.member.userId, userId));
    const organizationsMember = orgsResult?.count ?? 0;

    // Activity score (0-100 based on various metrics)
    const activityScore = Math.min(
      100,
      Math.round(
        (tasksCompleted * 2) +
        (projectsOwned * 5) +
        (organizationsMember * 3)
      )
    );

    // Completion rate
    const completionRate = tasksCreated > 0
      ? Math.round((tasksCompleted / tasksCreated) * 100)
      : 0;

    return {
      tasksCreated,
      tasksCompleted,
      projectsOwned,
      organizationsMember,
      activityScore,
      completionRate,
    };
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
    const startDate = input.period === "all" ? new Date(0) : getDateRange(input.period);
    const now = new Date();

    // All tasks in project
    const [totalResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(
        and(
          eq(appSchema.tasks.projectId, input.projectId),
          gte(appSchema.tasks.createdAt, startDate)
        )
      );
    const totalTasks = totalResult?.count ?? 0;

    // Tasks by status
    const [completedResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(
        and(
          eq(appSchema.tasks.projectId, input.projectId),
          eq(appSchema.tasks.status, "done")
        )
      );

    const [inProgressResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(
        and(
          eq(appSchema.tasks.projectId, input.projectId),
          eq(appSchema.tasks.status, "in_progress")
        )
      );

    const [todoResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(
        and(
          eq(appSchema.tasks.projectId, input.projectId),
          eq(appSchema.tasks.status, "todo")
        )
      );

    const completedTasks = completedResult?.count ?? 0;
    const inProgressTasks = inProgressResult?.count ?? 0;
    const todoTasks = todoResult?.count ?? 0;

    // Completion rate
    const completionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    // Velocity (tasks completed per week)
    const periodDays = input.period === "all" ? 30 : parseInt(input.period);
    const velocity = periodDays > 0
      ? Math.round((completedTasks / periodDays) * 7 * 10) / 10
      : 0;

    // Average completion time
    const [avgTimeResult] = await appDb
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
          eq(appSchema.tasks.projectId, input.projectId),
          eq(appSchema.tasks.status, "done"),
          sql`${appSchema.tasks.completedAt} IS NOT NULL`
        )
      );

    const averageCompletionTime = Math.round(avgTimeResult?.avgHours ?? 0);

    // Overdue percentage
    const [overdueResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(
        and(
          eq(appSchema.tasks.projectId, input.projectId),
          sql`${appSchema.tasks.status} != 'done'`,
          sql`${appSchema.tasks.dueDate} < NOW()`
        )
      );

    const overdueCount = overdueResult?.count ?? 0;
    const overduePercentage = totalTasks > 0
      ? Math.round((overdueCount / totalTasks) * 100)
      : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      completionRate,
      velocity,
      averageCompletionTime,
      overduePercentage,
    };
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
    const conditions = [];

    if (input.projectId) {
      conditions.push(eq(appSchema.tasks.projectId, input.projectId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Tasks by status
    const [todoResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(whereClause ? and(whereClause, eq(appSchema.tasks.status, "todo")) : eq(appSchema.tasks.status, "todo"));

    const [inProgressResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(whereClause ? and(whereClause, eq(appSchema.tasks.status, "in_progress")) : eq(appSchema.tasks.status, "in_progress"));

    const [doneResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(whereClause ? and(whereClause, eq(appSchema.tasks.status, "done")) : eq(appSchema.tasks.status, "done"));

    // Tasks by priority
    const [lowResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(whereClause ? and(whereClause, eq(appSchema.tasks.priority, 0)) : eq(appSchema.tasks.priority, 0));

    const [mediumResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(whereClause ? and(whereClause, eq(appSchema.tasks.priority, 1)) : eq(appSchema.tasks.priority, 1));

    const [highResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(whereClause ? and(whereClause, eq(appSchema.tasks.priority, 2)) : eq(appSchema.tasks.priority, 2));

    return {
      todo: todoResult?.count ?? 0,
      inProgress: inProgressResult?.count ?? 0,
      done: doneResult?.count ?? 0,
      byPriority: {
        low: lowResult?.count ?? 0,
        medium: mediumResult?.count ?? 0,
        high: highResult?.count ?? 0,
      },
    };
  });

// Export router
export const analyticsRouter = {
  getDashboardOverview,
  getUserAnalytics,
  getProjectAnalytics,
  getTaskDistribution,
};
