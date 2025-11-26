import { z } from "zod";

/**
 * User tool schemas for AI interactions
 */
export const getUsersSchema = z.object({
  search: z.string().optional().describe("Search term to filter users by name or email"),
  role: z.string().optional().describe("Filter by user role (admin, moderator, editor, user)"),
  status: z.enum(["active", "inactive", "pending"]).optional().describe("Filter by user status"),
  limit: z.number().optional().default(10).describe("Maximum number of users to return"),
});

export const getUserByIdSchema = z.object({
  userId: z.string().describe("The unique identifier of the user"),
});

export type GetUsersInput = z.infer<typeof getUsersSchema>;
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;

/**
 * User data type returned by tools
 */
export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
  organizationId?: string;
}
