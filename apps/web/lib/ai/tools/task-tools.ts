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
} from "@workspace/ai/tools";
import type { Client } from "@workspace/api/client";

export const createTaskTools = (client: Client) => ({
  // LIST TASKS
  listTasks: tool({
    description:
      "List all tasks with optional filters. Can filter by project, assignee, status, priority, search term, or show only overdue tasks.",
    inputSchema: listTasksSchema,
    execute: async (params) => {
      try {
        const result = await client.tasks.list(params);
        return {
          success: true,
          data: result.data,
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
        const task = await client.tasks.getById({ id: params.taskId });
        return {
          success: true,
          data: task,
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
        const tasks = await client.tasks.getMyTasks(params);
        return {
          success: true,
          data: tasks,
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
        const task = await client.tasks.create(params);
        return {
          success: true,
          data: task,
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
        const task = await client.tasks.update(params);
        return {
          success: true,
          data: task,
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
        const task = await client.tasks.changeStatus(params);
        return {
          success: true,
          data: task,
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
        const task = await client.tasks.changeStatus({
          id: params.taskId,
          status: "done",
        });
        return {
          success: true,
          data: task,
          message: `Task ${params.taskId} has been marked as complete`,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to complete task",
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
        const task = await client.tasks.changeStatus({
          id: params.taskId,
          status: "todo",
        });
        return {
          success: true,
          data: task,
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
        const task = await client.tasks.update({
          id: params.taskId,
          priority: params.priority,
        });
        return {
          success: true,
          data: task,
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
        const task = await client.tasks.assign(params);
        return {
          success: true,
          data: task,
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
        const task = await client.tasks.unassign({ id: params.taskId });
        return {
          success: true,
          data: task,
          message: `Task ${params.taskId} has been unassigned`,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to unassign task",
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
        await client.tasks.remove({ id: params.taskId });
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
});
