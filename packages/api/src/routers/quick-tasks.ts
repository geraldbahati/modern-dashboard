/**
 * Quick Tasks Router - CRUD operations for personal quick tasks
 */

import { z } from "zod";
import { ORPCError } from "@orpc/server";
import {
  readSecurityProcedure,
  writeSecurityProcedure,
} from "../middleware/security.js";
import {
  quickTaskSchema,
  createQuickTaskSchema,
  updateQuickTaskSchema,
} from "../schemas/index.js";
import { QuickTaskService } from "../services/quick-tasks";

/**
 * List all quick tasks for the current user
 */
export const list = readSecurityProcedure
  .output(z.array(quickTaskSchema))
  .handler(async ({ context }) => {
    return QuickTaskService.list(context.user.id);
  });

/**
 * Create a new quick task
 */
export const create = writeSecurityProcedure
  .input(createQuickTaskSchema)
  .output(quickTaskSchema)
  .handler(async ({ input, context }) => {
    try {
      return await QuickTaskService.create(context.user.id, input.text);
    } catch (error) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create task",
      });
    }
  });

/**
 * Toggle task completion status
 */
export const toggle = writeSecurityProcedure
  .input(z.object({ id: z.string().uuid() }))
  .output(quickTaskSchema)
  .handler(async ({ input, context }) => {
    try {
      return await QuickTaskService.toggle(context.user.id, input.id);
    } catch (error) {
      if (error instanceof Error && error.message === "Task not found") {
        throw new ORPCError("NOT_FOUND", { message: "Task not found" });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update task",
      });
    }
  });

/**
 * Update a quick task
 */
export const update = writeSecurityProcedure
  .input(
    z.object({
      id: z.string().uuid(),
      data: updateQuickTaskSchema,
    })
  )
  .output(quickTaskSchema)
  .handler(async ({ input, context }) => {
    try {
      return await QuickTaskService.update(
        context.user.id,
        input.id,
        input.data
      );
    } catch (error) {
      if (error instanceof Error && error.message === "Task not found") {
        throw new ORPCError("NOT_FOUND", { message: "Task not found" });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update task",
      });
    }
  });

/**
 * Get a single quick task by ID
 */
export const getById = readSecurityProcedure
  .input(z.object({ id: z.string().uuid() }))
  .output(quickTaskSchema)
  .handler(async ({ input, context }) => {
    const task = await QuickTaskService.getById(context.user.id, input.id);

    if (!task) {
      throw new ORPCError("NOT_FOUND", {
        message: "Task not found",
      });
    }

    return task;
  });

/**
 * Delete a quick task
 */
export const remove = writeSecurityProcedure
  .input(z.object({ id: z.string().uuid() }))
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    try {
      return await QuickTaskService.delete(context.user.id, input.id);
    } catch (error) {
      if (error instanceof Error && error.message === "Task not found") {
        throw new ORPCError("NOT_FOUND", { message: "Task not found" });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to delete task",
      });
    }
  });

/**
 * Delete all completed quick tasks
 */
export const deleteCompleted = writeSecurityProcedure
  .input(z.object({ confirm: z.boolean() }))
  .output(z.object({ success: z.boolean(), deletedCount: z.number() }))
  .handler(async ({ input, context }) => {
    if (!input.confirm) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Confirmation required to delete completed tasks",
      });
    }

    return QuickTaskService.deleteCompleted(context.user.id);
  });

/**
 * Batch create quick tasks
 */
export const batchCreate = writeSecurityProcedure
  .route({ method: "POST", path: "/quick-tasks/batch" })
  .input(
    z.object({
      tasks: z
        .array(
          z.object({
            text: z.string().min(1).max(500),
            completed: z.boolean().default(false),
          })
        )
        .min(1)
        .max(50),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      created: z.array(quickTaskSchema),
      failed: z.array(
        z.object({
          index: z.number(),
          error: z.string(),
        })
      ),
    })
  )
  .handler(async ({ input, context }) => {
    return QuickTaskService.batchCreate(context.user.id, input.tasks);
  });

/**
 * Batch update quick tasks
 */
export const batchUpdate = writeSecurityProcedure
  .route({ method: "PATCH", path: "/quick-tasks/batch" })
  .input(
    z.object({
      updates: z
        .array(
          z.object({
            quickTaskId: z.string().uuid(),
            text: z.string().min(1).max(500).optional(),
            completed: z.boolean().optional(),
          })
        )
        .min(1)
        .max(50),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      updated: z.array(quickTaskSchema),
      failed: z.array(
        z.object({
          quickTaskId: z.string(),
          error: z.string(),
        })
      ),
    })
  )
  .handler(async ({ input, context }) => {
    return QuickTaskService.batchUpdate(context.user.id, input.updates);
  });

/**
 * Batch delete quick tasks
 */
export const batchDelete = writeSecurityProcedure
  .route({ method: "DELETE", path: "/quick-tasks/batch" })
  .input(
    z.object({
      quickTaskIds: z.array(z.string().uuid()).min(1).max(50),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      deletedCount: z.number(),
      failed: z.array(
        z.object({
          quickTaskId: z.string(),
          error: z.string(),
        })
      ),
    })
  )
  .handler(async ({ input, context }) => {
    return QuickTaskService.batchDelete(context.user.id, input.quickTaskIds);
  });

// Export router
export const quickTasksRouter = {
  list,
  getById,
  create,
  toggle,
  update,
  remove,
  deleteCompleted,
  batchCreate,
  batchUpdate,
  batchDelete,
};
