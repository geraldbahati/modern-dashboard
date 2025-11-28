/**
 * Main oRPC router
 * Combines all sub-routers into a single router object
 */

import { usersRouter } from "./routers/users.js";
import { healthRouter } from "./routers/health.js";
import { projectsRouter } from "./routers/projects.js";
import { metricsRouter } from "./routers/metrics.js";
import { quickTasksRouter } from "./routers/quick-tasks.js";
import { insightsRouter } from "./routers/insights.js";
import { organizationsRouter } from "./routers/organizations.js";
import { tasksRouter } from "./routers/tasks.js";
import { analyticsRouter } from "./routers/analytics.js";
import { adminsRouter } from "./routers/admins.js";

// Combined router - this is the source of truth for all API routes
export const router = {
  users: usersRouter,
  health: healthRouter,
  projects: projectsRouter,
  metrics: metricsRouter,
  quickTasks: quickTasksRouter,
  insights: insightsRouter,
  organizations: organizationsRouter,
  tasks: tasksRouter,
  analytics: analyticsRouter,
  admins: adminsRouter,
};

// Export router type for client inference
export type AppRouter = typeof router;

// Re-export middleware for use in server setup
export {
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  moderatorProcedure,
} from "./middleware/auth.js";
export type {
  AuthContext,
  RequestContext,
  FullContext,
  AuthUser,
  AuthSession,
} from "./middleware/auth.js";

// Re-export security middlewares
export {
  readSecurityProcedure,
  writeSecurityProcedure,
  heavyWriteSecurityProcedure,
  standardSecurityProcedure,
  publicReadSecurityProcedure,
  publicStandardSecurityProcedure,
} from "./middleware/security.js";
