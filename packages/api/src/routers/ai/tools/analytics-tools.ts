import { tool } from "ai";
import {
  getDashboardOverviewSchema,
  getProjectAnalyticsSchema,
  getTaskDistributionSchema,
  getResourceAllocationSchema,
  getPredictiveAnalyticsSchema,
  getUserAnalyticsDetailedSchema,
} from "@workspace/ai/tools";
import { z } from "zod";
import { AnalyticsService } from "../../../services/analytics";

export const createAnalyticsTools = (userId: string) => {
  // Helper to recursively serialize dates for AI SDK
  const serializeDates = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof Date) return obj.toISOString();
    if (Array.isArray(obj)) return obj.map(serializeDates);
    if (typeof obj === "object") {
      const newObj: any = {};
      for (const key in obj) {
        newObj[key] = serializeDates(obj[key]);
      }
      return newObj;
    }
    return obj;
  };

  return {
    // DASHBOARD OVERVIEW
    getDashboardOverview: tool({
      description:
        "Get comprehensive dashboard overview with key metrics: total users, projects, tasks, completion rates, active members, and growth trends. Perfect for executive summaries and high-level insights. Shows data for specified time period (today, 7d, 30d, 90d, 1y, or all time).",
      inputSchema: getDashboardOverviewSchema,
      execute: async (params) => {
        try {
          const overview = await AnalyticsService.getDashboardOverview(params);
          return {
            success: true,
            data: serializeDates(overview),
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
          const metrics = await AnalyticsService.getDashboardMetrics();
          return {
            success: true,
            data: serializeDates(metrics),
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

    // PROJECT ANALYTICS
    getProjectAnalytics: tool({
      description:
        "Get comprehensive project performance analytics: task breakdown by status (todo/in_progress/done), completion rate, velocity (tasks/week), average completion time, and overdue percentage. Essential for project health monitoring and sprint planning.",
      inputSchema: getProjectAnalyticsSchema,
      execute: async (params) => {
        try {
          const analytics = await AnalyticsService.getProjectAnalytics(params);
          return {
            success: true,
            data: serializeDates(analytics),
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
          const distribution =
            await AnalyticsService.getTaskDistribution(params);
          const total =
            distribution.todo + distribution.inProgress + distribution.done;
          return {
            success: true,
            data: serializeDates(distribution),
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
          const insights = await AnalyticsService.getInsights();
          return {
            success: true,
            data: serializeDates(insights),
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

    // RESOURCE ALLOCATION
    getResourceAllocation: tool({
      description:
        "Get team resource allocation data showing workload distribution, skill/project distribution, and member availability status. Shows capacity vs assigned tasks, identifies overloaded members, and displays current task assignments. Perfect for team management, workload balancing, and resource planning. Use prompts like 'show team workload', 'check resource allocation', 'who is available', or 'show team capacity'.",
      inputSchema: getResourceAllocationSchema,
      execute: async (params) => {
        try {
          const allocation = await AnalyticsService.getResourceAllocation({
            userId,
            ...params,
          });
          const overloaded = allocation.availability.filter(
            (m: { status: string }) => m.status === "overloaded"
          ).length;
          const available = allocation.availability.filter(
            (m: { status: string }) => m.status === "available"
          ).length;
          return {
            success: true,
            data: serializeDates(allocation),
            summary: `Resource Allocation: ${allocation.workload.length} team members | ${available} available, ${overloaded} overloaded | Skills: ${allocation.projectDistribution.map((d: { subject: string }) => d.subject).join(", ")}`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch resource allocation",
          };
        }
      },
    }),

    // PREDICTIVE ANALYTICS
    getPredictiveAnalytics: tool({
      description:
        "Get AI-powered predictive analytics for project completion forecasting. Includes completion date prediction with confidence intervals, risk assessment, AI-generated insights, and key impact drivers. Uses machine learning to analyze historical velocity, team capacity, and current progress. Perfect for sprint planning, deadline estimation, and risk management. Use prompts like 'predict project completion', 'forecast project timeline', 'show project predictions', or 'what's the project outlook'.",
      inputSchema: getPredictiveAnalyticsSchema,
      execute: async (params) => {
        try {
          const analytics =
            await AnalyticsService.getPredictiveAnalytics(params);
          const completionDate = new Date(
            analytics.summary.predictedCompletionDate
          ).toLocaleDateString();
          const positiveInsights = analytics.insights.filter(
            (i: { type: string }) => i.type === "positive"
          ).length;
          const negativeInsights = analytics.insights.filter(
            (i: { type: string }) => i.type === "negative"
          ).length;
          return {
            success: true,
            data: serializeDates(analytics),
            summary: `Predictive Analytics (${params.forecastDays}d): Estimated completion ${completionDate} | Confidence: ${analytics.summary.confidenceScore}% | Risk: ${analytics.summary.riskLevel} | Insights: ${positiveInsights} positive, ${negativeInsights} negative`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch predictive analytics",
          };
        }
      },
    }),

    // DETAILED USER ANALYTICS (with full chart data)
    getUserAnalyticsDetailed: tool({
      description:
        "Get comprehensive user analytics with full visualization data including activity timeline (last 30 days), task distribution by status (pie chart), and weekly performance comparison (completed vs assigned). Provides rich metrics: total tasks, completion rate, average completion time, and efficiency score. Perfect for detailed performance reviews, productivity analysis, and user engagement tracking. Use prompts like 'show detailed user analytics', 'analyze my performance', 'show my activity charts', or 'detailed user statistics'.",
      inputSchema: getUserAnalyticsDetailedSchema,
      execute: async (params) => {
        try {
          const analytics = await AnalyticsService.getUserAnalyticsDetailed({
            userId,
            ...params,
          });
          const recentActivity = analytics.activity
            .slice(-7)
            .reduce((sum: number, d: { tasks: number }) => sum + d.tasks, 0);
          return {
            success: true,
            data: serializeDates(analytics),
            summary: `Detailed User Analytics (${params.period}): ${analytics.metrics.totalTasks} total tasks | ${analytics.metrics.completionRate}% completion rate | ${analytics.metrics.avgCompletionTime}h avg time | ${analytics.metrics.efficiency}% efficiency | ${recentActivity} tasks completed last 7 days`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch detailed user analytics",
          };
        }
      },
    }),
  };
};
