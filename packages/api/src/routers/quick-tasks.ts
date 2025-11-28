/**
 * Quick Tasks Router - CRUD operations for personal quick tasks
 */

import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { appDb } from "@workspace/db/app-db";
import { quickTasks } from "@workspace/db/app-db/schema";
import {
  readSecurityProcedure,
  writeSecurityProcedure,
} from "../middleware/security.js";
import {
  quickTaskSchema,
  createQuickTaskSchema,
  updateQuickTaskSchema,
  type QuickTask,
} from "../schemas/index.js";

// Helper to cast database result to typed QuickTask
const toQuickTask = (row: typeof quickTasks.$inferSelect): QuickTask => ({
  ...row,
});

/**
 * List all quick tasks for the current user
 */
export const list = readSecurityProcedure
  .output(z.array(quickTaskSchema))
  .handler(async ({ context }) => {
    const rows = await appDb
      .select()
      .from(quickTasks)
      .where(eq(quickTasks.ownerId, context.user.id))
      .orderBy(desc(quickTasks.createdAt));

    return rows.map(toQuickTask);
  });

/**
 * Create a new quick task
 */
export const create = writeSecurityProcedure
  .input(createQuickTaskSchema)
  .output(quickTaskSchema)
  .handler(async ({ input, context }) => {
    const [task] = await appDb
      .insert(quickTasks)
      .values({
        text: input.text,
        ownerId: context.user.id,
      })
      .returning();

    if (!task) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create task",
      });
    }

    return toQuickTask(task);
  });

/**
 * Toggle task completion status
 */
export const toggle = writeSecurityProcedure
  .input(z.object({ id: z.string().uuid() }))
  .output(quickTaskSchema)
  .handler(async ({ input, context }) => {
    // Verify ownership and get current state
    const [existing] = await appDb
      .select()
      .from(quickTasks)
      .where(
        and(
          eq(quickTasks.id, input.id),
          eq(quickTasks.ownerId, context.user.id)
        )
      );

    if (!existing) {
      throw new ORPCError("NOT_FOUND", {
        message: "Task not found",
      });
    }

    const [updated] = await appDb
      .update(quickTasks)
      .set({ completed: !existing.completed })
      .where(eq(quickTasks.id, input.id))
      .returning();

    if (!updated) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update task",
      });
    }

    return toQuickTask(updated);
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
    // Verify ownership
    const [existing] = await appDb
      .select()
      .from(quickTasks)
      .where(
        and(
          eq(quickTasks.id, input.id),
          eq(quickTasks.ownerId, context.user.id)
        )
      );

    if (!existing) {
      throw new ORPCError("NOT_FOUND", {
        message: "Task not found",
      });
    }

    const [updated] = await appDb
      .update(quickTasks)
      .set(input.data)
      .where(eq(quickTasks.id, input.id))
      .returning();

    if (!updated) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update task",
      });
    }

    return toQuickTask(updated);
  });

/**
 * Get a single quick task by ID
 */
export const getById = readSecurityProcedure
  .input(z.object({ id: z.string().uuid() }))
  .output(quickTaskSchema)
  .handler(async ({ input, context }) => {
    const [task] = await appDb
      .select()
      .from(quickTasks)
      .where(
        and(
          eq(quickTasks.id, input.id),
          eq(quickTasks.ownerId, context.user.id)
        )
      );

    if (!task) {
      throw new ORPCError("NOT_FOUND", {
        message: "Task not found",
      });
    }

    return toQuickTask(task);
  });

/**
 * Delete a quick task
 */
export const remove = writeSecurityProcedure
  .input(z.object({ id: z.string().uuid() }))
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    // Verify ownership
    const [existing] = await appDb
      .select()
      .from(quickTasks)
      .where(
        and(
          eq(quickTasks.id, input.id),
          eq(quickTasks.ownerId, context.user.id)
        )
      );

    if (!existing) {
      throw new ORPCError("NOT_FOUND", {
        message: "Task not found",
      });
    }

    await appDb.delete(quickTasks).where(eq(quickTasks.id, input.id));

    return { success: true };
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

    const result = await appDb
      .delete(quickTasks)
      .where(
        and(
          eq(quickTasks.ownerId, context.user.id),
          eq(quickTasks.completed, true)
        )
      )
      .returning();

    return { success: true, deletedCount: result.length };
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
    const created: typeof quickTaskSchema._type[] = [];
    const failed: { index: number; error: string }[] = [];

    for (let i = 0; i < input.tasks.length; i++) {
      const task = input.tasks[i];
      if (!task) continue;

      try {
        const [newTask] = await appDb
          .insert(quickTasks)
          .values({
            text: task.text,
            completed: task.completed || false,
            ownerId: context.user.id,
          })
          .returning();

        if (newTask) {
          created.push(toQuickTask(newTask));
        }
      } catch (error) {
        failed.push({
          index: i,
          error: error instanceof Error ? error.message : "Failed to create quick task",
        });
      }
    }

    return {
      success: failed.length === 0,
      created,
      failed,
    };
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
    const updated: typeof quickTaskSchema._type[] = [];
    const failed: { quickTaskId: string; error: string }[] = [];

    for (const update of input.updates) {
      try {
        const { quickTaskId, ...updates } = update;

        // Verify ownership
        const [existing] = await appDb
          .select()
          .from(quickTasks)
          .where(
            and(
              eq(quickTasks.id, quickTaskId),
              eq(quickTasks.ownerId, context.user.id)
            )
          );

        if (!existing) {
          throw new Error("Quick task not found");
        }

        const [updatedTask] = await appDb
          .update(quickTasks)
          .set(updates)
          .where(eq(quickTasks.id, quickTaskId))
          .returning();

        if (updatedTask) {
          updated.push(toQuickTask(updatedTask));
        }
      } catch (error) {
        failed.push({
          quickTaskId: update.quickTaskId,
          error: error instanceof Error ? error.message : "Failed to update quick task",
        });
      }
    }

    return {
      success: failed.length === 0,
      updated,
      failed,
    };
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
    const failed: { quickTaskId: string; error: string }[] = [];
    let deletedCount = 0;

    for (const quickTaskId of input.quickTaskIds) {
      try {
        const result = await appDb
          .delete(quickTasks)
          .where(
            and(
              eq(quickTasks.id, quickTaskId),
              eq(quickTasks.ownerId, context.user.id)
            )
          )
          .returning();

        if (result.length > 0) {
          deletedCount++;
        } else {
          throw new Error("Quick task not found");
        }
      } catch (error) {
        failed.push({
          quickTaskId,
          error: error instanceof Error ? error.message : "Failed to delete quick task",
        });
      }
    }

    return {
      success: failed.length === 0,
      deletedCount,
      failed,
    };
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
