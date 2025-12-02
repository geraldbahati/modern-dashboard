import { eq, ilike, or, and, sql } from "drizzle-orm";
import { authDb } from "@workspace/db/auth-db";
import * as schema from "@workspace/db/auth-db/schema";
import type { z } from "zod";

// Define input type based on the schema we know exists
export interface ListUsersInput {
  limit: number;
  offset: number;
  search?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fromDate?: string;
  toDate?: string;
  role?: "admin" | "moderator" | "editor" | "user";
  status?: "active" | "banned" | "verified" | "unverified";
  page: number;
}

export const UserService = {
  /**
   * List users with comprehensive filtering and pagination
   */
  listUsers: async (input: ListUsersInput) => {
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
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: string) => {
    const [user] = await authDb
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, userId));

    if (!user) return null;

    return {
      ...user,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  /**
   * Create new user
   */
  createUser: async (input: {
    name: string;
    email: string;
    role: "admin" | "moderator" | "editor" | "user";
    image?: string;
  }) => {
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
  },

  /**
   * Update user details
   */
  updateUser: async (input: {
    userId: string;
    name?: string;
    email?: string;
    image?: string;
    role?: "admin" | "moderator" | "editor" | "user";
  }) => {
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
  },

  /**
   * Update user role
   */
  updateRole: async (input: {
    userId: string;
    role: "admin" | "moderator" | "editor" | "user";
  }) => {
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
  },

  /**
   * Ban user
   */
  banUser: async (input: {
    userId: string;
    reason: string;
    expiresAt?: string;
  }) => {
    await authDb
      .update(schema.user)
      .set({
        banned: true,
        banReason: input.reason,
        updatedAt: new Date(),
      })
      .where(eq(schema.user.id, input.userId));

    return { success: true };
  },

  /**
   * Unban user
   */
  unbanUser: async (userId: string) => {
    await authDb
      .update(schema.user)
      .set({
        banned: false,
        banReason: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.user.id, userId));

    return { success: true };
  },

  /**
   * Delete user
   */
  deleteUser: async (input: { userId: string; permanent: boolean }) => {
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
  },

  /**
   * Get user metrics
   */
  getMetrics: async () => {
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
  },
};
