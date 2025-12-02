import { tool } from "ai";
import {
  listQuickTasksSchema,
  getQuickTaskByIdSchema,
  createQuickTaskSchema,
  updateQuickTaskSchema,
  toggleQuickTaskSchema,
  completeQuickTaskSchema,
  uncompleteQuickTaskSchema,
  deleteQuickTaskSchema,
  deleteCompletedQuickTasksSchema,
  batchCreateQuickTasksSchema,
  batchUpdateQuickTasksSchema,
  batchDeleteQuickTasksSchema,
} from "@workspace/ai/tools";
import { QuickTaskService } from "../../../services/quick-tasks";

export const createQuickTaskTools = (userId: string) => ({
  // LIST QUICK TASKS
  listQuickTasks: tool({
    description:
      "List all personal quick tasks for the current user. These are simple to-do items without project association. Can filter by completion status.",
    inputSchema: listQuickTasksSchema,
    execute: async (params) => {
      try {
        const tasks = await QuickTaskService.list(userId);

        // Filter by completion if specified
        let filteredTasks = tasks;
        if (params.completed !== undefined) {
          filteredTasks = tasks.filter((t) => t.completed === params.completed);
        }

        // Apply pagination
        const start = params.offset || 0;
        const end = start + (params.limit || 20);
        const paginatedTasks = filteredTasks.slice(start, end);

        return {
          success: true,
          data: paginatedTasks,
          count: filteredTasks.length,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch quick tasks",
        };
      }
    },
  }),

  // GET QUICK TASK BY ID
  getQuickTaskById: tool({
    description:
      "Get a specific quick task by its ID. Only returns tasks owned by the current user.",
    inputSchema: getQuickTaskByIdSchema,
    execute: async (params) => {
      try {
        const task = await QuickTaskService.getById(userId, params.quickTaskId);
        if (!task) {
          return {
            success: false,
            error: "Quick task not found",
          };
        }
        return {
          success: true,
          data: task,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch quick task",
        };
      }
    },
  }),

  // CREATE QUICK TASK
  createQuickTask: tool({
    description:
      "Create a new personal quick task. Quick tasks are simple to-do items that don't belong to any project. Just provide the task text.",
    inputSchema: createQuickTaskSchema,
    execute: async (params) => {
      try {
        const task = await QuickTaskService.create(userId, params.text);
        return {
          success: true,
          data: task,
          message: "Quick task created successfully",
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create quick task",
        };
      }
    },
  }),

  // UPDATE QUICK TASK
  updateQuickTask: tool({
    description:
      "Update a quick task's text or completion status. Only provided fields will be updated.",
    inputSchema: updateQuickTaskSchema,
    execute: async (params) => {
      try {
        const { quickTaskId, ...data } = params;
        const task = await QuickTaskService.update(userId, quickTaskId, data);
        return {
          success: true,
          data: task,
          message: "Quick task updated successfully",
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update quick task",
        };
      }
    },
  }),

  // TOGGLE QUICK TASK
  toggleQuickTask: tool({
    description:
      "Toggle a quick task's completion status (completed <-> incomplete). This is a quick way to check off tasks.",
    inputSchema: toggleQuickTaskSchema,
    execute: async (params) => {
      try {
        const task = await QuickTaskService.toggle(userId, params.quickTaskId);
        return {
          success: true,
          data: task,
          message: `Quick task marked as ${task.completed ? "completed" : "incomplete"}`,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to toggle quick task",
        };
      }
    },
  }),

  // COMPLETE QUICK TASK
  completeQuickTask: tool({
    description: "Mark a quick task as completed.",
    inputSchema: completeQuickTaskSchema,
    execute: async (params) => {
      try {
        const task = await QuickTaskService.update(userId, params.quickTaskId, {
          completed: true,
        });
        return {
          success: true,
          data: task,
          message: `Quick task ${params.quickTaskId} has been completed`,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to complete quick task",
        };
      }
    },
  }),

  // UNCOMPLETE QUICK TASK
  uncompleteQuickTask: tool({
    description: "Mark a quick task as incomplete (uncomplete it).",
    inputSchema: uncompleteQuickTaskSchema,
    execute: async (params) => {
      try {
        const task = await QuickTaskService.update(userId, params.quickTaskId, {
          completed: false,
        });
        return {
          success: true,
          data: task,
          message: `Quick task ${params.quickTaskId} has been marked as incomplete`,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to uncomplete quick task",
        };
      }
    },
  }),

  // DELETE QUICK TASK
  deleteQuickTask: tool({
    description:
      "Delete a specific quick task permanently. This cannot be undone.",
    inputSchema: deleteQuickTaskSchema,
    execute: async (params) => {
      try {
        await QuickTaskService.delete(userId, params.quickTaskId);
        return {
          success: true,
          message: `Quick task ${params.quickTaskId} has been deleted`,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete quick task",
        };
      }
    },
  }),

  // DELETE ALL COMPLETED QUICK TASKS
  deleteCompletedQuickTasks: tool({
    description:
      "Delete all completed quick tasks at once. This is useful for clearing out finished tasks. Requires confirmation.",
    inputSchema: deleteCompletedQuickTasksSchema,
    execute: async (params) => {
      try {
        if (!params.confirm) {
          throw new Error("Confirmation required to delete completed tasks");
        }
        const result = await QuickTaskService.deleteCompleted(userId);
        return {
          success: true,
          message: `Deleted ${result.deletedCount} completed quick tasks`,
          deletedCount: result.deletedCount,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete completed quick tasks",
        };
      }
    },
  }),

  // BATCH CREATE QUICK TASKS
  batchCreateQuickTasks: tool({
    description:
      "Create multiple quick tasks at once (up to 50 tasks). Useful for adding multiple to-do items quickly. Returns both successfully created tasks and any failures with error messages.",
    inputSchema: batchCreateQuickTasksSchema,
    execute: async (params) => {
      try {
        const result = await QuickTaskService.batchCreate(userId, params.tasks);
        return {
          success: result.success,
          created: result.created,
          failed: result.failed,
          message: `Created ${result.created.length} quick tasks${result.failed.length > 0 ? `, ${result.failed.length} failed` : ""}`,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to batch create quick tasks",
        };
      }
    },
  }),

  // BATCH UPDATE QUICK TASKS
  batchUpdateQuickTasks: tool({
    description:
      "Update multiple quick tasks at once (up to 50 tasks). Each update can modify the text and/or completion status. Returns successfully updated tasks and any failures with error messages.",
    inputSchema: batchUpdateQuickTasksSchema,
    execute: async (params) => {
      try {
        const result = await QuickTaskService.batchUpdate(
          userId,
          params.updates
        );
        return {
          success: result.success,
          updated: result.updated,
          failed: result.failed,
          message: `Updated ${result.updated.length} quick tasks${result.failed.length > 0 ? `, ${result.failed.length} failed` : ""}`,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to batch update quick tasks",
        };
      }
    },
  }),

  // BATCH DELETE QUICK TASKS
  batchDeleteQuickTasks: tool({
    description:
      "Delete multiple quick tasks at once (up to 50 tasks). Returns count of successfully deleted tasks and any failures with error messages.",
    inputSchema: batchDeleteQuickTasksSchema,
    execute: async (params) => {
      try {
        const result = await QuickTaskService.batchDelete(
          userId,
          params.quickTaskIds
        );
        return {
          success: result.success,
          deletedCount: result.deletedCount,
          failed: result.failed,
          message: `Deleted ${result.deletedCount} quick tasks${result.failed.length > 0 ? `, ${result.failed.length} failed` : ""}`,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to batch delete quick tasks",
        };
      }
    },
  }),
});
