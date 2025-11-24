import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

/**
 * Access Control Statement
 * Define all resources and their available permissions
 */
export const statement = {
  ...defaultStatements,
  post: ["create", "read", "update", "delete"],
  comment: ["create", "read", "update", "delete"],
  analytics: ["view"],
  settings: ["view", "edit"],
  organization: ["create", "read", "update", "delete"],
  member: ["create", "read", "update", "delete"],
  invitation: ["create", "read", "cancel"],
  project: ["create", "read", "update", "delete"],
  task: ["create", "read", "update", "delete"],
} as const;

/**
 * Create Access Control instance for better-auth
 */
export const ac = createAccessControl(statement);

/**
 * Better-auth role definitions
 */
export const admin = ac.newRole({
  ...adminAc.statements,
  post: ["create", "read", "update", "delete"],
  comment: ["create", "read", "update", "delete"],
  analytics: ["view"],
  settings: ["view", "edit"],
  organization: ["create", "read", "update", "delete"],
  member: ["create", "read", "update", "delete"],
  invitation: ["create", "read", "cancel"],
  project: ["create", "read", "update", "delete"],
  task: ["create", "read", "update", "delete"],
});

export const moderator = ac.newRole({
  post: ["read", "update", "delete"],
  comment: ["read", "update", "delete"],
  analytics: ["view"],
  settings: ["view"],
  organization: ["read"],
  member: ["read"],
  invitation: ["read"],
  project: ["create", "read", "update", "delete"],
  task: ["create", "read", "update", "delete"],
});

export const editor = ac.newRole({
  post: ["create", "read", "update"],
  comment: ["create", "read", "update"],
  analytics: ["view"],
  settings: ["view"],
  organization: ["read"],
  member: ["read"],
  invitation: ["read"],
  project: ["create", "read", "update"],
  task: ["create", "read", "update"],
});

export const user = ac.newRole({
  post: ["create", "read"],
  comment: ["create", "read"],
  organization: ["create", "read"],
  member: ["read"],
  invitation: ["read"],
  project: ["read"],
  task: ["read"],
});

/**
 * Permission lookup for hasPermission helper
 */
const rolePermissions: Record<string, Record<string, string[]>> = {
  admin: {
    post: ["create", "read", "update", "delete"],
    comment: ["create", "read", "update", "delete"],
    analytics: ["view"],
    settings: ["view", "edit"],
    organization: ["create", "read", "update", "delete"],
    member: ["create", "read", "update", "delete"],
    invitation: ["create", "read", "cancel"],
    project: ["create", "read", "update", "delete"],
    task: ["create", "read", "update", "delete"],
  },
  moderator: {
    post: ["read", "update", "delete"],
    comment: ["read", "update", "delete"],
    analytics: ["view"],
    settings: ["view"],
    organization: ["read"],
    member: ["read"],
    invitation: ["read"],
    project: ["create", "read", "update", "delete"],
    task: ["create", "read", "update", "delete"],
  },
  editor: {
    post: ["create", "read", "update"],
    comment: ["create", "read", "update"],
    analytics: ["view"],
    settings: ["view"],
    organization: ["read"],
    member: ["read"],
    invitation: ["read"],
    project: ["create", "read", "update"],
    task: ["create", "read", "update"],
  },
  user: {
    post: ["create", "read"],
    comment: ["create", "read"],
    organization: ["create", "read"],
    member: ["read"],
    invitation: ["read"],
    project: ["read"],
    task: ["read"],
  },
};

/**
 * All roles for better-auth config
 */
export const roles = { admin, moderator, editor, user } as const;

/**
 * Role names type
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

/**
 * Check if a role has permission for a resource action
 */
export function hasPermission<
  R extends keyof typeof statement,
  A extends (typeof statement)[R][number],
>(role: RoleName, resource: R, action: A): boolean {
  const permissions = rolePermissions[role] as Record<string, readonly string[]>;
  const resourcePermissions = permissions[resource];
  if (!resourcePermissions) return false;
  return resourcePermissions.includes(action as string);
}
