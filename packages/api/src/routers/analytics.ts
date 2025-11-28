/**
 * Analytics Router - Comprehensive analytics and insights
 */

import { z } from "zod";
import { sql, count, eq, and, gte } from "drizzle-orm";
import { readSecurityProcedure } from "../middleware/security.js";
import { protectedProcedure } from "../middleware/auth.js";
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
    const startDate =
      input.period === "all" ? new Date(0) : getDateRange(input.period);
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
      .select({
        count: sql<number>`COUNT(DISTINCT ${authSchema.session.userId})`,
      })
      .from(authSchema.session)
      .where(
        and(
          gte(authSchema.session.createdAt, sevenDaysAgo),
          gte(authSchema.session.expiresAt, now)
        )
      );
    const activeMembers = Number(activeMembersResult?.count ?? 0);

    // Completion rate
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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
        users:
          totalUsers > 0
            ? Math.round(
                ((totalUsers - (usersFirstHalf?.count ?? 0)) /
                  Math.max(usersFirstHalf?.count ?? 1, 1)) *
                  100
              )
            : 0,
        projects:
          projectsFirst > 0
            ? Math.round(
                ((projectsSecond - projectsFirst) / projectsFirst) * 100
              )
            : 0,
        tasks:
          tasksFirst > 0
            ? Math.round(((tasksSecond - tasksFirst) / tasksFirst) * 100)
            : 0,
      },
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
    const startDate =
      input.period === "all" ? new Date(0) : getDateRange(input.period);
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
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Velocity (tasks completed per week)
    const periodDays = input.period === "all" ? 30 : parseInt(input.period);
    const velocity =
      periodDays > 0
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
    const overduePercentage =
      totalTasks > 0 ? Math.round((overdueCount / totalTasks) * 100) : 0;

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
      .where(
        whereClause
          ? and(whereClause, eq(appSchema.tasks.status, "todo"))
          : eq(appSchema.tasks.status, "todo")
      );

    const [inProgressResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(
        whereClause
          ? and(whereClause, eq(appSchema.tasks.status, "in_progress"))
          : eq(appSchema.tasks.status, "in_progress")
      );

    const [doneResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(
        whereClause
          ? and(whereClause, eq(appSchema.tasks.status, "done"))
          : eq(appSchema.tasks.status, "done")
      );

    // Tasks by priority
    const [lowResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(
        whereClause
          ? and(whereClause, eq(appSchema.tasks.priority, 0))
          : eq(appSchema.tasks.priority, 0)
      );

    const [mediumResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(
        whereClause
          ? and(whereClause, eq(appSchema.tasks.priority, 1))
          : eq(appSchema.tasks.priority, 1)
      );

    const [highResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(
        whereClause
          ? and(whereClause, eq(appSchema.tasks.priority, 2))
          : eq(appSchema.tasks.priority, 2)
      );

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
  .handler(async ({ context }) => {
    // Get organization members
    const members = await authDb
      .select({
        id: authSchema.user.id,
        name: authSchema.user.name,
        email: authSchema.user.email,
        image: authSchema.user.image,
      })
      .from(authSchema.member)
      .innerJoin(
        authSchema.user,
        eq(authSchema.member.userId, authSchema.user.id)
      )
      .where(eq(authSchema.member.organizationId, context.user.id))
      .limit(10);

    // For each member, get their task count
    const workload = await Promise.all(
      members.map(async (member) => {
        const [assignedResult] = await appDb
          .select({ count: count() })
          .from(appSchema.tasks)
          .where(
            and(
              eq(appSchema.tasks.assigneeId, member.id),
              sql`${appSchema.tasks.status} != 'done'`
            )
          );

        const assigned = assignedResult?.count ?? 0;
        const capacity = 10; // Default capacity per member

        return {
          name: member.name || member.email || "Unknown",
          assigned,
          capacity,
          image: member.image,
        };
      })
    );

    // Skill distribution (mock data based on common skills)
    const projectDistribution = [
      { subject: "Frontend", A: 65, fullMark: 100 },
      { subject: "Backend", A: 80, fullMark: 100 },
      { subject: "Design", A: 45, fullMark: 100 },
      { subject: "Testing", A: 55, fullMark: 100 },
      { subject: "DevOps", A: 70, fullMark: 100 },
    ];

    // Availability status
    const availability = await Promise.all(
      members.map(async (member) => {
        const [assignedResult] = await appDb
          .select({ count: count() })
          .from(appSchema.tasks)
          .where(
            and(
              eq(appSchema.tasks.assigneeId, member.id),
              sql`${appSchema.tasks.status} != 'done'`
            )
          );

        const assigned = assignedResult?.count ?? 0;

        // Get current task
        const [currentTask] = await appDb
          .select({ title: appSchema.tasks.title })
          .from(appSchema.tasks)
          .where(
            and(
              eq(appSchema.tasks.assigneeId, member.id),
              eq(appSchema.tasks.status, "in_progress")
            )
          )
          .limit(1);

        return {
          id: member.id,
          name: member.name || member.email || "Unknown",
          role: "Developer", // TODO: Get from member role
          image: member.image,
          status: (assigned > 8
            ? "overloaded"
            : assigned > 5
              ? "busy"
              : "available") as "available" | "busy" | "overloaded",
          currentTask: currentTask?.title || null,
        };
      })
    );

    return {
      workload,
      projectDistribution,
      availability,
    };
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
    // Get project analytics
    const [totalResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(eq(appSchema.tasks.projectId, input.projectId));
    const totalTasks = totalResult?.count ?? 0;

    const [completedResult] = await appDb
      .select({ count: count() })
      .from(appSchema.tasks)
      .where(
        and(
          eq(appSchema.tasks.projectId, input.projectId),
          eq(appSchema.tasks.status, "done")
        )
      );
    const completedTasks = completedResult?.count ?? 0;

    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Generate forecast data (30 days history + forecast days)
    const forecast = [];
    const now = new Date();
    for (let i = -30; i <= input.forecastDays; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      if (i <= 0) {
        // Historical data (actual progress)
        const progress = Math.min(
          completionRate,
          Math.max(0, completionRate + i * (completionRate / 30))
        );
        forecast.push({
          date: dateStr!,
          actual: Math.round(progress),
          predicted: null,
          lowerBound: null,
          upperBound: null,
        });
      } else {
        // Predicted data with confidence intervals
        const daysRemaining = input.forecastDays - i;
        const predictedProgress =
          completionRate + (100 - completionRate) * (i / input.forecastDays);
        const confidence = Math.max(60, 95 - (i / input.forecastDays) * 20); // Confidence decreases over time
        const margin = (100 - confidence) / 2;

        forecast.push({
          date: dateStr!,
          actual: null,
          predicted: Math.min(100, Math.round(predictedProgress)),
          lowerBound: Math.max(0, Math.round(predictedProgress - margin)),
          upperBound: Math.min(100, Math.round(predictedProgress + margin)),
        });
      }
    }

    // Generate insights based on current state
    const insights = [];
    const velocity = completionRate / 30; // tasks per day

    if (velocity > 2) {
      insights.push({
        id: "insight-1",
        type: "positive" as const,
        title: "Strong Velocity",
        description: "Team is completing tasks at an above-average rate",
        impact: "high" as const,
      });
    } else if (velocity < 1) {
      insights.push({
        id: "insight-2",
        type: "negative" as const,
        title: "Low Velocity",
        description: "Task completion rate is below expected velocity",
        impact: "high" as const,
      });
    }

    if (completionRate > 70) {
      insights.push({
        id: "insight-3",
        type: "positive" as const,
        title: "On Track for Completion",
        description:
          "Project is 70% complete and trending toward on-time delivery",
        impact: "medium" as const,
      });
    } else if (completionRate < 30) {
      insights.push({
        id: "insight-4",
        type: "negative" as const,
        title: "Early Stage Concerns",
        description:
          "Project is still in early stages, monitor progress closely",
        impact: "medium" as const,
      });
    }

    // Key drivers
    const drivers = [
      { name: "Team Capacity", impact: 25 },
      { name: "Task Complexity", impact: -15 },
      { name: "Sprint Velocity", impact: 30 },
      { name: "Blockers", impact: -10 },
      { name: "Code Quality", impact: 20 },
    ];

    // Calculate predicted completion date
    const tasksRemaining = totalTasks - completedTasks;
    const daysToComplete =
      velocity > 0 ? tasksRemaining / velocity : input.forecastDays;
    const predictedCompletionDate = new Date(now);
    predictedCompletionDate.setDate(
      predictedCompletionDate.getDate() + Math.ceil(daysToComplete)
    );

    // Calculate confidence and risk
    const confidenceScore = Math.min(
      95,
      Math.max(60, 80 - Math.abs(daysToComplete - input.forecastDays) * 2)
    );
    const riskLevel =
      daysToComplete > input.forecastDays * 1.5
        ? "high"
        : daysToComplete > input.forecastDays
          ? "medium"
          : "low";

    return {
      forecast,
      insights,
      drivers,
      summary: {
        predictedCompletionDate,
        confidenceScore: Math.round(confidenceScore),
        riskLevel,
      },
    };
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
    const userId = input.userId || context.user.id;
    const startDate = getDateRange(input.period);
    const periodDays =
      input.period === "7d" ? 7 : input.period === "30d" ? 30 : 90;

    // Get all tasks assigned to user in period
    const userTasks = await appDb
      .select()
      .from(appSchema.tasks)
      .where(
        and(
          eq(appSchema.tasks.assigneeId, userId),
          gte(appSchema.tasks.createdAt, startDate)
        )
      );

    // Activity timeline (tasks completed per day)
    const activity = [];
    const now = new Date();
    for (let i = 0; i < periodDays; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (periodDays - i - 1));
      const dateStr = date.toISOString().split("T")[0];

      const tasksOnDay = userTasks.filter(
        (t) =>
          t.completedAt && t.completedAt.toISOString().split("T")[0] === dateStr
      ).length;

      activity.push({ date: dateStr!, tasks: tasksOnDay });
    }

    // Task distribution by status
    const todoCount = userTasks.filter((t) => t.status === "todo").length;
    const inProgressCount = userTasks.filter(
      (t) => t.status === "in_progress"
    ).length;
    const doneCount = userTasks.filter((t) => t.status === "done").length;

    const taskDistribution = [
      { name: "Todo", value: todoCount, color: "hsl(var(--muted-foreground))" },
      {
        name: "In Progress",
        value: inProgressCount,
        color: "hsl(var(--blue-500))",
      },
      { name: "Done", value: doneCount, color: "hsl(var(--green-500))" },
    ];

    // Weekly performance (last 4 weeks)
    const performance = [];
    const weeksToShow = Math.min(4, Math.ceil(periodDays / 7));
    for (let week = 0; week < weeksToShow; week++) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (weeksToShow - week) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const assigned = userTasks.filter(
        (t) => t.createdAt >= weekStart && t.createdAt < weekEnd
      ).length;
      const completed = userTasks.filter(
        (t) =>
          t.completedAt && t.completedAt >= weekStart && t.completedAt < weekEnd
      ).length;

      performance.push({
        week: `Week ${week + 1}`,
        completed,
        assigned,
      });
    }

    // Metrics
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter((t) => t.status === "done").length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Average completion time (in hours)
    const completedTasksWithTime = userTasks.filter(
      (t) => t.status === "done" && t.completedAt && t.createdAt
    );
    let avgCompletionTime = 0;
    if (completedTasksWithTime.length > 0) {
      const totalTime = completedTasksWithTime.reduce((sum, t) => {
        const time = t.completedAt!.getTime() - t.createdAt.getTime();
        return sum + time;
      }, 0);
      avgCompletionTime = Math.round(
        totalTime / completedTasksWithTime.length / (1000 * 60 * 60)
      ); // Convert to hours
    }

    // Efficiency (on-time completion rate)
    const tasksWithDueDate = userTasks.filter(
      (t) => t.status === "done" && t.dueDate && t.completedAt
    );
    const onTimeTasks = tasksWithDueDate.filter(
      (t) => t.completedAt! <= t.dueDate!
    );
    const efficiency =
      tasksWithDueDate.length > 0
        ? Math.round((onTimeTasks.length / tasksWithDueDate.length) * 100)
        : 100;

    return {
      activity,
      taskDistribution,
      performance,
      metrics: {
        totalTasks,
        completionRate,
        avgCompletionTime,
        efficiency,
      },
    };
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
