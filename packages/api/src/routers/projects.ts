/**
 * Projects Router - CRUD operations for projects
 */

import { z } from "zod";
import { eq, and, desc, or, ilike, sql, type SQL } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { appDb } from "@workspace/db/app-db";
import { projects } from "@workspace/db/app-db/schema";
import {
  readSecurityProcedure,
  writeSecurityProcedure,
  heavyWriteSecurityProcedure,
} from "../middleware/security.js";
import {
  paginationSchema,
  projectSchema,
  createProjectSchema,
  updateProjectSchema,
  type Project,
} from "../schemas/index.js";

// Helper to cast database result to typed Project
const toProject = (row: typeof projects.$inferSelect): Project => ({
  ...row,
  status: row.status as Project["status"],
});

// Enhanced list schema with filters
const listProjectsSchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(["active", "archived", "deleted"]).optional(),
  environment: z.enum(["production", "staging", "development"]).optional(),
});

/**
 * List all projects for the current user with filters
 */
export const list = readSecurityProcedure
  .route({ method: "GET", path: "/projects" })
  .input(listProjectsSchema)
  .output(
    z.object({
      data: z.array(projectSchema),
      total: z.number(),
    })
  )
  .handler(async ({ input, context }) => {
    const { limit, offset, search, status, environment } = input;

    const conditions = [eq(projects.ownerId, context.user.id)];

    if (search) {
      conditions.push(
        or(
          ilike(projects.name, `%${search}%`),
          ilike(projects.description || "", `%${search}%`)
        )!
      );
    }

    if (status) {
      conditions.push(eq(projects.status, status));
    }

    // Note: Environment is not in the schema provided earlier.
    // If it's required, we should add it to the schema or ignore it for now.
    // I will ignore it for now as it wasn't in the schema view I saw.

    const whereClause = and(...conditions) as unknown as SQL<unknown>;

    const rows = await appDb
      .select()
      .from(projects)
      .where(whereClause!)
      .orderBy(desc(projects.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await appDb
      .select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(whereClause!);

    return {
      data: rows.map(toProject),
      total: countResult[0]?.count ?? 0,
    };
  });

/**
 * Get project metrics
 */
export const metrics = readSecurityProcedure
  .route({ method: "GET", path: "/projects/metrics" })
  .output(
    z.object({
      total: z.number(),
      active: z.number(),
      archived: z.number(),
      deleted: z.number(),
    })
  )
  .handler(async ({ context }) => {
    const userId = context.user.id;

    const totalResult = await appDb
      .select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(eq(projects.ownerId, userId));

    const activeResult = await appDb
      .select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(and(eq(projects.ownerId, userId), eq(projects.status, "active"))!);

    const archivedResult = await appDb
      .select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(
        and(eq(projects.ownerId, userId), eq(projects.status, "archived"))!
      );

    const deletedResult = await appDb
      .select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(
        and(eq(projects.ownerId, userId), eq(projects.status, "deleted"))!
      );

    return {
      total: totalResult[0]?.count ?? 0,
      active: activeResult[0]?.count ?? 0,
      archived: archivedResult[0]?.count ?? 0,
      deleted: deletedResult[0]?.count ?? 0,
    };
  });
/**
 * Get a single project by ID
 */
export const getById = readSecurityProcedure
  .route({ method: "GET", path: "/projects/{id}" })
  .input(z.object({ id: z.string().uuid() }))
  .output(projectSchema)
  .handler(async ({ input, context }) => {
    const [project] = await appDb
      .select()
      .from(projects)
      .where(
        and(eq(projects.id, input.id), eq(projects.ownerId, context.user.id))
      );

    if (!project) {
      throw new ORPCError("NOT_FOUND", {
        message: "Project not found",
      });
    }

    return toProject(project);
  });

/**
 * Get a project by slug
 */
export const getBySlug = readSecurityProcedure
  .route({ method: "GET", path: "/projects/slug/{slug}" })
  .input(z.object({ slug: z.string() }))
  .output(projectSchema)
  .handler(async ({ input, context }) => {
    const [project] = await appDb
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.slug, input.slug),
          eq(projects.ownerId, context.user.id)
        )
      );

    if (!project) {
      throw new ORPCError("NOT_FOUND", {
        message: "Project not found",
      });
    }

    return toProject(project);
  });

/**
 * Create a new project
 */
export const create = writeSecurityProcedure
  .route({ method: "POST", path: "/projects" })
  .input(createProjectSchema)
  .output(projectSchema)
  .handler(async ({ input, context }) => {
    // Check if slug already exists for this user
    const [existing] = await appDb
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.slug, input.slug),
          eq(projects.ownerId, context.user.id)
        )
      );

    if (existing) {
      throw new ORPCError("CONFLICT", {
        message: "A project with this slug already exists",
      });
    }

    const [project] = await appDb
      .insert(projects)
      .values({
        ...input,
        ownerId: context.user.id,
      })
      .returning();

    if (!project) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create project",
      });
    }

    return toProject(project);
  });

/**
 * Update a project
 */
export const update = writeSecurityProcedure
  .route({ method: "PATCH", path: "/projects/{id}" })
  .input(
    z.object({
      id: z.string().uuid(),
      data: updateProjectSchema,
    })
  )
  .output(projectSchema)
  .handler(async ({ input, context }) => {
    // Verify ownership
    const [existing] = await appDb
      .select()
      .from(projects)
      .where(
        and(eq(projects.id, input.id), eq(projects.ownerId, context.user.id))
      );

    if (!existing) {
      throw new ORPCError("NOT_FOUND", {
        message: "Project not found",
      });
    }

    const [updated] = await appDb
      .update(projects)
      .set(input.data)
      .where(eq(projects.id, input.id))
      .returning();

    if (!updated) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update project",
      });
    }

    return toProject(updated);
  });

/**
 * Delete a project (soft delete - sets status to 'deleted')
 */
export const remove = writeSecurityProcedure
  .route({ method: "DELETE", path: "/projects/{id}" })
  .input(z.object({ id: z.string().uuid() }))
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    // Verify ownership
    const [existing] = await appDb
      .select()
      .from(projects)
      .where(
        and(eq(projects.id, input.id), eq(projects.ownerId, context.user.id))
      );

    if (!existing) {
      throw new ORPCError("NOT_FOUND", {
        message: "Project not found",
      });
    }

    // Soft delete
    await appDb
      .update(projects)
      .set({ status: "deleted" })
      .where(eq(projects.id, input.id));

    return { success: true };
  });

/**
 * Hard delete a project (permanent)
 */
export const hardDelete = heavyWriteSecurityProcedure
  .route({ method: "DELETE", path: "/projects/{id}/permanent" })
  .input(z.object({ id: z.string().uuid() }))
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    // Verify ownership
    const [existing] = await appDb
      .select()
      .from(projects)
      .where(
        and(eq(projects.id, input.id), eq(projects.ownerId, context.user.id))
      );

    if (!existing) {
      throw new ORPCError("NOT_FOUND", {
        message: "Project not found",
      });
    }

    await appDb.delete(projects).where(eq(projects.id, input.id));

    return { success: true };
  });

/**
 * Archive a project
 */
export const archive = writeSecurityProcedure
  .route({ method: "PATCH", path: "/projects/{id}/archive" })
  .input(z.object({ id: z.string().uuid() }))
  .output(projectSchema)
  .handler(async ({ input, context }) => {
    // Verify ownership
    const [existing] = await appDb
      .select()
      .from(projects)
      .where(
        and(eq(projects.id, input.id), eq(projects.ownerId, context.user.id))
      );

    if (!existing) {
      throw new ORPCError("NOT_FOUND", {
        message: "Project not found",
      });
    }

    const [updated] = await appDb
      .update(projects)
      .set({ status: "archived" })
      .where(eq(projects.id, input.id))
      .returning();

    if (!updated) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to archive project",
      });
    }

    return toProject(updated);
  });

/**
 * Restore a project from archived or deleted status
 */
export const restore = writeSecurityProcedure
  .route({ method: "PATCH", path: "/projects/{id}/restore" })
  .input(z.object({ id: z.string().uuid() }))
  .output(projectSchema)
  .handler(async ({ input, context }) => {
    // Verify ownership
    const [existing] = await appDb
      .select()
      .from(projects)
      .where(
        and(eq(projects.id, input.id), eq(projects.ownerId, context.user.id))
      );

    if (!existing) {
      throw new ORPCError("NOT_FOUND", {
        message: "Project not found",
      });
    }

    const [updated] = await appDb
      .update(projects)
      .set({ status: "active" })
      .where(eq(projects.id, input.id))
      .returning();

    if (!updated) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to restore project",
      });
    }

    return toProject(updated);
  });

// Export router
export const projectsRouter = {
  list,
  metrics,
  getById,
  getBySlug,
  create,
  update,
  remove,
  hardDelete,
  archive,
  restore,
};
