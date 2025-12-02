import { tool } from "ai";
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
import type { FullContext } from "../../middleware/auth.js";
import {
  listHandler,
  getByIdHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
  banUserHandler,
  unbanUserHandler,
} from "../users.js";
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

export const createTools = (client: Client, context: FullContext) => ({
  // Spread analytics tools (high priority)
  ...createAnalyticsTools(client),

  // Spread organization tools
  ...createOrganizationTools(client),

  // Spread project tools
  ...createProjectTools(client),

  // Spread task tools
  ...createTaskTools(client),

  // Spread quick task tools
  ...createQuickTaskTools(client),

  // User tools below
  // LIST USERS
  listUsers: tool({
    description:
      "List and search users with optional filters. Use this to show users, search by name/email, or filter by role/status.",
    inputSchema: listUsersSchema,
    execute: async (params) => {
      try {
        // Direct procedure call
        // Direct procedure call
        const result = await listHandler({
          input: { ...params, page: (params as any).page || 1 },
        });
        return {
          success: true,
          data: result.users.map(serializeUser),
          count: result.pagination.totalItems,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch users",
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
        // Direct procedure call
        // Direct procedure call
        const user = await getByIdHandler({
          input: { id: params.userId },
        });
        return {
          success: true,
          data: serializeUser(user),
        };
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
    description:
      "Create a new user with the specified details. Requires name and email at minimum.",
    inputSchema: createUserSchema,
    execute: async (params) => {
      try {
        // Check permissions
        if (context.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        // Direct procedure call
        // Direct procedure call
        const user = await createUserHandler({ input: params });
        return {
          success: true,
          data: serializeUser(user),
          message: "User created successfully",
        };
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
    description:
      "Update an existing user's information. Only provided fields will be updated.",
    inputSchema: updateUserSchema,
    execute: async (params) => {
      try {
        // Check permissions
        if (context.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        // Direct procedure call
        // Direct procedure call
        const user = await updateUserHandler({ input: params });
        return {
          success: true,
          data: serializeUser(user),
          message: "User updated successfully",
        };
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
    description:
      "Ban a user from the platform. Requires userId and reason. Optionally set an expiration date.",
    inputSchema: banUserSchema,
    execute: async (params) => {
      try {
        // Check permissions
        if (context.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        // Direct procedure call
        // Direct procedure call
        await banUserHandler({ input: params });
        return {
          success: true,
          message: `User ${params.userId} has been banned`,
        };
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
    description: "Remove a ban from a user, restoring their access.",
    inputSchema: unbanUserSchema,
    execute: async (params) => {
      try {
        // Check permissions
        if (context.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        // Direct procedure call
        // Direct procedure call
        await unbanUserHandler({ input: { id: params.userId } });
        return {
          success: true,
          message: `User ${params.userId} has been unbanned`,
        };
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
    description:
      "Delete a user from the system. Can be a soft delete (ban) or permanent deletion.",
    inputSchema: deleteUserSchema,
    execute: async (params) => {
      try {
        // Check permissions
        if (context.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        // Direct procedure call
        // Direct procedure call
        await deleteUserHandler({ input: params });
        const deleteType = params.permanent
          ? "permanently deleted"
          : "soft deleted";
        return {
          success: true,
          message: `User ${params.userId} has been ${deleteType}`,
        };
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
