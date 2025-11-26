import { z } from "zod";

/**
 * ===========================
 * PROJECT CRUD TOOLS
 * ===========================
 */

// VIEW/READ Operations
export const listProjectsSchema = z.object({
  limit: z.number().min(1).max(100).default(20).describe("Number of projects to return"),
  offset: z.number().min(0).default(0).describe("Number of projects to skip"),
  search: z.string().optional().describe("Search by name or description"),
  status: z
    .enum(["active", "archived", "deleted"])
    .optional()
    .describe("Filter by project status"),
  ownerId: z.string().optional().describe("Filter by owner user ID"),
  isPublic: z.boolean().optional().describe("Filter by public/private projects"),
});

export const getProjectByIdSchema = z.object({
  projectId: z.string().uuid().describe("The project ID"),
});

export const getProjectBySlugSchema = z.object({
  slug: z.string().describe("The project slug"),
});

export const getProjectStatsSchema = z.object({
  projectId: z.string().uuid().describe("The project ID to get stats for"),
});

export const getProjectTasksSchema = z.object({
  projectId: z.string().uuid().describe("The project ID"),
  status: z
    .enum(["todo", "in_progress", "done"])
    .optional()
    .describe("Filter tasks by status"),
  limit: z.number().min(1).max(100).default(20),
});

// CREATE Operations
export const createProjectSchema = z.object({
  name: z.string().min(1).max(255).describe("Project name"),
  description: z.string().optional().describe("Project description"),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .describe("URL-friendly project identifier"),
  imageUrl: z.string().url().optional().describe("Project image/logo URL"),
  status: z
    .enum(["active", "archived", "deleted"])
    .default("active")
    .describe("Initial project status"),
  isPublic: z.boolean().default(false).describe("Whether the project is public"),
});

// UPDATE Operations
export const updateProjectSchema = z.object({
  projectId: z.string().uuid().describe("The project ID to update"),
  name: z.string().min(1).max(255).optional().describe("Update project name"),
  description: z.string().optional().describe("Update project description"),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional()
    .describe("Update project slug"),
  imageUrl: z.string().url().optional().describe("Update project image URL"),
  status: z.enum(["active", "archived", "deleted"]).optional().describe("Update project status"),
  isPublic: z.boolean().optional().describe("Update public/private status"),
});

export const archiveProjectSchema = z.object({
  projectId: z.string().uuid().describe("The project ID to archive"),
});

export const restoreProjectSchema = z.object({
  projectId: z.string().uuid().describe("The project ID to restore from archived/deleted"),
});

// DELETE Operations
export const deleteProjectSchema = z.object({
  projectId: z.string().uuid().describe("The project ID to delete"),
  permanent: z
    .boolean()
    .default(false)
    .describe("If true, permanently delete. If false, soft delete (mark as deleted)"),
});

// Type exports
export type ListProjectsInput = z.infer<typeof listProjectsSchema>;
export type GetProjectByIdInput = z.infer<typeof getProjectByIdSchema>;
export type GetProjectBySlugInput = z.infer<typeof getProjectBySlugSchema>;
export type GetProjectStatsInput = z.infer<typeof getProjectStatsSchema>;
export type GetProjectTasksInput = z.infer<typeof getProjectTasksSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ArchiveProjectInput = z.infer<typeof archiveProjectSchema>;
export type RestoreProjectInput = z.infer<typeof restoreProjectSchema>;
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>;

/**
 * Project data types returned by tools
 */
export interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  imageUrl: string | null;
  ownerId: string;
  status: "active" | "archived" | "deleted";
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectStatsData {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;
  overdueTasks: number;
}
