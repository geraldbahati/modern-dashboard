import { eq, ilike, or, and, sql } from "drizzle-orm";
import { authDb } from "@workspace/db/auth-db";
import * as schema from "@workspace/db/auth-db/schema";
import type { z } from "zod";
import type { listUsersSchema } from "../routers/ai/tools"; // We'll need to export the schema type or define a shared one

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
};
