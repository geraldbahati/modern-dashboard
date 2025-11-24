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
} from "../middleware/security";
import {
  quickTaskSchema,
  createQuickTaskSchema,
  updateQuickTaskSchema,
  type QuickTask,
} from "../schemas";

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

// Export router
export const quickTasksRouter = {
  list,
  create,
  toggle,
  update,
  remove,
};
