/**
 * Projects Router - CRUD operations for projects
 */

import { z } from "zod";
import { ORPCError } from "@orpc/server";
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
} from "../schemas/index.js";
import { ProjectService } from "../services/projects";

// Enhanced list schema with filters
const listProjectsSchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(["active", "archived", "deleted"]).optional(),
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
    return ProjectService.list({
      userId: context.user.id,
      limit: input.limit,
      offset: input.offset,
      search: input.search,
      status: input.status,
    });
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
    return ProjectService.metrics(context.user.id);
  });
/**
 * Get a single project by ID
 */
export const getById = readSecurityProcedure
  .route({ method: "GET", path: "/projects/{id}" })
  .input(z.object({ id: z.string().uuid() }))
  .output(projectSchema)
  .handler(async ({ input, context }) => {
    const project = await ProjectService.getById(context.user.id, input.id);

    if (!project) {
      throw new ORPCError("NOT_FOUND", {
        message: "Project not found",
      });
    }

    return project;
  });

/**
 * Get a project by slug
 */
export const getBySlug = readSecurityProcedure
  .route({ method: "GET", path: "/projects/slug/{slug}" })
  .input(z.object({ slug: z.string() }))
  .output(projectSchema)
  .handler(async ({ input, context }) => {
    const project = await ProjectService.getBySlug(context.user.id, input.slug);

    if (!project) {
      throw new ORPCError("NOT_FOUND", {
        message: "Project not found",
      });
    }

    return project;
  });

/**
 * Create a new project
 */
export const create = writeSecurityProcedure
  .route({ method: "POST", path: "/projects" })
  .input(createProjectSchema)
  .output(projectSchema)
  .handler(async ({ input, context }) => {
    try {
      return await ProjectService.create({
        ...input,
        userId: context.user.id,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "A project with this slug already exists"
      ) {
        throw new ORPCError("CONFLICT", {
          message: "A project with this slug already exists",
        });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create project",
      });
    }
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
    try {
      return await ProjectService.update(context.user.id, input.id, input.data);
    } catch (error) {
      if (error instanceof Error && error.message === "Project not found") {
        throw new ORPCError("NOT_FOUND", { message: "Project not found" });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update project",
      });
    }
  });

/**
 * Delete a project (soft delete - sets status to 'deleted')
 */
export const remove = writeSecurityProcedure
  .route({ method: "DELETE", path: "/projects/{id}" })
  .input(z.object({ id: z.string().uuid() }))
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    try {
      return await ProjectService.remove(context.user.id, input.id);
    } catch (error) {
      if (error instanceof Error && error.message === "Project not found") {
        throw new ORPCError("NOT_FOUND", { message: "Project not found" });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to delete project",
      });
    }
  });

/**
 * Hard delete a project (permanent)
 */
export const hardDelete = heavyWriteSecurityProcedure
  .route({ method: "DELETE", path: "/projects/{id}/permanent" })
  .input(z.object({ id: z.string().uuid() }))
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    try {
      return await ProjectService.hardDelete(context.user.id, input.id);
    } catch (error) {
      if (error instanceof Error && error.message === "Project not found") {
        throw new ORPCError("NOT_FOUND", { message: "Project not found" });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to delete project",
      });
    }
  });

/**
 * Archive a project
 */
export const archive = writeSecurityProcedure
  .route({ method: "PATCH", path: "/projects/{id}/archive" })
  .input(z.object({ id: z.string().uuid() }))
  .output(projectSchema)
  .handler(async ({ input, context }) => {
    try {
      return await ProjectService.archive(context.user.id, input.id);
    } catch (error) {
      if (error instanceof Error && error.message === "Project not found") {
        throw new ORPCError("NOT_FOUND", { message: "Project not found" });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to archive project",
      });
    }
  });

/**
 * Restore a project from archived or deleted status
 */
export const restore = writeSecurityProcedure
  .route({ method: "PATCH", path: "/projects/{id}/restore" })
  .input(z.object({ id: z.string().uuid() }))
  .output(projectSchema)
  .handler(async ({ input, context }) => {
    try {
      return await ProjectService.restore(context.user.id, input.id);
    } catch (error) {
      if (error instanceof Error && error.message === "Project not found") {
        throw new ORPCError("NOT_FOUND", { message: "Project not found" });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to restore project",
      });
    }
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
