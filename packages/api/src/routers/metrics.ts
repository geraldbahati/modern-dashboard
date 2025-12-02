/**
 * Metrics router - oRPC procedures for dashboard metrics
 */

import { publicReadSecurityProcedure } from "../middleware/security.js";
import { dashboardMetricsSchema } from "../schemas/index.js";
import { AnalyticsService } from "../services/analytics";

/**
 * Get dashboard metrics
 * Returns all key metrics for the dashboard in a single call
 *
 * Uses publicReadSecurityProcedure for rate limiting (180 req/min)
 */
export const getDashboardMetrics = publicReadSecurityProcedure
  .output(dashboardMetricsSchema)
  .handler(async () => {
    return AnalyticsService.getDashboardMetrics();
  });

// Metrics router
export const metricsRouter = {
  getDashboardMetrics,
};
