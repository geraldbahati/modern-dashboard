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
} from "../middleware/auth.js";
import { paginationSchema, userSchema, idSchema } from "../schemas/index.js";

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
    const {
      limit,
      offset,
      search,
      username,
      email,
      firstName,
      lastName,
      fromDate,
      toDate,
      role,
      status,
      page,
    } = input;

    // Build where conditions
    const conditions = [];

    // General search filter (name or email)
    if (search) {
      conditions.push(
        or(
          ilike(schema.user.name, `%${search}%`),
          ilike(schema.user.email, `%${search}%`)
        )
      );
    }

    // Username filter (searches in name field)
    if (username) {
      conditions.push(ilike(schema.user.name, `%${username}%`));
    }

    // Email filter
    if (email) {
      conditions.push(ilike(schema.user.email, `%${email}%`));
    }

    // First name filter (searches beginning of name)
    if (firstName) {
      conditions.push(ilike(schema.user.name, `${firstName}%`));
    }

    // Last name filter (searches in name field)
    if (lastName) {
      conditions.push(ilike(schema.user.name, `% ${lastName}%`));
    }

    // Date range filter
    if (fromDate) {
      conditions.push(sql`${schema.user.createdAt} >= ${new Date(fromDate)}`);
    }
    if (toDate) {
      conditions.push(sql`${schema.user.createdAt} <= ${new Date(toDate)}`);
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

    // Calculate pagination
    const currentPage = page;
    const itemsPerPage = limit;
    const currentOffset = (currentPage - 1) * itemsPerPage;

    // Execute query with pagination
    const users = await authDb
      .select()
      .from(schema.user)
      .where(whereClause)
      .limit(itemsPerPage)
      .offset(currentOffset)
      .orderBy(sql`${schema.user.createdAt} DESC`);

    // Get total count
    const totalResult = await authDb
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.user)
      .where(whereClause);

    const totalItems = totalResult[0]?.count ?? 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return {
      users: users.map((u) => ({
        ...u,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        startIndex: currentOffset + 1,
        endIndex: Math.min(currentOffset + itemsPerPage, totalItems),
      },
    };
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
    // Get verified count
    const verifiedResult = await authDb
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.user)
      .where(eq(schema.user.emailVerified, true));

    // Get unverified count
    const unverifiedResult = await authDb
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.user)
      .where(eq(schema.user.emailVerified, false));

    // Get banned count
    const bannedResult = await authDb
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.user)
      .where(eq(schema.user.banned, true));

    // Get active count
    const activeResult = await authDb
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.user)
      .where(eq(schema.user.banned, false));

    // Get total count
    const totalResult = await authDb
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.user);

    return {
      verified: verifiedResult[0]?.count ?? 0,
      unverified: unverifiedResult[0]?.count ?? 0,
      total: totalResult[0]?.count ?? 0,
      banned: bannedResult[0]?.count ?? 0,
      active: activeResult[0]?.count ?? 0,
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
    const [newUser] = await authDb
      .insert(schema.user)
      .values({
        id: crypto.randomUUID(),
        name: input.name,
        email: input.email,
        role: input.role,
        image: input.image,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!newUser) {
      throw new Error("Failed to create user");
    }

    return {
      ...newUser,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
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
    const { userId, ...updates } = input;

    const [updated] = await authDb
      .update(schema.user)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.user.id, userId))
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
    await authDb
      .update(schema.user)
      .set({
        banned: true,
        banReason: input.reason,
        updatedAt: new Date(),
      })
      .where(eq(schema.user.id, input.userId));

    return { success: true };
  });

// Unban user (admin only)
export const unbanUser = adminProcedure
  .input(idSchema)
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input }) => {
    await authDb
      .update(schema.user)
      .set({
        banned: false,
        banReason: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.user.id, input.id));

    return { success: true };
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
    if (input.permanent) {
      // Permanent delete
      await authDb.delete(schema.user).where(eq(schema.user.id, input.userId));
    } else {
      // Soft delete (ban)
      await authDb
        .update(schema.user)
        .set({
          banned: true,
          banReason: "Soft deleted",
          updatedAt: new Date(),
        })
        .where(eq(schema.user.id, input.userId));
    }
    return { success: true };
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
