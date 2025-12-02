import { eq, and, desc, or, ilike, sql } from "drizzle-orm";
import { z } from "zod";
import { appDb } from "@workspace/db/app-db";
import { tasks, projects } from "@workspace/db/app-db/schema";

// Task schema for output (matching what was in the router)
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
    throw new Error("Project not found or access denied");
  }
  return project;
}

export const TaskService = {
  /**
   * List all tasks with optional filters
   */
  list: async (input: {
    userId: string;
    limit: number;
    offset: number;
    projectId?: string;
    assigneeId?: string;
    status?: "todo" | "in_progress" | "done";
    priority?: "0" | "1" | "2";
    search?: string;
    overdue?: boolean;
  }) => {
    const {
      userId,
      limit,
      offset,
      projectId,
      assigneeId,
      status,
      priority,
      search,
      overdue,
    } = input;

    // Build where conditions
    const conditions = [];

    // Filter by project if specified
    if (projectId) {
      // Verify project ownership
      await verifyProjectOwnership(projectId, userId);
      conditions.push(eq(tasks.projectId, projectId));
    } else {
      // If no projectId, only show tasks from user's projects
      const userProjects = await appDb
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.ownerId, userId));

      const projectIds = userProjects.map((p) => p.id);
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
          ilike(tasks.description || "", `%${search}%`)
        )!
      );
    }

    // Filter overdue tasks
    if (overdue) {
      conditions.push(
        and(sql`${tasks.dueDate} < NOW()`, sql`${tasks.status} != 'done'`)!
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
  },

  /**
   * Get a single task by ID
   */
  getById: async (userId: string, taskId: string) => {
    const [task] = await appDb.select().from(tasks).where(eq(tasks.id, taskId));

    if (!task) {
      throw new Error("Task not found");
    }

    // Verify project ownership
    await verifyProjectOwnership(task.projectId, userId);

    return toTask(task);
  },

  /**
   * Get tasks assigned to current user
   */
  getMyTasks: async (input: {
    userId: string;
    limit: number;
    status?: "todo" | "in_progress" | "done";
  }) => {
    const { userId, limit, status } = input;
    const conditions = [eq(tasks.assigneeId, userId)];

    if (status) {
      conditions.push(eq(tasks.status, status));
    }

    const rows = await appDb
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(desc(tasks.createdAt))
      .limit(limit);

    return rows.map(toTask);
  },

  /**
   * Create a new task
   */
  create: async (input: {
    userId: string;
    title: string;
    projectId: string;
    description?: string;
    assigneeId?: string;
    status?: "todo" | "in_progress" | "done";
    priority?: "0" | "1" | "2";
    dueDate?: string;
  }) => {
    const { userId, ...data } = input;

    // Verify project ownership
    await verifyProjectOwnership(data.projectId, userId);

    const [task] = await appDb
      .insert(tasks)
      .values({
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        assigneeId: data.assigneeId,
        status: data.status || "todo",
        priority: parseInt(data.priority || "0"),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      })
      .returning();

    if (!task) {
      throw new Error("Failed to create task");
    }

    return toTask(task);
  },

  /**
   * Update a task
   */
  update: async (input: {
    userId: string;
    id: string;
    title?: string;
    description?: string;
    assigneeId?: string;
    status?: "todo" | "in_progress" | "done";
    priority?: "0" | "1" | "2";
    dueDate?: string;
  }) => {
    const { userId, id, ...updates } = input;

    // Get existing task
    const [existing] = await appDb.select().from(tasks).where(eq(tasks.id, id));

    if (!existing) {
      throw new Error("Task not found");
    }

    // Verify project ownership
    await verifyProjectOwnership(existing.projectId, userId);

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
      throw new Error("Failed to update task");
    }

    return toTask(updated);
  },

  /**
   * Change task status
   */
  changeStatus: async (input: {
    userId: string;
    id: string;
    status: "todo" | "in_progress" | "done";
  }) => {
    const { userId, id, status } = input;

    const [existing] = await appDb.select().from(tasks).where(eq(tasks.id, id));

    if (!existing) {
      throw new Error("Task not found");
    }

    await verifyProjectOwnership(existing.projectId, userId);

    const updateData: any = { status };
    if (status === "done" && existing.status !== "done") {
      updateData.completedAt = new Date();
    } else if (status !== "done" && existing.status === "done") {
      updateData.completedAt = null;
    }

    const [updated] = await appDb
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();

    if (!updated) {
      throw new Error("Failed to update task status");
    }

    return toTask(updated);
  },

  /**
   * Assign task to a user
   */
  assign: async (input: { userId: string; id: string; assigneeId: string }) => {
    const { userId, id, assigneeId } = input;

    const [existing] = await appDb.select().from(tasks).where(eq(tasks.id, id));

    if (!existing) {
      throw new Error("Task not found");
    }

    await verifyProjectOwnership(existing.projectId, userId);

    const [updated] = await appDb
      .update(tasks)
      .set({ assigneeId })
      .where(eq(tasks.id, id))
      .returning();

    if (!updated) {
      throw new Error("Failed to assign task");
    }

    return toTask(updated);
  },

  /**
   * Unassign task
   */
  unassign: async (input: { userId: string; id: string }) => {
    const { userId, id } = input;

    const [existing] = await appDb.select().from(tasks).where(eq(tasks.id, id));

    if (!existing) {
      throw new Error("Task not found");
    }

    await verifyProjectOwnership(existing.projectId, userId);

    const [updated] = await appDb
      .update(tasks)
      .set({ assigneeId: null })
      .where(eq(tasks.id, id))
      .returning();

    if (!updated) {
      throw new Error("Failed to unassign task");
    }

    return toTask(updated);
  },

  /**
   * Delete a task
   */
  remove: async (input: { userId: string; id: string }) => {
    const { userId, id } = input;

    const [existing] = await appDb.select().from(tasks).where(eq(tasks.id, id));

    if (!existing) {
      throw new Error("Task not found");
    }

    await verifyProjectOwnership(existing.projectId, userId);

    await appDb.delete(tasks).where(eq(tasks.id, id));

    return { success: true };
  },

  /**
   * Batch create tasks
   */
  batchCreate: async (input: {
    userId: string;
    tasks: Array<{
      title: string;
      projectId: string;
      description?: string;
      assigneeId?: string;
      status?: "todo" | "in_progress" | "done";
      priority?: "0" | "1" | "2";
      dueDate?: string;
    }>;
  }) => {
    const { userId, tasks: tasksList } = input;
    const created: Task[] = [];
    const failed: { index: number; error: string }[] = [];

    for (let i = 0; i < tasksList.length; i++) {
      const task = tasksList[i];
      if (!task) continue;

      try {
        // Verify project ownership
        await verifyProjectOwnership(task.projectId, userId);

        const insertData: any = {
          title: task.title,
          description: task.description || null,
          projectId: task.projectId,
          assigneeId: task.assigneeId || null,
          status: task.status || "todo",
          priority: parseInt(task.priority || "0"),
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
        };

        const [newTask] = await appDb
          .insert(tasks)
          .values(insertData)
          .returning();

        if (newTask) {
          created.push(toTask(newTask));
        }
      } catch (error) {
        failed.push({
          index: i,
          error:
            error instanceof Error ? error.message : "Failed to create task",
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
   * Batch update tasks
   */
  batchUpdate: async (input: {
    userId: string;
    updates: Array<{
      taskId: string;
      title?: string;
      description?: string;
      assigneeId?: string;
      status?: "todo" | "in_progress" | "done";
      priority?: "0" | "1" | "2";
      dueDate?: string;
    }>;
  }) => {
    const { userId, updates } = input;
    const updated: Task[] = [];
    const failed: { taskId: string; error: string }[] = [];

    for (const update of updates) {
      try {
        const { taskId, ...taskUpdates } = update;

        // Get existing task
        const [existing] = await appDb
          .select()
          .from(tasks)
          .where(eq(tasks.id, taskId));

        if (!existing) {
          throw new Error("Task not found");
        }

        // Verify project ownership
        await verifyProjectOwnership(existing.projectId, userId);

        // Prepare update data
        const updateData: any = { ...taskUpdates };
        if (taskUpdates.priority) {
          updateData.priority = parseInt(taskUpdates.priority);
        }
        if (taskUpdates.dueDate) {
          updateData.dueDate = new Date(taskUpdates.dueDate);
        }
        if (taskUpdates.status === "done" && existing.status !== "done") {
          updateData.completedAt = new Date();
        } else if (
          taskUpdates.status !== "done" &&
          existing.status === "done"
        ) {
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
          error:
            error instanceof Error ? error.message : "Failed to update task",
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
   * Batch delete tasks
   */
  batchDelete: async (input: { userId: string; taskIds: string[] }) => {
    const { userId, taskIds } = input;
    const failed: { taskId: string; error: string }[] = [];
    let deletedCount = 0;

    for (const taskId of taskIds) {
      try {
        const [existing] = await appDb
          .select()
          .from(tasks)
          .where(eq(tasks.id, taskId));

        if (!existing) {
          throw new Error("Task not found");
        }

        await verifyProjectOwnership(existing.projectId, userId);

        await appDb.delete(tasks).where(eq(tasks.id, taskId));
        deletedCount++;
      } catch (error) {
        failed.push({
          taskId,
          error:
            error instanceof Error ? error.message : "Failed to delete task",
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
