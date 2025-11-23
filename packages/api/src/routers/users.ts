/**
 * Users router - oRPC procedures for user management
 */

import { eq } from "drizzle-orm";
import { z } from "zod";
import { authDb } from "@workspace/db/auth-db";
import * as schema from "@workspace/db/auth-db/schema";
import {
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "../middleware/auth";
import {
  paginationSchema,
  userSchema,
  idSchema,
} from "../schemas";

// List all users (admin only)
export const list = adminProcedure
  .input(paginationSchema)
  .output(z.array(userSchema))
  .handler(async ({ input }) => {
    const users = await authDb
      .select()
      .from(schema.user)
      .limit(input.limit)
      .offset(input.offset);

    return users.map((u) => ({
      ...u,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  });

// Get user by ID
export const getById = protectedProcedure
  .input(idSchema)
  .output(userSchema.nullable())
  .handler(async ({ input }) => {
    const [user] = await authDb
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, input.id));

    if (!user) return null;

    return {
      ...user,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  });

// Get current user profile
export const me = protectedProcedure
  .output(userSchema)
  .handler(async ({ context }) => {
    const [user] = await authDb
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, context.user.id));

    if (!user) {
      throw new Error("User not found");
    }

    return {
      ...user,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
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
    const [updated] = await authDb
      .update(schema.user)
      .set({ role: input.role })
      .where(eq(schema.user.id, input.userId))
      .returning();

    if (!updated) {
      throw new Error("User not found");
    }

    return {
      ...updated,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  });

// Delete user (admin only)
export const deleteUser = adminProcedure
  .input(idSchema)
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input }) => {
    await authDb.delete(schema.user).where(eq(schema.user.id, input.id));
    return { success: true };
  });

// Users router
export const usersRouter = {
  list,
  getById,
  me,
  updateRole,
  delete: deleteUser,
};
