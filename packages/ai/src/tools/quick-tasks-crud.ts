import { z } from "zod";

/**
 * ===========================
 * QUICK TASKS CRUD TOOLS
 * (Personal tasks without project association)
 * ===========================
 */

// VIEW/READ Operations
export const listQuickTasksSchema = z.object({
  limit: z.number().min(1).max(100).default(20).describe("Number of quick tasks to return"),
  offset: z.number().min(0).default(0).describe("Number of quick tasks to skip"),
  completed: z.boolean().optional().describe("Filter by completion status"),
});

export const getQuickTaskByIdSchema = z.object({
  quickTaskId: z.string().uuid().describe("The quick task ID"),
});

// CREATE Operations
export const createQuickTaskSchema = z.object({
  text: z.string().min(1).max(500).describe("Quick task text/description"),
  completed: z.boolean().default(false).describe("Initial completion status"),
});

// UPDATE Operations
export const updateQuickTaskSchema = z.object({
  quickTaskId: z.string().uuid().describe("The quick task ID to update"),
  text: z.string().min(1).max(500).optional().describe("Update task text"),
  completed: z.boolean().optional().describe("Update completion status"),
});

export const toggleQuickTaskSchema = z.object({
  quickTaskId: z.string().uuid().describe("The quick task ID to toggle completion"),
});

export const completeQuickTaskSchema = z.object({
  quickTaskId: z.string().uuid().describe("The quick task ID to mark as complete"),
});

export const uncompleteQuickTaskSchema = z.object({
  quickTaskId: z.string().uuid().describe("The quick task ID to mark as incomplete"),
});

// DELETE Operations
export const deleteQuickTaskSchema = z.object({
  quickTaskId: z.string().uuid().describe("The quick task ID to delete"),
});

export const deleteCompletedQuickTasksSchema = z.object({
  confirm: z.boolean().describe("Must be true to confirm deletion of all completed tasks"),
});

// Type exports
export type ListQuickTasksInput = z.infer<typeof listQuickTasksSchema>;
export type GetQuickTaskByIdInput = z.infer<typeof getQuickTaskByIdSchema>;
export type CreateQuickTaskInput = z.infer<typeof createQuickTaskSchema>;
export type UpdateQuickTaskInput = z.infer<typeof updateQuickTaskSchema>;
export type ToggleQuickTaskInput = z.infer<typeof toggleQuickTaskSchema>;
export type CompleteQuickTaskInput = z.infer<typeof completeQuickTaskSchema>;
export type UncompleteQuickTaskInput = z.infer<typeof uncompleteQuickTaskSchema>;
export type DeleteQuickTaskInput = z.infer<typeof deleteQuickTaskSchema>;
export type DeleteCompletedQuickTasksInput = z.infer<typeof deleteCompletedQuickTasksSchema>;

/**
 * Quick task data types returned by tools
 */
export interface QuickTaskData {
  id: string;
  text: string;
  ownerId: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
