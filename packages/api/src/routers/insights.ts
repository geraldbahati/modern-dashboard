/**
 * Insights Router - Analytics data for dashboard insights widget
 */

import { readSecurityProcedure } from "../middleware/security.js";
import {
  insightsAnalyticsSchema,
  insightsPerformanceSchema,
  insightsTrendsSchema,
} from "../schemas/index.js";
import { AnalyticsService } from "../services/analytics";

/**
 * Get all insights analytics data (performance + trends)
 * In a real app, this would aggregate data from various sources
 */
export const getInsights = readSecurityProcedure
  .output(insightsAnalyticsSchema)
  .handler(async () => {
    return AnalyticsService.getInsights();
  });

/**
 * Get performance insights only
 */
export const getPerformance = readSecurityProcedure
  .output(insightsPerformanceSchema)
  .handler(async () => {
    const insights = await AnalyticsService.getInsights();
    return insights.performance;
  });

/**
 * Get trends insights only
 */
export const getTrends = readSecurityProcedure
  .output(insightsTrendsSchema)
  .handler(async () => {
    const insights = await AnalyticsService.getInsights();
    return insights.trends;
  });

// Export router
export const insightsRouter = {
  getInsights,
  getPerformance,
  getTrends,
};
