/**
 * Tasks Router - CRUD operations for tasks
 */

import { z } from "zod";
import { ORPCError } from "@orpc/server";
import {
  readSecurityProcedure,
  writeSecurityProcedure,
} from "../middleware/security.js";
import { paginationSchema } from "../schemas/index.js";
import { TaskService } from "../services/tasks";

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
    return TaskService.list({
      userId: context.user.id,
      ...input,
    });
  });

/**
 * Get a single task by ID
 */
export const getById = readSecurityProcedure
  .route({ method: "GET", path: "/tasks/{id}" })
  .input(z.object({ id: z.string().uuid() }))
  .output(taskSchema)
  .handler(async ({ input, context }) => {
    try {
      return await TaskService.getById(context.user.id, input.id);
    } catch (error) {
      if (error instanceof Error && error.message === "Task not found") {
        throw new ORPCError("NOT_FOUND", {
          message: "Task not found",
        });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch task",
      });
    }
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
    return TaskService.getMyTasks({
      userId: context.user.id,
      ...input,
    });
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
    try {
      return await TaskService.create({
        userId: context.user.id,
        ...input,
      });
    } catch (error) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create task",
      });
    }
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
    try {
      return await TaskService.update({
        userId: context.user.id,
        ...input,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Task not found") {
        throw new ORPCError("NOT_FOUND", {
          message: "Task not found",
        });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update task",
      });
    }
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
    try {
      return await TaskService.changeStatus({
        userId: context.user.id,
        ...input,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Task not found") {
        throw new ORPCError("NOT_FOUND", {
          message: "Task not found",
        });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update task status",
      });
    }
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
    try {
      return await TaskService.assign({
        userId: context.user.id,
        ...input,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Task not found") {
        throw new ORPCError("NOT_FOUND", {
          message: "Task not found",
        });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to assign task",
      });
    }
  });

/**
 * Unassign task
 */
export const unassign = writeSecurityProcedure
  .route({ method: "PATCH", path: "/tasks/{id}/unassign" })
  .input(z.object({ id: z.string().uuid() }))
  .output(taskSchema)
  .handler(async ({ input, context }) => {
    try {
      return await TaskService.unassign({
        userId: context.user.id,
        ...input,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Task not found") {
        throw new ORPCError("NOT_FOUND", {
          message: "Task not found",
        });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to unassign task",
      });
    }
  });

/**
 * Delete a task
 */
export const remove = writeSecurityProcedure
  .route({ method: "DELETE", path: "/tasks/{id}" })
  .input(z.object({ id: z.string().uuid() }))
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    try {
      return await TaskService.remove({
        userId: context.user.id,
        ...input,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Task not found") {
        throw new ORPCError("NOT_FOUND", {
          message: "Task not found",
        });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to delete task",
      });
    }
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
    return TaskService.batchCreate({
      userId: context.user.id,
      tasks: input.tasks,
    });
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
    return TaskService.batchUpdate({
      userId: context.user.id,
      updates: input.updates,
    });
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
    return TaskService.batchDelete({
      userId: context.user.id,
      taskIds: input.taskIds,
    });
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
