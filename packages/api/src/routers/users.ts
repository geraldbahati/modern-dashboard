/**
 * Users router - oRPC procedures for user management
 */

import { eq, ilike, or, and, sql } from "drizzle-orm";
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

// Enhanced list schema with filters
const listUsersSchema = paginationSchema.extend({
  search: z.string().optional(),
  role: z.enum(["admin", "moderator", "editor", "user"]).optional(),
  status: z.enum(["active", "banned", "verified", "unverified"]).optional(),
});

// List all users with search and filters (protected - any logged in user can view)
export const list = protectedProcedure
  .input(listUsersSchema)
  .output(
    z.object({
      users: z.array(userSchema),
      total: z.number(),
    })
  )
  .handler(async ({ input }) => {
    const { limit, offset, search, role, status } = input;

    // Build where conditions
    const conditions = [];

    // Search filter (name or email)
    if (search) {
      conditions.push(
        or(
          ilike(schema.user.name, `%${search}%`),
          ilike(schema.user.email, `%${search}%`)
        )
      );
    }

    // Role filter
    if (role) {
      conditions.push(eq(schema.user.role, role));
    }

    // Status filter
    if (status) {
      switch (status) {
        case "active":
          conditions.push(eq(schema.user.banned, false));
          break;
        case "banned":
          conditions.push(eq(schema.user.banned, true));
          break;
        case "verified":
          conditions.push(eq(schema.user.emailVerified, true));
          break;
        case "unverified":
          conditions.push(eq(schema.user.emailVerified, false));
          break;
      }
    }

    // Combine all conditions
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Execute query with pagination
    const users = await authDb
      .select()
      .from(schema.user)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${schema.user.createdAt} DESC`);

    // Get total count
    const totalResult = await authDb
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.user)
      .where(whereClause);

    const total = totalResult[0]?.count ?? 0;

    return {
      users: users.map((u) => ({
        ...u,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
      total,
    };
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
