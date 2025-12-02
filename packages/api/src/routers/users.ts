/**
 * Users router - oRPC procedures for user management
 */
import { z } from "zod";
import {
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "../middleware/auth.js";
import { paginationSchema, userSchema, idSchema } from "../schemas/index.js";
import { UserService } from "../services/users";

// Enhanced list schema with comprehensive filters for the frontend
const listUsersSchema = paginationSchema.extend({
  search: z.string().optional(),
  username: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fromDate: z.string().optional(), // ISO date string
  toDate: z.string().optional(), // ISO date string
  role: z.enum(["admin", "moderator", "editor", "user"]).optional(),
  status: z.enum(["active", "banned", "verified", "unverified"]).optional(),
  page: z.number().int().min(1).default(1),
});

// List all users with search and filters (protected - any logged in user can view)
export const list = protectedProcedure
  .input(listUsersSchema)
  .output(
    z.object({
      users: z.array(userSchema),
      pagination: z.object({
        currentPage: z.number(),
        totalPages: z.number(),
        totalItems: z.number(),
        itemsPerPage: z.number(),
        startIndex: z.number(),
        endIndex: z.number(),
      }),
    })
  )
  .handler(async ({ input }) => {
    return UserService.listUsers(input);
  });

// Get user metrics
export const metrics = protectedProcedure
  .output(
    z.object({
      verified: z.number(),
      unverified: z.number(),
      total: z.number(),
      banned: z.number(),
      active: z.number(),
    })
  )
  .handler(async () => {
    return UserService.getMetrics();
  });

// Get user by ID
export const getById = protectedProcedure
  .input(idSchema)
  .output(userSchema.nullable())
  .handler(async ({ input }) => {
    return UserService.getUserById(input.id);
  });

// Get current user profile
export const me = protectedProcedure
  .output(userSchema)
  .handler(async ({ context }) => {
    const user = await UserService.getUserById(context.user.id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  });

// Update user role (admin only)
export const updateRole = adminProcedure
  .input(
    z.object({
      userId: z.string(),
      role: z.enum(["admin", "moderator", "editor", "user"]),
    })
  )
  .output(userSchema)
  .handler(async ({ input }) => {
    return UserService.updateRole(input);
  });

// Create user (admin only)
export const createUser = adminProcedure
  .input(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      role: z.enum(["admin", "moderator", "editor", "user"]).default("user"),
      image: z.string().url().optional(),
    })
  )
  .output(userSchema)
  .handler(async ({ input }) => {
    return UserService.createUser(input);
  });

// Update user (admin only)
export const updateUser = adminProcedure
  .input(
    z.object({
      userId: z.string(),
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      image: z.string().url().optional(),
      role: z.enum(["admin", "moderator", "editor", "user"]).optional(),
    })
  )
  .output(userSchema)
  .handler(async ({ input }) => {
    return UserService.updateUser(input);
  });

// Ban user (admin only)
export const banUser = adminProcedure
  .input(
    z.object({
      userId: z.string(),
      reason: z.string(),
      expiresAt: z.string().optional(),
    })
  )
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input }) => {
    return UserService.banUser(input);
  });

// Unban user (admin only)
export const unbanUser = adminProcedure
  .input(idSchema)
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input }) => {
    return UserService.unbanUser(input.id);
  });

// Delete user (admin only)
export const deleteUser = adminProcedure
  .input(
    z.object({
      userId: z.string(),
      permanent: z.boolean().default(false),
    })
  )
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input }) => {
    return UserService.deleteUser(input);
  });

// Users router
export const usersRouter = {
  list,
  metrics,
  getById,
  me,
  create: createUser,
  update: updateUser,
  updateRole,
  ban: banUser,
  unban: unbanUser,
  delete: deleteUser,
};
