import { z } from "zod";

/**
 * ===========================
 * USER CRUD TOOLS
 * ===========================
 */

// VIEW/READ Operations
export const listUsersSchema = z.object({
  limit: z.number().min(1).max(100).default(20).describe("Number of users to return"),
  offset: z.number().min(0).default(0).describe("Number of users to skip"),
  search: z.string().optional().describe("Search by name or email"),
  role: z
    .enum(["admin", "moderator", "editor", "user"])
    .optional()
    .describe("Filter by user role"),
  status: z
    .enum(["active", "banned", "verified", "unverified"])
    .optional()
    .describe("Filter by user status"),
});

export const getUserByIdSchema = z.object({
  userId: z.string().describe("The user ID to retrieve"),
});

export const getUserStatsSchema = z.object({
  userId: z.string().optional().describe("Get stats for specific user, or current user if not provided"),
});

// CREATE Operations
export const createUserSchema = z.object({
  name: z.string().min(1).describe("User's full name"),
  email: z.string().email().describe("User's email address"),
  role: z
    .enum(["admin", "moderator", "editor", "user"])
    .default("user")
    .describe("User's role"),
  image: z.string().url().optional().describe("Profile image URL"),
});

// UPDATE Operations
export const updateUserSchema = z.object({
  userId: z.string().describe("The user ID to update"),
  name: z.string().min(1).optional().describe("Update user's name"),
  email: z.string().email().optional().describe("Update user's email"),
  image: z.string().url().optional().describe("Update profile image"),
  role: z.enum(["admin", "moderator", "editor", "user"]).optional().describe("Update user's role"),
});

export const updateUserRoleSchema = z.object({
  userId: z.string().describe("The user ID"),
  role: z.enum(["admin", "moderator", "editor", "user"]).describe("New role to assign"),
});

export const banUserSchema = z.object({
  userId: z.string().describe("The user ID to ban"),
  reason: z.string().describe("Reason for banning"),
  expiresAt: z.string().optional().describe("Ban expiration date (ISO format)"),
});

export const unbanUserSchema = z.object({
  userId: z.string().describe("The user ID to unban"),
});

// DELETE Operations
export const deleteUserSchema = z.object({
  userId: z.string().describe("The user ID to delete"),
  permanent: z
    .boolean()
    .default(false)
    .describe("If true, permanently delete. If false, soft delete (ban)"),
});

// Type exports
export type ListUsersInput = z.infer<typeof listUsersSchema>;
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;
export type GetUserStatsInput = z.infer<typeof getUserStatsSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type BanUserInput = z.infer<typeof banUserSchema>;
export type UnbanUserInput = z.infer<typeof unbanUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;

/**
 * User data types returned by tools
 */
export interface UserData {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  twoFactorEnabled: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStatsData {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  organizations: number;
  memberSince: Date;
}
