import { tool } from "ai";
import { UserService } from "../../services/users";
import {
  listUsersSchema,
  getUserByIdSchema,
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
  banUserSchema,
  unbanUserSchema,
} from "@workspace/ai/tools";
import type { Client } from "../../client.js";
import { createOrganizationTools } from "./tools/organization-tools.js";
import { createProjectTools } from "./tools/project-tools.js";
import { createTaskTools } from "./tools/task-tools.js";
import { createQuickTaskTools } from "./tools/quick-task-tools.js";
import { createAnalyticsTools } from "./tools/analytics-tools.js";

// Helper to serialize user objects (convert Dates to strings)
const serializeUser = (user: any) => {
  if (!user) return null;
  return {
    ...user,
    createdAt:
      user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : user.createdAt,
    updatedAt:
      user.updatedAt instanceof Date
        ? user.updatedAt.toISOString()
        : user.updatedAt,
  };
};

export const createTools = (client: Client, userId: string) => ({
  // Spread analytics tools (high priority)
  ...createAnalyticsTools(userId),

  // Spread organization tools
  ...createOrganizationTools(userId),

  // Spread project tools
  ...createProjectTools(userId),

  // Spread task tools
  ...createTaskTools(userId),

  // Spread quick task tools
  ...createQuickTaskTools(userId),

  // User tools below
  // LIST USERS
  listUsers: tool({
    description:
      "List and search users with optional filters. Use this to show users, search by name/email, or filter by role/status.",
    inputSchema: listUsersSchema,
    execute: async (params) => {
      try {
        const result = await UserService.listUsers(params);

        return {
          success: true,
          data: result.users.map(serializeUser),
          count: result.pagination.totalItems,
        };
      } catch (error) {
        console.error(
          "Tool Execution Error (listUsers):",
          JSON.stringify(error, null, 2)
        );
        if (error instanceof Error) {
          console.error("Stack:", error.stack);
        }
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch users",
          stack: error instanceof Error ? error.stack : undefined,
          details: JSON.stringify(error),
        };
      }
    },
  }),

  // GET USER BY ID
  getUserById: tool({
    description: "Get detailed information about a specific user by their ID.",
    inputSchema: getUserByIdSchema,
    execute: async (params) => {
      try {
        const user = await UserService.getUserById(params.userId);
        if (!user) {
          return { success: false, error: "User not found" };
        }
        return { success: true, data: serializeUser(user) };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch user",
        };
      }
    },
  }),

  // CREATE USER
  createUser: tool({
    description: "Create a new user with specified details.",
    inputSchema: createUserSchema,
    execute: async (params) => {
      try {
        const user = await UserService.createUser(params);
        return { success: true, data: serializeUser(user) };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to create user",
        };
      }
    },
  }),

  // UPDATE USER
  updateUser: tool({
    description: "Update an existing user's details.",
    inputSchema: updateUserSchema,
    execute: async (params) => {
      try {
        const user = await UserService.updateUser(params);
        return { success: true, data: serializeUser(user) };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to update user",
        };
      }
    },
  }),

  // BAN USER
  banUser: tool({
    description: "Ban a user from the platform.",
    inputSchema: banUserSchema,
    execute: async (params) => {
      try {
        const result = await UserService.banUser(params);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to ban user",
        };
      }
    },
  }),

  // UNBAN USER
  unbanUser: tool({
    description: "Unban a previously banned user.",
    inputSchema: unbanUserSchema,
    execute: async (params) => {
      try {
        const result = await UserService.unbanUser(params.userId);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to unban user",
        };
      }
    },
  }),

  // DELETE USER
  deleteUser: tool({
    description: "Permanently or soft delete a user.",
    inputSchema: deleteUserSchema,
    execute: async (params) => {
      try {
        const result = await UserService.deleteUser(params);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to delete user",
        };
      }
    },
  }),
});
