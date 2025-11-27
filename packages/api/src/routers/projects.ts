/**
 * Projects Router - CRUD operations for projects
 */

import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { appDb } from "@workspace/db/app-db";
import { projects } from "@workspace/db/app-db/schema";
import {
  readSecurityProcedure,
  writeSecurityProcedure,
  heavyWriteSecurityProcedure,
} from "../middleware/security";
import {
  paginationSchema,
  projectSchema,
  createProjectSchema,
  updateProjectSchema,
  type Project,
} from "../schemas";

// Helper to cast database result to typed Project
const toProject = (row: typeof projects.$inferSelect): Project => ({
  ...row,
  status: row.status as Project["status"],
});

/**
 * List all projects for the current user
 */
export const list = readSecurityProcedure
  .route({ method: "GET", path: "/projects" })
  .input(paginationSchema)
  .output(
    z.object({
      data: z.array(projectSchema),
      total: z.number(),
    })
  )
  .handler(async ({ input, context }) => {
    const { limit, offset } = input;

    const rows = await appDb
      .select()
      .from(projects)
      .where(eq(projects.ownerId, context.user.id))
      .orderBy(desc(projects.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await appDb
      .select()
      .from(projects)
      .where(eq(projects.ownerId, context.user.id));

    return {
      data: rows.map(toProject),
      total: countResult.length,
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
  getById,
  getBySlug,
  create,
  update,
  remove,
  hardDelete,
  archive,
  restore,
};
