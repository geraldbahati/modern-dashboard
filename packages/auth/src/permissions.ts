import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

/**
 * Access Control Statement
 * Define all resources and their available permissions
 * Use `as const` for proper TypeScript type inference
 */
export const statement = {
  ...defaultStatements, // Include default admin permissions (user, session management)
  post: ["create", "read", "update", "delete"],
  comment: ["create", "read", "update", "delete"],
  analytics: ["view"],
  settings: ["view", "edit"],
  // Organization permissions
  organization: ["create", "read", "update", "delete"],
  member: ["create", "read", "update", "delete"],
  invitation: ["create", "read", "cancel"],
} as const;

/**
 * Create Access Control instance
 */
export const ac = createAccessControl(statement);

/**
 * Role Definitions
 * Each role has specific permissions for different resources
 */

/**
 * Admin Role - Full access to everything
 */
export const admin = ac.newRole({
  ...adminAc.statements, // Include all default admin permissions
  post: ["create", "read", "update", "delete"],
  comment: ["create", "read", "update", "delete"],
  analytics: ["view"],
  settings: ["view", "edit"],
  organization: ["create", "read", "update", "delete"],
  member: ["create", "read", "update", "delete"],
  invitation: ["create", "read", "cancel"],
});

/**
 * Moderator Role - Can manage content but not users
 */
export const moderator = ac.newRole({
  post: ["read", "update", "delete"],
  comment: ["read", "update", "delete"],
  analytics: ["view"],
  settings: ["view"],
  organization: ["read"],
  member: ["read"],
  invitation: ["read"],
});

/**
 * Editor Role - Can create and edit content
 */
export const editor = ac.newRole({
  post: ["create", "read", "update"],
  comment: ["create", "read", "update"],
  analytics: ["view"],
  settings: ["view"],
  organization: ["read"],
  member: ["read"],
  invitation: ["read"],
});

/**
 * User Role - Basic permissions
 */
export const user = ac.newRole({
  post: ["create", "read"],
  comment: ["create", "read"],
  organization: ["create", "read"],
  member: ["read"],
  invitation: ["read"],
});

/**
 * Export all roles for easy access
 */
export const roles = {
  admin,
  moderator,
  editor,
  user,
} as const;

/**
 * Role names type for TypeScript
 */
export type RoleName = keyof typeof roles;

/**
 * Role descriptions for UI
 */
export const roleDescriptions: Record<RoleName, string> = {
  admin: "Full access to all features and settings",
  moderator: "Can manage content and view analytics",
  editor: "Can create and edit content",
  user: "Basic user permissions",
};
