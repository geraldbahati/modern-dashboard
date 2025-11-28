/**
 * Admins Router - Management of admin users
 */

import { eq, ilike, or, and, sql, inArray, not } from "drizzle-orm";
import { z } from "zod";
import { authDb } from "@workspace/db/auth-db";
import * as schema from "@workspace/db/auth-db/schema";
import { adminProcedure } from "../middleware/auth.js";
import { paginationSchema, userSchema } from "../schemas/index.js";

// Enhanced list schema for admins
const listAdminsSchema = paginationSchema.extend({
  search: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  page: z.number().int().min(1).default(1),
});

// List all admin users (admin only)
export const list = adminProcedure
  .input(listAdminsSchema)
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
    const { limit, offset, search, email, name, page } = input;

    // Build where conditions
    // Filter for admin roles
    const conditions = [
      inArray(schema.user.role, ["admin", "moderator", "editor"]),
    ];

    // General search filter
    if (search) {
      conditions.push(
        or(
          ilike(schema.user.name, `%${search}%`),
          ilike(schema.user.email, `%${search}%`)
        )!
      );
    }

    // Email filter
    if (email) {
      conditions.push(ilike(schema.user.email, `%${email}%`));
    }

    // Name filter
    if (name) {
      conditions.push(ilike(schema.user.name, `%${name}%`));
    }

    // Combine all conditions
    const whereClause = and(...conditions);

    // Calculate pagination
    const currentPage = page;
    const itemsPerPage = limit;
    const currentOffset = (currentPage - 1) * itemsPerPage;

    // Execute query with pagination
    const users = await authDb
      .select()
      .from(schema.user)
      .where(whereClause!)
      .limit(itemsPerPage)
      .offset(currentOffset)
      .orderBy(sql`${schema.user.createdAt} DESC`);

    // Get total count
    const totalResult = await authDb
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.user)
      .where(whereClause!);

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

// Get admin metrics
export const metrics = adminProcedure
  .output(
    z.object({
      total: z.number(),
      admins: z.number(),
      recentlyAdded: z.number(),
      recentlyUpdated: z.number(),
    })
  )
  .handler(async () => {
    // Base condition for admins
    const adminCondition = inArray(schema.user.role, [
      "admin",
      "moderator",
      "editor",
    ]);

    // Get total admins
    const totalResult = await authDb
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.user)
      .where(adminCondition);

    // Get admins with role 'admin' specifically (if needed, or just reuse total)
    // Based on UI "Admins with Roles", maybe it means something else, but let's just count specific roles
    const adminsWithRolesResult = await authDb
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.user)
      .where(and(adminCondition, not(eq(schema.user.role, "user")))); // Redundant but explicit

    // Recently added (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentlyAddedResult = await authDb
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.user)
      .where(
        and(adminCondition, sql`${schema.user.createdAt} >= ${thirtyDaysAgo}`)
      );

    // Recently updated (last 30 days)
    const recentlyUpdatedResult = await authDb
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.user)
      .where(
        and(adminCondition, sql`${schema.user.updatedAt} >= ${thirtyDaysAgo}`)
      );

    return {
      total: totalResult[0]?.count ?? 0,
      admins: adminsWithRolesResult[0]?.count ?? 0,
      recentlyAdded: recentlyAddedResult[0]?.count ?? 0,
      recentlyUpdated: recentlyUpdatedResult[0]?.count ?? 0,
    };
  });

// Admins router
export const adminsRouter = {
  list,
  metrics,
};
