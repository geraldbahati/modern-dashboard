/**
 * Insights Router - Analytics data for dashboard insights widget
 */

import { readSecurityProcedure } from "../middleware/security";
import {
  insightsAnalyticsSchema,
  insightsPerformanceSchema,
  insightsTrendsSchema,
} from "../schemas";

/**
 * Get all insights analytics data (performance + trends)
 * In a real app, this would aggregate data from various sources
 */
export const getInsights = readSecurityProcedure
  .output(insightsAnalyticsSchema)
  .handler(async () => {
    // In production, calculate these from actual data:
    // - Task completion: completed tasks / total tasks
    // - User engagement: active sessions / total users
    // - Response time: average API response times
    // - User growth: new users this month / last month
    // - Retention: returning users / total users

    const performance = {
      taskCompletion: {
        name: "Task Completion",
        value: 85,
        label: "Task Completion",
        description: "Overall completion rate",
        color: "hsl(217, 91%, 60%)",
      },
      userEngagement: {
        name: "User Engagement",
        value: 84,
        label: "User Engagement",
        description: "Active user participation",
        color: "hsl(142, 71%, 45%)",
      },
      responseTime: {
        name: "Response Time",
        value: 78,
        label: "Response Time",
        description: "Average response efficiency",
        color: "hsl(220, 9%, 76%)",
      },
      overallScore: 85,
    };

    const trends = {
      userGrowth: {
        name: "User Growth",
        value: 92,
        label: "User Growth",
        description: "Month-over-month increase",
        color: "hsl(217, 91%, 60%)",
      },
      engagementRate: {
        name: "Engagement Rate",
        value: 88,
        label: "Engagement Rate",
        description: "Daily active users",
        color: "hsl(142, 71%, 45%)",
      },
      retention: {
        name: "Retention",
        value: 75,
        label: "Retention",
        description: "User retention rate",
        color: "hsl(220, 9%, 76%)",
      },
      overallScore: 92,
    };

    return {
      performance,
      trends,
    };
  });

/**
 * Get performance insights only
 */
export const getPerformance = readSecurityProcedure
  .output(insightsPerformanceSchema)
  .handler(async () => {
    return {
      taskCompletion: {
        name: "Task Completion",
        value: 85,
        label: "Task Completion",
        description: "Overall completion rate",
        color: "hsl(217, 91%, 60%)",
      },
      userEngagement: {
        name: "User Engagement",
        value: 84,
        label: "User Engagement",
        description: "Active user participation",
        color: "hsl(142, 71%, 45%)",
      },
      responseTime: {
        name: "Response Time",
        value: 78,
        label: "Response Time",
        description: "Average response efficiency",
        color: "hsl(220, 9%, 76%)",
      },
      overallScore: 85,
    };
  });

/**
 * Get trends insights only
 */
export const getTrends = readSecurityProcedure
  .output(insightsTrendsSchema)
  .handler(async () => {
    return {
      userGrowth: {
        name: "User Growth",
        value: 92,
        label: "User Growth",
        description: "Month-over-month increase",
        color: "hsl(217, 91%, 60%)",
      },
      engagementRate: {
        name: "Engagement Rate",
        value: 88,
        label: "Engagement Rate",
        description: "Daily active users",
        color: "hsl(142, 71%, 45%)",
      },
      retention: {
        name: "Retention",
        value: 75,
        label: "Retention",
        description: "User retention rate",
        color: "hsl(220, 9%, 76%)",
      },
      overallScore: 92,
    };
  });

// Export router
export const insightsRouter = {
  getInsights,
  getPerformance,
  getTrends,
};
