import { eq, and, desc } from "drizzle-orm";
import { appDb } from "@workspace/db/app-db";
import { quickTasks } from "@workspace/db/app-db/schema";
import type { QuickTask } from "../schemas/index.js";

// Helper to cast database result to typed QuickTask
const toQuickTask = (row: typeof quickTasks.$inferSelect): QuickTask => ({
  ...row,
});

export const QuickTaskService = {
  /**
   * List all quick tasks for a user
   */
  list: async (userId: string) => {
    const rows = await appDb
      .select()
      .from(quickTasks)
      .where(eq(quickTasks.ownerId, userId))
      .orderBy(desc(quickTasks.createdAt));

    return rows.map(toQuickTask);
  },

  /**
   * Get a single quick task by ID
   */
  getById: async (userId: string, taskId: string) => {
    const [task] = await appDb
      .select()
      .from(quickTasks)
      .where(and(eq(quickTasks.id, taskId), eq(quickTasks.ownerId, userId)));

    if (!task) return null;
    return toQuickTask(task);
  },

  /**
   * Create a new quick task
   */
  create: async (userId: string, text: string) => {
    const [task] = await appDb
      .insert(quickTasks)
      .values({
        text,
        ownerId: userId,
      })
      .returning();

    if (!task) {
      throw new Error("Failed to create task");
    }

    return toQuickTask(task);
  },

  /**
   * Update a quick task
   */
  update: async (
    userId: string,
    taskId: string,
    data: Partial<Pick<QuickTask, "text" | "completed">>
  ) => {
    // Verify ownership
    const existing = await QuickTaskService.getById(userId, taskId);
    if (!existing) {
      throw new Error("Task not found");
    }

    const [updated] = await appDb
      .update(quickTasks)
      .set(data)
      .where(eq(quickTasks.id, taskId))
      .returning();

    if (!updated) {
      throw new Error("Failed to update task");
    }

    return toQuickTask(updated);
  },

  /**
   * Toggle task completion status
   */
  toggle: async (userId: string, taskId: string) => {
    const existing = await QuickTaskService.getById(userId, taskId);
    if (!existing) {
      throw new Error("Task not found");
    }

    const [updated] = await appDb
      .update(quickTasks)
      .set({ completed: !existing.completed })
      .where(eq(quickTasks.id, taskId))
      .returning();

    if (!updated) {
      throw new Error("Failed to update task");
    }

    return toQuickTask(updated);
  },

  /**
   * Delete a quick task
   */
  delete: async (userId: string, taskId: string) => {
    const existing = await QuickTaskService.getById(userId, taskId);
    if (!existing) {
      throw new Error("Task not found");
    }

    await appDb.delete(quickTasks).where(eq(quickTasks.id, taskId));
    return { success: true };
  },

  /**
   * Delete all completed quick tasks
   */
  deleteCompleted: async (userId: string) => {
    const result = await appDb
      .delete(quickTasks)
      .where(
        and(eq(quickTasks.ownerId, userId), eq(quickTasks.completed, true))
      )
      .returning();

    return { success: true, deletedCount: result.length };
  },

  /**
   * Batch create quick tasks
   */
  batchCreate: async (
    userId: string,
    tasks: { text: string; completed?: boolean }[]
  ) => {
    const created: QuickTask[] = [];
    const failed: { index: number; error: string }[] = [];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      if (!task) continue;

      try {
        const [newTask] = await appDb
          .insert(quickTasks)
          .values({
            text: task.text,
            completed: task.completed || false,
            ownerId: userId,
          })
          .returning();

        if (newTask) {
          created.push(toQuickTask(newTask));
        }
      } catch (error) {
        failed.push({
          index: i,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create quick task",
        });
      }
    }

    return {
      success: failed.length === 0,
      created,
      failed,
    };
  },

  /**
   * Batch update quick tasks
   */
  batchUpdate: async (
    userId: string,
    updates: { quickTaskId: string; text?: string; completed?: boolean }[]
  ) => {
    const updated: QuickTask[] = [];
    const failed: { quickTaskId: string; error: string }[] = [];

    for (const update of updates) {
      try {
        const { quickTaskId, ...data } = update;
        const result = await QuickTaskService.update(userId, quickTaskId, data);
        updated.push(result);
      } catch (error) {
        failed.push({
          quickTaskId: update.quickTaskId,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update quick task",
        });
      }
    }

    return {
      success: failed.length === 0,
      updated,
      failed,
    };
  },

  /**
   * Batch delete quick tasks
   */
  batchDelete: async (userId: string, taskIds: string[]) => {
    const failed: { quickTaskId: string; error: string }[] = [];
    let deletedCount = 0;

    for (const quickTaskId of taskIds) {
      try {
        await QuickTaskService.delete(userId, quickTaskId);
        deletedCount++;
      } catch (error) {
        failed.push({
          quickTaskId,
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete quick task",
        });
      }
    }

    return {
      success: failed.length === 0,
      deletedCount,
      failed,
    };
  },
};
