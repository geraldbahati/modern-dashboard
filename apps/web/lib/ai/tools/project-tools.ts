import { tool } from "ai";
import {
  listProjectsSchema,
  getProjectByIdSchema,
  getProjectBySlugSchema,
  createProjectSchema,
  updateProjectSchema,
  archiveProjectSchema,
  restoreProjectSchema,
  deleteProjectSchema,
} from "@workspace/ai/tools";
import type { Client } from "@workspace/api/client";

export const createProjectTools = (client: Client) => ({
  // LIST PROJECTS
  listProjects: tool({
    description:
      "List all projects for the current user with optional filters. Use this to show projects, search by name/description, or filter by status.",
    inputSchema: listProjectsSchema,
    execute: async (params) => {
      try {
        const result = await client.projects.list({
          limit: params.limit,
          offset: params.offset,
        });
        return {
          success: true,
          data: result.data,
          count: result.total,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch projects",
        };
      }
    },
  }),

  // GET PROJECT BY ID
  getProjectById: tool({
    description:
      "Get detailed information about a specific project by its ID. Only returns projects owned by the current user.",
    inputSchema: getProjectByIdSchema,
    execute: async (params) => {
      try {
        const project = await client.projects.getById({
          id: params.projectId,
        });
        return {
          success: true,
          data: project,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch project",
        };
      }
    },
  }),

  // GET PROJECT BY SLUG
  getProjectBySlug: tool({
    description:
      "Get detailed information about a specific project by its slug. Only returns projects owned by the current user.",
    inputSchema: getProjectBySlugSchema,
    execute: async (params) => {
      try {
        const project = await client.projects.getBySlug(params);
        return {
          success: true,
          data: project,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch project",
        };
      }
    },
  }),

  // CREATE PROJECT
  createProject: tool({
    description:
      "Create a new project. The current user automatically becomes the owner. Requires name and slug at minimum.",
    inputSchema: createProjectSchema,
    execute: async (params) => {
      try {
        const project = await client.projects.create(params);
        return {
          success: true,
          data: project,
          message: "Project created successfully",
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create project",
        };
      }
    },
  }),

  // UPDATE PROJECT
  updateProject: tool({
    description:
      "Update an existing project's information. Only the owner can update. Only provided fields will be updated.",
    inputSchema: updateProjectSchema,
    execute: async (params) => {
      try {
        const { projectId, ...data } = params;
        const project = await client.projects.update({
          id: projectId,
          data,
        });
        return {
          success: true,
          data: project,
          message: "Project updated successfully",
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update project",
        };
      }
    },
  }),

  // ARCHIVE PROJECT
  archiveProject: tool({
    description:
      "Archive a project. Archived projects are hidden from active view but can be restored later.",
    inputSchema: archiveProjectSchema,
    execute: async (params) => {
      try {
        const project = await client.projects.archive({ id: params.projectId });
        return {
          success: true,
          data: project,
          message: `Project ${params.projectId} has been archived`,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to archive project",
        };
      }
    },
  }),

  // RESTORE PROJECT
  restoreProject: tool({
    description:
      "Restore an archived or deleted project back to active status.",
    inputSchema: restoreProjectSchema,
    execute: async (params) => {
      try {
        const project = await client.projects.restore({ id: params.projectId });
        return {
          success: true,
          data: project,
          message: `Project ${params.projectId} has been restored`,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to restore project",
        };
      }
    },
  }),

  // DELETE PROJECT
  deleteProject: tool({
    description:
      "Delete a project. If permanent is true, permanently deletes the project. If false, soft deletes (marks as deleted but can be restored).",
    inputSchema: deleteProjectSchema,
    execute: async (params) => {
      try {
        if (params.permanent) {
          await client.projects.hardDelete({ id: params.projectId });
        } else {
          await client.projects.remove({ id: params.projectId });
        }
        const deleteType = params.permanent
          ? "permanently deleted"
          : "soft deleted";
        return {
          success: true,
          message: `Project ${params.projectId} has been ${deleteType}`,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete project",
        };
      }
    },
  }),
});
