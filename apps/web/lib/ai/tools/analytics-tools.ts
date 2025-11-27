import { tool } from "ai";
import {
  getDashboardOverviewSchema,
  getUserAnalyticsSchema,
  getProjectAnalyticsSchema,
  getTaskDistributionSchema,
} from "@workspace/ai/tools";
import type { Client } from "@workspace/api/client";

export const createAnalyticsTools = (client: Client) => ({
  // DASHBOARD OVERVIEW
  getDashboardOverview: tool({
    description:
      "Get comprehensive dashboard overview with key metrics: total users, projects, tasks, completion rates, active members, and growth trends. Perfect for executive summaries and high-level insights. Shows data for specified time period (today, 7d, 30d, 90d, 1y, or all time).",
    inputSchema: getDashboardOverviewSchema,
    execute: async (params) => {
      try {
        const overview = await client.analytics.getDashboardOverview(params);
        return {
          success: true,
          data: overview,
          summary: `Dashboard Overview (${params.period}): ${overview.totalProjects} projects, ${overview.completedTasks}/${overview.totalTasks} tasks completed (${overview.completionRate}%), ${overview.activeMembers} active members`,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch dashboard overview",
        };
      }
    },
  }),

  // DASHBOARD METRICS
  getDashboardMetrics: tool({
    description:
      "Get real-time dashboard metrics with trends: active users (last 7 days), average task completion time, task completion rate (last 30 days), and total active projects. Includes period-over-period comparisons and trend indicators (up/down/neutral).",
    inputSchema: z.object({}),
    execute: async () => {
      try {
        const metrics = await client.metrics.getDashboardMetrics();
        return {
          success: true,
          data: metrics,
          summary: `Metrics: ${metrics.activeUsers.value} active users (${metrics.activeUsers.change > 0 ? "+" : ""}${metrics.activeUsers.change}%), ${metrics.taskCompletion.value}% completion rate (${metrics.taskCompletion.change > 0 ? "+" : ""}${metrics.taskCompletion.change}%), ${metrics.avgResponseTime.value}hrs avg completion time`,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch dashboard metrics",
        };
      }
    },
  }),

  // USER ANALYTICS
  getUserAnalytics: tool({
    description:
      "Get detailed analytics for a specific user or current user: tasks created/completed, projects owned, organizations membership, activity score (0-100), and completion rate. Useful for performance reviews, productivity tracking, and user engagement analysis.",
    inputSchema: getUserAnalyticsSchema,
    execute: async (params) => {
      try {
        const analytics = await client.analytics.getUserAnalytics(params);
        return {
          success: true,
          data: analytics,
          summary: `User Analytics (${params.period}): ${analytics.tasksCompleted}/${analytics.tasksCreated} tasks completed (${analytics.completionRate}%), ${analytics.projectsOwned} projects, ${analytics.organizationsMember} orgs, Activity Score: ${analytics.activityScore}/100`,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch user analytics",
        };
      }
    },
  }),

  // PROJECT ANALYTICS
  getProjectAnalytics: tool({
    description:
      "Get comprehensive project performance analytics: task breakdown by status (todo/in_progress/done), completion rate, velocity (tasks/week), average completion time, and overdue percentage. Essential for project health monitoring and sprint planning.",
    inputSchema: getProjectAnalyticsSchema,
    execute: async (params) => {
      try {
        const analytics = await client.analytics.getProjectAnalytics(params);
        return {
          success: true,
          data: analytics,
          summary: `Project Analytics (${params.period}): ${analytics.completedTasks}/${analytics.totalTasks} tasks done (${analytics.completionRate}%), Velocity: ${analytics.velocity} tasks/week, Avg completion: ${analytics.averageCompletionTime}hrs, ${analytics.overduePercentage}% overdue`,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch project analytics",
        };
      }
    },
  }),

  // TASK DISTRIBUTION
  getTaskDistribution: tool({
    description:
      "Get task distribution overview showing breakdown by status (todo/in_progress/done) and priority (low/medium/high). Can filter by project or organization. Useful for workload balancing and identifying bottlenecks.",
    inputSchema: getTaskDistributionSchema,
    execute: async (params) => {
      try {
        const distribution = await client.analytics.getTaskDistribution(params);
        const total = distribution.todo + distribution.inProgress + distribution.done;
        return {
          success: true,
          data: distribution,
          summary: `Task Distribution: ${distribution.todo} todo, ${distribution.inProgress} in progress, ${distribution.done} done | Priority: ${distribution.byPriority.high} high, ${distribution.byPriority.medium} medium, ${distribution.byPriority.low} low | Total: ${total}`,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch task distribution",
        };
      }
    },
  }),

  // INSIGHTS (PERFORMANCE & TRENDS)
  getInsights: tool({
    description:
      "Get high-level insights including performance metrics (task completion, user engagement, response time) and growth trends (user growth, engagement rate, retention). Provides overall health scores for quick assessment.",
    inputSchema: z.object({}),
    execute: async () => {
      try {
        const insights = await client.insights.getInsights();
        return {
          success: true,
          data: insights,
          summary: `Insights: Overall Performance ${insights.performance.overallScore}/100 (Task Completion: ${insights.performance.taskCompletion.value}, Engagement: ${insights.performance.userEngagement.value}) | Trends ${insights.trends.overallScore}/100 (User Growth: ${insights.trends.userGrowth.value}, Retention: ${insights.trends.retention.value})`,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch insights",
        };
      }
    },
  }),
});

// Add z import at the top
import { z } from "zod";
