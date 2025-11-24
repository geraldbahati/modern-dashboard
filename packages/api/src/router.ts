/**
 * Main oRPC router
 * Combines all sub-routers into a single router object
 */

import { usersRouter } from "./routers/users";
import { healthRouter } from "./routers/health";
import { projectsRouter } from "./routers/projects";
import { metricsRouter } from "./routers/metrics";

// Combined router - this is the source of truth for all API routes
export const router = {
  users: usersRouter,
  health: healthRouter,
  projects: projectsRouter,
  metrics: metricsRouter,
};

// Export router type for client inference
export type AppRouter = typeof router;

// Re-export middleware for use in server setup
export {
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  moderatorProcedure,
} from "./middleware/auth";
export type {
  AuthContext,
  RequestContext,
  FullContext,
  AuthUser,
  AuthSession,
} from "./middleware/auth";

// Re-export security middlewares
export {
  readSecurityProcedure,
  writeSecurityProcedure,
  heavyWriteSecurityProcedure,
  standardSecurityProcedure,
  publicReadSecurityProcedure,
  publicStandardSecurityProcedure,
} from "./middleware/security";
