import { tool } from "ai";
import {
  listTasksSchema,
  getTaskByIdSchema,
  getMyTasksSchema,
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  unassignTaskSchema,
  completeTaskSchema,
  reopenTaskSchema,
  changeTaskStatusSchema,
  changeTaskPrioritySchema,
  deleteTaskSchema,
  batchCreateTasksSchema,
  batchUpdateTasksSchema,
  batchDeleteTasksSchema,
} from "@workspace/ai/tools";
import { TaskService } from "../../../services/tasks";

export const createTaskTools = (userId: string) => {
  // Helper to serialize dates for AI SDK
  const serializeTask = (task: any) => ({
    ...task,
    createdAt:
      task.createdAt instanceof Date
        ? task.createdAt.toISOString()
        : task.createdAt,
    updatedAt:
      task.updatedAt instanceof Date
        ? task.updatedAt.toISOString()
        : task.updatedAt,
    dueDate:
      task.dueDate instanceof Date ? task.dueDate.toISOString() : task.dueDate,
    completedAt:
      task.completedAt instanceof Date
        ? task.completedAt.toISOString()
        : task.completedAt,
  });

  return {
    // LIST TASKS
    listTasks: tool({
      description:
        "List all tasks with optional filters. Can filter by project, assignee, status, priority, search term, or show only overdue tasks.",
      inputSchema: listTasksSchema,
      execute: async (params) => {
        try {
          const result = await TaskService.list({
            userId,
            ...params,
          });
          return {
            success: true,
            data: result.data.map(serializeTask),
            count: result.total,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error ? error.message : "Failed to fetch tasks",
          };
        }
      },
    }),

    // GET TASK BY ID
    getTaskById: tool({
      description:
        "Get detailed information about a specific task by its ID. Only returns tasks from projects owned by the current user.",
      inputSchema: getTaskByIdSchema,
      execute: async (params) => {
        try {
          const task = await TaskService.getById(userId, params.taskId);
          return {
            success: true,
            data: serializeTask(task),
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error ? error.message : "Failed to fetch task",
          };
        }
      },
    }),

    // GET MY TASKS
    getMyTasks: tool({
      description:
        "Get tasks assigned to the current user. Optionally filter by status (todo, in_progress, done).",
      inputSchema: getMyTasksSchema,
      execute: async (params) => {
        try {
          const tasks = await TaskService.getMyTasks({
            userId,
            ...params,
          });
          return {
            success: true,
            data: tasks.map(serializeTask),
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch user tasks",
          };
        }
      },
    }),

    // CREATE TASK
    createTask: tool({
      description:
        "Create a new task in a project. Requires title and projectId at minimum. Can optionally set assignee, status, priority, and due date.",
      inputSchema: createTaskSchema,
      execute: async (params) => {
        try {
          const task = await TaskService.create({
            userId,
            ...params,
          });
          return {
            success: true,
            data: serializeTask(task),
            message: "Task created successfully",
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error ? error.message : "Failed to create task",
          };
        }
      },
    }),

    // UPDATE TASK
    updateTask: tool({
      description:
        "Update an existing task's information. Only the project owner can update. Only provided fields will be updated.",
      inputSchema: updateTaskSchema,
      execute: async (params) => {
        try {
          const { taskId, ...updateData } = params;
          const task = await TaskService.update({
            userId,
            id: taskId,
            ...updateData,
          });
          return {
            success: true,
            data: serializeTask(task),
            message: "Task updated successfully",
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error ? error.message : "Failed to update task",
          };
        }
      },
    }),

    // CHANGE TASK STATUS
    changeTaskStatus: tool({
      description:
        "Change a task's status to todo, in_progress, or done. Automatically sets completedAt when marking as done.",
      inputSchema: changeTaskStatusSchema,
      execute: async (params) => {
        try {
          const { taskId, status } = params;
          const task = await TaskService.changeStatus({
            userId,
            id: taskId,
            status,
          });
          return {
            success: true,
            data: serializeTask(task),
            message: `Task status changed to ${params.status}`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to change task status",
          };
        }
      },
    }),

    // COMPLETE TASK
    completeTask: tool({
      description:
        "Mark a task as complete (done status). Sets the completedAt timestamp.",
      inputSchema: completeTaskSchema,
      execute: async (params) => {
        try {
          const task = await TaskService.changeStatus({
            userId,
            id: params.taskId,
            status: "done",
          });
          return {
            success: true,
            data: serializeTask(task),
            message: `Task ${params.taskId} has been marked as complete`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to complete task",
          };
        }
      },
    }),

    // REOPEN TASK
    reopenTask: tool({
      description:
        "Reopen a completed task by setting its status back to todo. Clears the completedAt timestamp.",
      inputSchema: reopenTaskSchema,
      execute: async (params) => {
        try {
          const task = await TaskService.changeStatus({
            userId,
            id: params.taskId,
            status: "todo",
          });
          return {
            success: true,
            data: serializeTask(task),
            message: `Task ${params.taskId} has been reopened`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error ? error.message : "Failed to reopen task",
          };
        }
      },
    }),

    // CHANGE TASK PRIORITY
    changeTaskPriority: tool({
      description:
        "Change a task's priority. Priority levels: 0 (low), 1 (medium), 2 (high).",
      inputSchema: changeTaskPrioritySchema,
      execute: async (params) => {
        try {
          const task = await TaskService.update({
            userId,
            id: params.taskId,
            priority: params.priority,
          });
          return {
            success: true,
            data: serializeTask(task),
            message: `Task priority changed to ${params.priority}`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to change task priority",
          };
        }
      },
    }),

    // ASSIGN TASK
    assignTask: tool({
      description: "Assign a task to a specific user by their user ID.",
      inputSchema: assignTaskSchema,
      execute: async (params) => {
        try {
          const { taskId, assigneeId } = params;
          const task = await TaskService.assign({
            userId,
            id: taskId,
            assigneeId,
          });
          return {
            success: true,
            data: serializeTask(task),
            message: `Task ${params.taskId} assigned to user ${params.assigneeId}`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error ? error.message : "Failed to assign task",
          };
        }
      },
    }),

    // UNASSIGN TASK
    unassignTask: tool({
      description: "Remove the assignee from a task, leaving it unassigned.",
      inputSchema: unassignTaskSchema,
      execute: async (params) => {
        try {
          const task = await TaskService.unassign({
            userId,
            id: params.taskId,
          });
          return {
            success: true,
            data: serializeTask(task),
            message: `Task ${params.taskId} has been unassigned`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to unassign task",
          };
        }
      },
    }),

    // DELETE TASK
    deleteTask: tool({
      description:
        "Delete a task permanently. Only the project owner can delete tasks.",
      inputSchema: deleteTaskSchema,
      execute: async (params) => {
        try {
          await TaskService.remove({
            userId,
            id: params.taskId,
          });
          return {
            success: true,
            message: `Task ${params.taskId} has been deleted`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error ? error.message : "Failed to delete task",
          };
        }
      },
    }),

    // BATCH CREATE TASKS
    batchCreateTasks: tool({
      description:
        "Create multiple tasks at once (up to 50 tasks). Useful for bulk task creation or importing tasks. Returns both successfully created tasks and any failures with error messages.",
      inputSchema: batchCreateTasksSchema,
      execute: async (params) => {
        try {
          const result = await TaskService.batchCreate({
            userId,
            tasks: params.tasks,
          });
          return {
            success: result.success,
            created: result.created.map(serializeTask),
            failed: result.failed,
            message: `Created ${result.created.length} tasks${result.failed.length > 0 ? `, ${result.failed.length} failed` : ""}`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to batch create tasks",
          };
        }
      },
    }),

    // BATCH UPDATE TASKS
    batchUpdateTasks: tool({
      description:
        "Update multiple tasks at once (up to 50 tasks). Each update can modify different fields (title, description, status, priority, assignee, due date). Returns successfully updated tasks and any failures with error messages.",
      inputSchema: batchUpdateTasksSchema,
      execute: async (params) => {
        try {
          const result = await TaskService.batchUpdate({
            userId,
            updates: params.updates,
          });
          return {
            success: result.success,
            updated: result.updated.map(serializeTask),
            failed: result.failed,
            message: `Updated ${result.updated.length} tasks${result.failed.length > 0 ? `, ${result.failed.length} failed` : ""}`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to batch update tasks",
          };
        }
      },
    }),

    // BATCH DELETE TASKS
    batchDeleteTasks: tool({
      description:
        "Delete multiple tasks at once (up to 50 tasks). Only the project owner can delete tasks. Returns count of successfully deleted tasks and any failures with error messages.",
      inputSchema: batchDeleteTasksSchema,
      execute: async (params) => {
        try {
          const result = await TaskService.batchDelete({
            userId,
            taskIds: params.taskIds,
          });
          return {
            success: result.success,
            deletedCount: result.deletedCount,
            failed: result.failed,
            message: `Deleted ${result.deletedCount} tasks${result.failed.length > 0 ? `, ${result.failed.length} failed` : ""}`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to batch delete tasks",
          };
        }
      },
    }),
  };
};
