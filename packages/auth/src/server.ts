/**
 * Server-side auth exports for Hono and other non-Next.js frameworks
 * Import from "@workspace/auth/server"
 */

export { createAuth, getBaseAuthConfig, auth } from "./config";
export type { AuthConfigParams } from "./config";

// Re-export permissions for middleware
export {
  ac,
  admin,
  moderator,
  editor,
  user,
  roles,
  type RoleName,
} from "./permissions";
