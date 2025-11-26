import { z } from "zod";

/**
 * ===========================
 * TASK CRUD TOOLS
 * ===========================
 */

// VIEW/READ Operations
export const listTasksSchema = z.object({
  limit: z.number().min(1).max(100).default(20).describe("Number of tasks to return"),
  offset: z.number().min(0).default(0).describe("Number of tasks to skip"),
  projectId: z.string().uuid().optional().describe("Filter by project ID"),
  assigneeId: z.string().optional().describe("Filter by assignee user ID"),
  status: z.enum(["todo", "in_progress", "done"]).optional().describe("Filter by task status"),
  priority: z.enum(["0", "1", "2"]).optional().describe("Filter by priority (0=low, 1=medium, 2=high)"),
  search: z.string().optional().describe("Search by title or description"),
  overdue: z.boolean().optional().describe("Filter for overdue tasks only"),
});

export const getTaskByIdSchema = z.object({
  taskId: z.string().uuid().describe("The task ID"),
});

export const getMyTasksSchema = z.object({
  status: z.enum(["todo", "in_progress", "done"]).optional().describe("Filter by task status"),
  limit: z.number().min(1).max(100).default(20),
});

// CREATE Operations
export const createTaskSchema = z.object({
  title: z.string().min(1).max(255).describe("Task title"),
  description: z.string().optional().describe("Task description"),
  projectId: z.string().uuid().describe("Project ID this task belongs to"),
  assigneeId: z.string().optional().describe("User ID to assign this task to"),
  status: z.enum(["todo", "in_progress", "done"]).default("todo").describe("Initial task status"),
  priority: z
    .enum(["0", "1", "2"])
    .default("0")
    .describe("Task priority (0=low, 1=medium, 2=high)"),
  dueDate: z.string().optional().describe("Due date in ISO format"),
});

// UPDATE Operations
export const updateTaskSchema = z.object({
  taskId: z.string().uuid().describe("The task ID to update"),
  title: z.string().min(1).max(255).optional().describe("Update task title"),
  description: z.string().optional().describe("Update task description"),
  assigneeId: z.string().optional().describe("Update task assignee"),
  status: z.enum(["todo", "in_progress", "done"]).optional().describe("Update task status"),
  priority: z.enum(["0", "1", "2"]).optional().describe("Update task priority"),
  dueDate: z.string().optional().describe("Update due date in ISO format"),
});

export const assignTaskSchema = z.object({
  taskId: z.string().uuid().describe("The task ID"),
  assigneeId: z.string().describe("User ID to assign the task to"),
});

export const unassignTaskSchema = z.object({
  taskId: z.string().uuid().describe("The task ID to unassign"),
});

export const completeTaskSchema = z.object({
  taskId: z.string().uuid().describe("The task ID to mark as complete"),
});

export const reopenTaskSchema = z.object({
  taskId: z.string().uuid().describe("The task ID to reopen (set back to todo)"),
});

export const changeTaskStatusSchema = z.object({
  taskId: z.string().uuid().describe("The task ID"),
  status: z.enum(["todo", "in_progress", "done"]).describe("New status"),
});

export const changeTaskPrioritySchema = z.object({
  taskId: z.string().uuid().describe("The task ID"),
  priority: z.enum(["0", "1", "2"]).describe("New priority (0=low, 1=medium, 2=high)"),
});

// DELETE Operations
export const deleteTaskSchema = z.object({
  taskId: z.string().uuid().describe("The task ID to delete"),
});

// Type exports
export type ListTasksInput = z.infer<typeof listTasksSchema>;
export type GetTaskByIdInput = z.infer<typeof getTaskByIdSchema>;
export type GetMyTasksInput = z.infer<typeof getMyTasksSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type AssignTaskInput = z.infer<typeof assignTaskSchema>;
export type UnassignTaskInput = z.infer<typeof unassignTaskSchema>;
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;
export type ReopenTaskInput = z.infer<typeof reopenTaskSchema>;
export type ChangeTaskStatusInput = z.infer<typeof changeTaskStatusSchema>;
export type ChangeTaskPriorityInput = z.infer<typeof changeTaskPrioritySchema>;
export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;

/**
 * Task data types returned by tools
 */
export interface TaskData {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  assigneeId: string | null;
  status: "todo" | "in_progress" | "done";
  priority: number;
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
