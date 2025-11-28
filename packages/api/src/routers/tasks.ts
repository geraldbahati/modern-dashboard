/**
 * Tasks Router - CRUD operations for tasks
 */

import { z } from "zod";
import { eq, and, desc, or, ilike, sql } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { appDb } from "@workspace/db/app-db";
import { tasks, projects } from "@workspace/db/app-db/schema";
import {
  readSecurityProcedure,
  writeSecurityProcedure,
} from "../middleware/security";
import { paginationSchema } from "../schemas";

// Task schema for output
const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  projectId: z.string().uuid(),
  assigneeId: z.string().nullable(),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.number(),
  dueDate: z.date().nullable(),
  completedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

type Task = z.infer<typeof taskSchema>;

// Helper to cast database result to typed Task
const toTask = (row: typeof tasks.$inferSelect): Task => ({
  ...row,
  status: row.status as Task["status"],
});

// Helper to verify project ownership
async function verifyProjectOwnership(projectId: string, userId: string) {
  const [project] = await appDb
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, userId)));

  if (!project) {
    throw new ORPCError("NOT_FOUND", {
      message: "Project not found or access denied",
    });
  }
  return project;
}

/**
 * List all tasks with optional filters
 */
export const list = readSecurityProcedure
  .route({ method: "GET", path: "/tasks" })
  .input(
    paginationSchema.extend({
      projectId: z.string().uuid().optional(),
      assigneeId: z.string().optional(),
      status: z.enum(["todo", "in_progress", "done"]).optional(),
      priority: z.enum(["0", "1", "2"]).optional(),
      search: z.string().optional(),
      overdue: z.boolean().optional(),
    })
  )
  .output(
    z.object({
      data: z.array(taskSchema),
      total: z.number(),
    })
  )
  .handler(async ({ input, context }) => {
    const { limit, offset, projectId, assigneeId, status, priority, search, overdue } = input;

    // Build where conditions
    const conditions = [];

    // Filter by project if specified
    if (projectId) {
      // Verify project ownership
      await verifyProjectOwnership(projectId, context.user.id);
      conditions.push(eq(tasks.projectId, projectId));
    } else {
      // If no projectId, only show tasks from user's projects
      const userProjects = await appDb
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.ownerId, context.user.id));

      const projectIds = userProjects.map(p => p.id);
      if (projectIds.length > 0) {
        conditions.push(sql`${tasks.projectId} IN ${projectIds}`);
      } else {
        // No projects, return empty
        return { data: [], total: 0 };
      }
    }

    // Filter by assignee
    if (assigneeId) {
      conditions.push(eq(tasks.assigneeId, assigneeId));
    }

    // Filter by status
    if (status) {
      conditions.push(eq(tasks.status, status));
    }

    // Filter by priority
    if (priority) {
      conditions.push(eq(tasks.priority, parseInt(priority)));
    }

    // Search filter
    if (search) {
      conditions.push(
        or(
          ilike(tasks.title, `%${search}%`),
          ilike(tasks.description, `%${search}%`)
        )
      );
    }

    // Filter overdue tasks
    if (overdue) {
      conditions.push(
        and(
          sql`${tasks.dueDate} < NOW()`,
          sql`${tasks.status} != 'done'`
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Execute query with pagination
    const rows = await appDb
      .select()
      .from(tasks)
      .where(whereClause)
      .orderBy(desc(tasks.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await appDb
      .select({ count: sql<number>`count(*)::int` })
      .from(tasks)
      .where(whereClause);

    const total = countResult[0]?.count ?? 0;

    return {
      data: rows.map(toTask),
      total,
    };
  });

/**
 * Get a single task by ID
 */
export const getById = readSecurityProcedure
  .route({ method: "GET", path: "/tasks/{id}" })
  .input(z.object({ id: z.string().uuid() }))
  .output(taskSchema)
  .handler(async ({ input, context }) => {
    const [task] = await appDb
      .select()
      .from(tasks)
      .where(eq(tasks.id, input.id));

    if (!task) {
      throw new ORPCError("NOT_FOUND", {
        message: "Task not found",
      });
    }

    // Verify project ownership
    await verifyProjectOwnership(task.projectId, context.user.id);

    return toTask(task);
  });

/**
 * Get tasks assigned to current user
 */
export const getMyTasks = readSecurityProcedure
  .route({ method: "GET", path: "/tasks/me" })
  .input(
    z.object({
      status: z.enum(["todo", "in_progress", "done"]).optional(),
      limit: z.number().min(1).max(100).default(20),
    })
  )
  .output(z.array(taskSchema))
  .handler(async ({ input, context }) => {
    const conditions = [eq(tasks.assigneeId, context.user.id)];

    if (input.status) {
      conditions.push(eq(tasks.status, input.status));
    }

    const rows = await appDb
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(desc(tasks.createdAt))
      .limit(input.limit);

    return rows.map(toTask);
  });

/**
 * Create a new task
 */
export const create = writeSecurityProcedure
  .route({ method: "POST", path: "/tasks" })
  .input(
    z.object({
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      projectId: z.string().uuid(),
      assigneeId: z.string().optional(),
      status: z.enum(["todo", "in_progress", "done"]).default("todo"),
      priority: z.enum(["0", "1", "2"]).default("0"),
      dueDate: z.string().optional(),
    })
  )
  .output(taskSchema)
  .handler(async ({ input, context }) => {
    // Verify project ownership
    await verifyProjectOwnership(input.projectId, context.user.id);

    const [task] = await appDb
      .insert(tasks)
      .values({
        title: input.title,
        description: input.description,
        projectId: input.projectId,
        assigneeId: input.assigneeId,
        status: input.status,
        priority: parseInt(input.priority),
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      })
      .returning();

    if (!task) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create task",
      });
    }

    return toTask(task);
  });

/**
 * Update a task
 */
export const update = writeSecurityProcedure
  .route({ method: "PATCH", path: "/tasks/{id}" })
  .input(
    z.object({
      id: z.string().uuid(),
      title: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      assigneeId: z.string().optional(),
      status: z.enum(["todo", "in_progress", "done"]).optional(),
      priority: z.enum(["0", "1", "2"]).optional(),
      dueDate: z.string().optional(),
    })
  )
  .output(taskSchema)
  .handler(async ({ input, context }) => {
    const { id, ...updates } = input;

    // Get existing task
    const [existing] = await appDb
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));

    if (!existing) {
      throw new ORPCError("NOT_FOUND", {
        message: "Task not found",
      });
    }

    // Verify project ownership
    await verifyProjectOwnership(existing.projectId, context.user.id);

    // Prepare update data
    const updateData: any = { ...updates };
    if (updates.priority) {
      updateData.priority = parseInt(updates.priority);
    }
    if (updates.dueDate) {
      updateData.dueDate = new Date(updates.dueDate);
    }
    if (updates.status === "done" && existing.status !== "done") {
      updateData.completedAt = new Date();
    } else if (updates.status !== "done" && existing.status === "done") {
      updateData.completedAt = null;
    }

    const [updated] = await appDb
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();

    if (!updated) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update task",
      });
    }

    return toTask(updated);
  });

/**
 * Change task status
 */
export const changeStatus = writeSecurityProcedure
  .route({ method: "PATCH", path: "/tasks/{id}/status" })
  .input(
    z.object({
      id: z.string().uuid(),
      status: z.enum(["todo", "in_progress", "done"]),
    })
  )
  .output(taskSchema)
  .handler(async ({ input, context }) => {
    const [existing] = await appDb
      .select()
      .from(tasks)
      .where(eq(tasks.id, input.id));

    if (!existing) {
      throw new ORPCError("NOT_FOUND", {
        message: "Task not found",
      });
    }

    await verifyProjectOwnership(existing.projectId, context.user.id);

    const updateData: any = { status: input.status };
    if (input.status === "done" && existing.status !== "done") {
      updateData.completedAt = new Date();
    } else if (input.status !== "done" && existing.status === "done") {
      updateData.completedAt = null;
    }

    const [updated] = await appDb
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, input.id))
      .returning();

    if (!updated) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update task status",
      });
    }

    return toTask(updated);
  });

/**
 * Assign task to a user
 */
export const assign = writeSecurityProcedure
  .route({ method: "PATCH", path: "/tasks/{id}/assign" })
  .input(
    z.object({
      id: z.string().uuid(),
      assigneeId: z.string(),
    })
  )
  .output(taskSchema)
  .handler(async ({ input, context }) => {
    const [existing] = await appDb
      .select()
      .from(tasks)
      .where(eq(tasks.id, input.id));

    if (!existing) {
      throw new ORPCError("NOT_FOUND", {
        message: "Task not found",
      });
    }

    await verifyProjectOwnership(existing.projectId, context.user.id);

    const [updated] = await appDb
      .update(tasks)
      .set({ assigneeId: input.assigneeId })
      .where(eq(tasks.id, input.id))
      .returning();

    if (!updated) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to assign task",
      });
    }

    return toTask(updated);
  });

/**
 * Unassign task
 */
export const unassign = writeSecurityProcedure
  .route({ method: "PATCH", path: "/tasks/{id}/unassign" })
  .input(z.object({ id: z.string().uuid() }))
  .output(taskSchema)
  .handler(async ({ input, context }) => {
    const [existing] = await appDb
      .select()
      .from(tasks)
      .where(eq(tasks.id, input.id));

    if (!existing) {
      throw new ORPCError("NOT_FOUND", {
        message: "Task not found",
      });
    }

    await verifyProjectOwnership(existing.projectId, context.user.id);

    const [updated] = await appDb
      .update(tasks)
      .set({ assigneeId: null })
      .where(eq(tasks.id, input.id))
      .returning();

    if (!updated) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to unassign task",
      });
    }

    return toTask(updated);
  });

/**
 * Delete a task
 */
export const remove = writeSecurityProcedure
  .route({ method: "DELETE", path: "/tasks/{id}" })
  .input(z.object({ id: z.string().uuid() }))
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    const [existing] = await appDb
      .select()
      .from(tasks)
      .where(eq(tasks.id, input.id));

    if (!existing) {
      throw new ORPCError("NOT_FOUND", {
        message: "Task not found",
      });
    }

    await verifyProjectOwnership(existing.projectId, context.user.id);

    await appDb.delete(tasks).where(eq(tasks.id, input.id));

    return { success: true };
  });

/**
 * Batch create tasks
 */
export const batchCreate = writeSecurityProcedure
  .route({ method: "POST", path: "/tasks/batch" })
  .input(
    z.object({
      tasks: z
        .array(
          z.object({
            title: z.string().min(1).max(255),
            description: z.string().optional(),
            projectId: z.string().uuid(),
            assigneeId: z.string().optional(),
            status: z.enum(["todo", "in_progress", "done"]).default("todo"),
            priority: z.enum(["0", "1", "2"]).default("0"),
            dueDate: z.string().optional(),
          })
        )
        .min(1)
        .max(50),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      created: z.array(taskSchema),
      failed: z.array(
        z.object({
          index: z.number(),
          error: z.string(),
        })
      ),
    })
  )
  .handler(async ({ input, context }) => {
    const created: typeof taskSchema._type[] = [];
    const failed: { index: number; error: string }[] = [];

    for (let i = 0; i < input.tasks.length; i++) {
      const task = input.tasks[i];
      if (!task) continue;

      try {
        // Verify project ownership
        await verifyProjectOwnership(task.projectId, context.user.id);

        const insertData: any = {
          title: task.title,
          description: task.description || null,
          projectId: task.projectId,
          assigneeId: task.assigneeId || null,
          status: task.status || "todo",
          priority: parseInt(task.priority || "0"),
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
        };

        const [newTask] = await appDb.insert(tasks).values(insertData).returning();

        if (newTask) {
          created.push(toTask(newTask));
        }
      } catch (error) {
        failed.push({
          index: i,
          error: error instanceof Error ? error.message : "Failed to create task",
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
 * Batch update tasks
 */
export const batchUpdate = writeSecurityProcedure
  .route({ method: "PATCH", path: "/tasks/batch" })
  .input(
    z.object({
      updates: z
        .array(
          z.object({
            taskId: z.string().uuid(),
            title: z.string().min(1).max(255).optional(),
            description: z.string().optional(),
            assigneeId: z.string().optional(),
            status: z.enum(["todo", "in_progress", "done"]).optional(),
            priority: z.enum(["0", "1", "2"]).optional(),
            dueDate: z.string().optional(),
          })
        )
        .min(1)
        .max(50),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      updated: z.array(taskSchema),
      failed: z.array(
        z.object({
          taskId: z.string(),
          error: z.string(),
        })
      ),
    })
  )
  .handler(async ({ input, context }) => {
    const updated: typeof taskSchema._type[] = [];
    const failed: { taskId: string; error: string }[] = [];

    for (const update of input.updates) {
      try {
        const { taskId, ...updates } = update;

        // Get existing task
        const [existing] = await appDb.select().from(tasks).where(eq(tasks.id, taskId));

        if (!existing) {
          throw new Error("Task not found");
        }

        // Verify project ownership
        await verifyProjectOwnership(existing.projectId, context.user.id);

        // Prepare update data
        const updateData: any = { ...updates };
        if (updates.priority) {
          updateData.priority = parseInt(updates.priority);
        }
        if (updates.dueDate) {
          updateData.dueDate = new Date(updates.dueDate);
        }
        if (updates.status === "done" && existing.status !== "done") {
          updateData.completedAt = new Date();
        } else if (updates.status !== "done" && existing.status === "done") {
          updateData.completedAt = null;
        }

        const [updatedTask] = await appDb
          .update(tasks)
          .set(updateData)
          .where(eq(tasks.id, taskId))
          .returning();

        if (updatedTask) {
          updated.push(toTask(updatedTask));
        }
      } catch (error) {
        failed.push({
          taskId: update.taskId,
          error: error instanceof Error ? error.message : "Failed to update task",
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
 * Batch delete tasks
 */
export const batchDelete = writeSecurityProcedure
  .route({ method: "DELETE", path: "/tasks/batch" })
  .input(
    z.object({
      taskIds: z.array(z.string().uuid()).min(1).max(50),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      deletedCount: z.number(),
      failed: z.array(
        z.object({
          taskId: z.string(),
          error: z.string(),
        })
      ),
    })
  )
  .handler(async ({ input, context }) => {
    const failed: { taskId: string; error: string }[] = [];
    let deletedCount = 0;

    for (const taskId of input.taskIds) {
      try {
        const [existing] = await appDb.select().from(tasks).where(eq(tasks.id, taskId));

        if (!existing) {
          throw new Error("Task not found");
        }

        await verifyProjectOwnership(existing.projectId, context.user.id);

        await appDb.delete(tasks).where(eq(tasks.id, taskId));
        deletedCount++;
      } catch (error) {
        failed.push({
          taskId,
          error: error instanceof Error ? error.message : "Failed to delete task",
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
export const tasksRouter = {
  list,
  getById,
  getMyTasks,
  create,
  update,
  changeStatus,
  assign,
  unassign,
  remove,
  batchCreate,
  batchUpdate,
  batchDelete,
};
