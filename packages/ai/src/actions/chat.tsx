"use server";

import { streamUI } from "ai/rsc";
import { getModel } from "../lib/ai-provider";
import { systemPrompt } from "../lib/system-prompt";
import type { ModelId } from "../lib/ai-provider";

// Import all CRUD tool schemas
import {
  // Users
  listUsersSchema,
  getUserByIdSchema,
  createUserSchema,
  updateUserSchema,
  updateUserRoleSchema,
  deleteUserSchema,
  // Projects
  listProjectsSchema,
  getProjectByIdSchema,
  createProjectSchema,
  updateProjectSchema,
  deleteProjectSchema,
  archiveProjectSchema,
  getProjectStatsSchema,
  // Tasks
  listTasksSchema,
  getTaskByIdSchema,
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  completeTaskSchema,
  changeTaskStatusSchema,
  deleteTaskSchema,
  // Organizations
  listOrganizationsSchema,
  getOrganizationByIdSchema,
  createOrganizationSchema,
  updateOrganizationSchema,
  addMemberSchema,
  removeMemberSchema,
  inviteMemberSchema,
  deleteOrganizationSchema,
  // Quick Tasks
  listQuickTasksSchema,
  createQuickTaskSchema,
  updateQuickTaskSchema,
  toggleQuickTaskSchema,
  deleteQuickTaskSchema,
  // Analytics
  getDashboardOverviewSchema,
  getUserAnalyticsSchema,
  getProjectAnalyticsSchema,
  getTaskDistributionSchema,
  getOverdueTasksSchema,
} from "../tools";

/**
 * Chat message type
 */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Loading skeleton component
 */
function LoadingSkeleton({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Placeholder component for tool results
 * This will be replaced with actual UI components from @workspace/ui
 */
function ToolResult({ type, data }: { type: string; data: unknown }) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-2">
      <div className="font-medium text-sm capitalize">
        {type.replace(/-/g, " ")}
      </div>
      <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-96">
        {JSON.stringify(data, null, 2)}
      </pre>
      <p className="text-xs text-muted-foreground italic">
        Replace with UI component from @workspace/ui
      </p>
    </div>
  );
}

/**
 * Stream AI chat response with generative UI
 * This is the main server action that handles chat interactions
 */
export async function streamChat(input: string, modelId: ModelId = "gpt-4o") {
  "use server";

  const result = await streamUI({
    model: getModel(modelId) as any,
    system: systemPrompt,
    prompt: input,
    text: async function* ({ content }) {
      if (content) {
        yield <div className="prose prose-sm max-w-none dark:prose-invert">{content}</div>;
      }
      return <div className="prose prose-sm max-w-none dark:prose-invert">{content}</div>;
    },
    tools: {
      // ===========================
      // USER MANAGEMENT TOOLS
      // ===========================
      listUsers: {
        description:
          "List all users in the system with pagination and filters. Use this when asked about users, team members, or to show user lists.",
        parameters: listUsersSchema,
        generate: async function* ({ limit, offset, search, role, status }) {
          yield <LoadingSkeleton message="Fetching users..." />;

          // TODO: Call API - const users = await usersRouter.list({ limit, offset, search, role, status });
          return (
            <ToolResult
              type="users-list"
              data={{ limit, offset, search, role, status }}
            />
          );
        },
      },

      getUserById: {
        description: "Get detailed information about a specific user by their ID.",
        parameters: getUserByIdSchema,
        generate: async function* ({ userId }) {
          yield <LoadingSkeleton message="Loading user details..." />;

          // TODO: Call API - const user = await usersRouter.getById({ id: userId });
          return <ToolResult type="user-details" data={{ userId }} />;
        },
      },

      createUser: {
        description:
          "Create a new user account. Use this when asked to add a new user or team member.",
        parameters: createUserSchema,
        generate: async function* ({ name, email, role, image }) {
          yield <LoadingSkeleton message="Creating user..." />;

          // TODO: Call API - const user = await usersRouter.create({ name, email, role, image });
          return (
            <ToolResult
              type="user-created"
              data={{ name, email, role, success: true }}
            />
          );
        },
      },

      updateUser: {
        description: "Update user details like name, email, role, or profile image.",
        parameters: updateUserSchema,
        generate: async function* ({ userId, name, email, image, role }) {
          yield <LoadingSkeleton message="Updating user..." />;

          // TODO: Call API - const user = await usersRouter.update({ userId, name, email, image, role });
          return (
            <ToolResult
              type="user-updated"
              data={{ userId, name, email, role, success: true }}
            />
          );
        },
      },

      updateUserRole: {
        description:
          "Change a user's role (admin, moderator, editor, user). Use for permission management.",
        parameters: updateUserRoleSchema,
        generate: async function* ({ userId, role }) {
          yield <LoadingSkeleton message="Updating user role..." />;

          // TODO: Call API - const user = await usersRouter.updateRole({ userId, role });
          return (
            <ToolResult
              type="user-role-updated"
              data={{ userId, role, success: true }}
            />
          );
        },
      },

      deleteUser: {
        description: "Delete a user from the system (permanently or soft delete).",
        parameters: deleteUserSchema,
        generate: async function* ({ userId, permanent }) {
          yield <LoadingSkeleton message="Deleting user..." />;

          // TODO: Call API - await usersRouter.delete({ id: userId, permanent });
          return (
            <ToolResult
              type="user-deleted"
              data={{ userId, permanent, success: true }}
            />
          );
        },
      },

      // ===========================
      // PROJECT MANAGEMENT TOOLS
      // ===========================
      listProjects: {
        description:
          "List all projects with filters. Use this to show projects, find specific projects, or get project overviews.",
        parameters: listProjectsSchema,
        generate: async function* ({ limit, offset, search, status, ownerId, isPublic }) {
          yield <LoadingSkeleton message="Loading projects..." />;

          // TODO: Call API - const projects = await projectsRouter.list({ limit, offset, search, status });
          return (
            <ToolResult
              type="projects-grid"
              data={{ limit, offset, search, status, ownerId, isPublic }}
            />
          );
        },
      },

      getProjectById: {
        description: "Get detailed information about a specific project by its ID.",
        parameters: getProjectByIdSchema,
        generate: async function* ({ projectId }) {
          yield <LoadingSkeleton message="Loading project details..." />;

          // TODO: Call API - const project = await projectsRouter.getById({ id: projectId });
          return <ToolResult type="project-details" data={{ projectId }} />;
        },
      },

      getProjectStats: {
        description:
          "Get statistics and metrics for a specific project (completion rate, tasks, progress).",
        parameters: getProjectStatsSchema,
        generate: async function* ({ projectId }) {
          yield <LoadingSkeleton message="Calculating project statistics..." />;

          // TODO: Call API - const stats = await projectsRouter.getStats({ id: projectId });
          return <ToolResult type="project-stats" data={{ projectId }} />;
        },
      },

      createProject: {
        description:
          "Create a new project. Use this when asked to start a new project or initiative.",
        parameters: createProjectSchema,
        generate: async function* ({ name, description, slug, imageUrl, status, isPublic }) {
          yield <LoadingSkeleton message="Creating project..." />;

          // TODO: Call API - const project = await projectsRouter.create({ name, description, slug, imageUrl, status, isPublic });
          return (
            <ToolResult
              type="project-created"
              data={{ name, slug, success: true }}
            />
          );
        },
      },

      updateProject: {
        description: "Update project details like name, description, status, or visibility.",
        parameters: updateProjectSchema,
        generate: async function* ({ projectId, name, description, slug, imageUrl, status, isPublic }) {
          yield <LoadingSkeleton message="Updating project..." />;

          // TODO: Call API - const project = await projectsRouter.update({ id: projectId, data: { name, description, slug, imageUrl, status, isPublic }});
          return (
            <ToolResult
              type="project-updated"
              data={{ projectId, name, success: true }}
            />
          );
        },
      },

      archiveProject: {
        description: "Archive a project to mark it as inactive while preserving data.",
        parameters: archiveProjectSchema,
        generate: async function* ({ projectId }) {
          yield <LoadingSkeleton message="Archiving project..." />;

          // TODO: Call API - await projectsRouter.archive({ id: projectId });
          return (
            <ToolResult
              type="project-archived"
              data={{ projectId, success: true }}
            />
          );
        },
      },

      deleteProject: {
        description: "Delete a project (soft delete or permanent removal).",
        parameters: deleteProjectSchema,
        generate: async function* ({ projectId, permanent }) {
          yield <LoadingSkeleton message="Deleting project..." />;

          // TODO: Call API - await projectsRouter.delete({ id: projectId, permanent });
          return (
            <ToolResult
              type="project-deleted"
              data={{ projectId, permanent, success: true }}
            />
          );
        },
      },

      // ===========================
      // TASK MANAGEMENT TOOLS
      // ===========================
      listTasks: {
        description:
          "List all tasks with comprehensive filters (project, assignee, status, priority). Use to show tasks, find specific tasks, or get task overviews.",
        parameters: listTasksSchema,
        generate: async function* ({ limit, offset, projectId, assigneeId, status, priority, search, overdue }) {
          yield <LoadingSkeleton message="Fetching tasks..." />;

          // TODO: Call API - const tasks = await tasksRouter.list({ limit, offset, projectId, assigneeId, status, priority, search, overdue });
          return (
            <ToolResult
              type="tasks-list"
              data={{ limit, projectId, assigneeId, status, priority }}
            />
          );
        },
      },

      getTaskById: {
        description: "Get detailed information about a specific task.",
        parameters: getTaskByIdSchema,
        generate: async function* ({ taskId }) {
          yield <LoadingSkeleton message="Loading task details..." />;

          // TODO: Call API - const task = await tasksRouter.getById({ id: taskId });
          return <ToolResult type="task-details" data={{ taskId }} />;
        },
      },

      createTask: {
        description:
          "Create a new task in a project. Use when asked to add tasks, create todos, or assign work.",
        parameters: createTaskSchema,
        generate: async function* ({ title, description, projectId, assigneeId, status, priority, dueDate }) {
          yield <LoadingSkeleton message="Creating task..." />;

          // TODO: Call API - const task = await tasksRouter.create({ title, description, projectId, assigneeId, status, priority, dueDate });
          return (
            <ToolResult
              type="task-created"
              data={{ title, projectId, assigneeId, success: true }}
            />
          );
        },
      },

      updateTask: {
        description: "Update task details like title, description, assignee, status, priority, or due date.",
        parameters: updateTaskSchema,
        generate: async function* ({ taskId, title, description, assigneeId, status, priority, dueDate }) {
          yield <LoadingSkeleton message="Updating task..." />;

          // TODO: Call API - const task = await tasksRouter.update({ id: taskId, title, description, assigneeId, status, priority, dueDate });
          return (
            <ToolResult
              type="task-updated"
              data={{ taskId, title, status, success: true }}
            />
          );
        },
      },

      assignTask: {
        description: "Assign a task to a specific user.",
        parameters: assignTaskSchema,
        generate: async function* ({ taskId, assigneeId }) {
          yield <LoadingSkeleton message="Assigning task..." />;

          // TODO: Call API - const task = await tasksRouter.assign({ id: taskId, assigneeId });
          return (
            <ToolResult
              type="task-assigned"
              data={{ taskId, assigneeId, success: true }}
            />
          );
        },
      },

      completeTask: {
        description: "Mark a task as completed.",
        parameters: completeTaskSchema,
        generate: async function* ({ taskId }) {
          yield <LoadingSkeleton message="Completing task..." />;

          // TODO: Call API - const task = await tasksRouter.complete({ id: taskId });
          return (
            <ToolResult
              type="task-completed"
              data={{ taskId, success: true }}
            />
          );
        },
      },

      changeTaskStatus: {
        description: "Change the status of a task (todo, in_progress, done).",
        parameters: changeTaskStatusSchema,
        generate: async function* ({ taskId, status }) {
          yield <LoadingSkeleton message="Updating task status..." />;

          // TODO: Call API - const task = await tasksRouter.changeStatus({ id: taskId, status });
          return (
            <ToolResult
              type="task-status-changed"
              data={{ taskId, status, success: true }}
            />
          );
        },
      },

      deleteTask: {
        description: "Delete a task permanently.",
        parameters: deleteTaskSchema,
        generate: async function* ({ taskId }) {
          yield <LoadingSkeleton message="Deleting task..." />;

          // TODO: Call API - await tasksRouter.delete({ id: taskId });
          return (
            <ToolResult
              type="task-deleted"
              data={{ taskId, success: true }}
            />
          );
        },
      },

      // ===========================
      // ORGANIZATION MANAGEMENT TOOLS
      // ===========================
      listOrganizations: {
        description:
          "List all organizations. Use to show organizations, find specific ones, or get organization overviews.",
        parameters: listOrganizationsSchema,
        generate: async function* ({ limit, offset, search }) {
          yield <LoadingSkeleton message="Loading organizations..." />;

          // TODO: Call API - const orgs = await organizationsRouter.list({ limit, offset, search });
          return (
            <ToolResult
              type="organizations-list"
              data={{ limit, offset, search }}
            />
          );
        },
      },

      getOrganizationById: {
        description: "Get detailed information about a specific organization.",
        parameters: getOrganizationByIdSchema,
        generate: async function* ({ organizationId }) {
          yield <LoadingSkeleton message="Loading organization details..." />;

          // TODO: Call API - const org = await organizationsRouter.getById({ id: organizationId });
          return <ToolResult type="organization-details" data={{ organizationId }} />;
        },
      },

      createOrganization: {
        description: "Create a new organization. Use when setting up a new team or company.",
        parameters: createOrganizationSchema,
        generate: async function* ({ name, slug, logo, metadata }) {
          yield <LoadingSkeleton message="Creating organization..." />;

          // TODO: Call API - const org = await organizationsRouter.create({ name, slug, logo, metadata });
          return (
            <ToolResult
              type="organization-created"
              data={{ name, slug, success: true }}
            />
          );
        },
      },

      updateOrganization: {
        description: "Update organization details like name, slug, logo, or metadata.",
        parameters: updateOrganizationSchema,
        generate: async function* ({ organizationId, name, slug, logo, metadata }) {
          yield <LoadingSkeleton message="Updating organization..." />;

          // TODO: Call API - const org = await organizationsRouter.update({ id: organizationId, name, slug, logo, metadata });
          return (
            <ToolResult
              type="organization-updated"
              data={{ organizationId, name, success: true }}
            />
          );
        },
      },

      addMember: {
        description: "Add a member to an organization with a specific role (owner, admin, member).",
        parameters: addMemberSchema,
        generate: async function* ({ organizationId, userId, role }) {
          yield <LoadingSkeleton message="Adding member..." />;

          // TODO: Call API - await organizationsRouter.addMember({ organizationId, userId, role });
          return (
            <ToolResult
              type="member-added"
              data={{ organizationId, userId, role, success: true }}
            />
          );
        },
      },

      removeMember: {
        description: "Remove a member from an organization.",
        parameters: removeMemberSchema,
        generate: async function* ({ organizationId, userId }) {
          yield <LoadingSkeleton message="Removing member..." />;

          // TODO: Call API - await organizationsRouter.removeMember({ organizationId, userId });
          return (
            <ToolResult
              type="member-removed"
              data={{ organizationId, userId, success: true }}
            />
          );
        },
      },

      inviteMember: {
        description: "Invite someone to join an organization via email.",
        parameters: inviteMemberSchema,
        generate: async function* ({ organizationId, email, role }) {
          yield <LoadingSkeleton message="Sending invitation..." />;

          // TODO: Call API - await organizationsRouter.invite({ organizationId, email, role });
          return (
            <ToolResult
              type="member-invited"
              data={{ organizationId, email, role, success: true }}
            />
          );
        },
      },

      deleteOrganization: {
        description: "Delete an organization permanently.",
        parameters: deleteOrganizationSchema,
        generate: async function* ({ organizationId }) {
          yield <LoadingSkeleton message="Deleting organization..." />;

          // TODO: Call API - await organizationsRouter.delete({ id: organizationId });
          return (
            <ToolResult
              type="organization-deleted"
              data={{ organizationId, success: true }}
            />
          );
        },
      },

      // ===========================
      // QUICK TASKS TOOLS
      // ===========================
      listQuickTasks: {
        description:
          "List personal quick tasks (tasks not associated with a project). Use for personal todo lists.",
        parameters: listQuickTasksSchema,
        generate: async function* ({ limit, offset, completed }) {
          yield <LoadingSkeleton message="Loading quick tasks..." />;

          // TODO: Call API - const tasks = await quickTasksRouter.list({ limit, offset, completed });
          return (
            <ToolResult
              type="quick-tasks-list"
              data={{ limit, offset, completed }}
            />
          );
        },
      },

      createQuickTask: {
        description: "Create a new personal quick task.",
        parameters: createQuickTaskSchema,
        generate: async function* ({ text, completed }) {
          yield <LoadingSkeleton message="Creating quick task..." />;

          // TODO: Call API - const task = await quickTasksRouter.create({ text, completed });
          return (
            <ToolResult
              type="quick-task-created"
              data={{ text, success: true }}
            />
          );
        },
      },

      updateQuickTask: {
        description: "Update a quick task's text or completion status.",
        parameters: updateQuickTaskSchema,
        generate: async function* ({ quickTaskId, text, completed }) {
          yield <LoadingSkeleton message="Updating quick task..." />;

          // TODO: Call API - const task = await quickTasksRouter.update({ id: quickTaskId, text, completed });
          return (
            <ToolResult
              type="quick-task-updated"
              data={{ quickTaskId, text, completed, success: true }}
            />
          );
        },
      },

      toggleQuickTask: {
        description: "Toggle the completion status of a quick task.",
        parameters: toggleQuickTaskSchema,
        generate: async function* ({ quickTaskId }) {
          yield <LoadingSkeleton message="Toggling quick task..." />;

          // TODO: Call API - const task = await quickTasksRouter.toggle({ id: quickTaskId });
          return (
            <ToolResult
              type="quick-task-toggled"
              data={{ quickTaskId, success: true }}
            />
          );
        },
      },

      deleteQuickTask: {
        description: "Delete a quick task.",
        parameters: deleteQuickTaskSchema,
        generate: async function* ({ quickTaskId }) {
          yield <LoadingSkeleton message="Deleting quick task..." />;

          // TODO: Call API - await quickTasksRouter.delete({ id: quickTaskId });
          return (
            <ToolResult
              type="quick-task-deleted"
              data={{ quickTaskId, success: true }}
            />
          );
        },
      },

      // ===========================
      // ANALYTICS TOOLS
      // ===========================
      getDashboardOverview: {
        description:
          "Get overall dashboard statistics and metrics (users, projects, tasks, completion rates, trends). Use for dashboard summaries.",
        parameters: getDashboardOverviewSchema,
        generate: async function* ({ period }) {
          yield <LoadingSkeleton message="Analyzing dashboard data..." />;

          // TODO: Call API - const stats = await analyticsRouter.getDashboardOverview({ period });
          return (
            <ToolResult
              type="dashboard-overview"
              data={{ period }}
            />
          );
        },
      },

      getUserAnalytics: {
        description:
          "Get analytics for a specific user or current user (activity, tasks completed, projects, performance).",
        parameters: getUserAnalyticsSchema,
        generate: async function* ({ userId, period }) {
          yield <LoadingSkeleton message="Calculating user analytics..." />;

          // TODO: Call API - const analytics = await analyticsRouter.getUserAnalytics({ userId, period });
          return (
            <ToolResult
              type="user-analytics"
              data={{ userId, period }}
            />
          );
        },
      },

      getProjectAnalytics: {
        description:
          "Get analytics for a specific project (completion rate, velocity, tasks distribution).",
        parameters: getProjectAnalyticsSchema,
        generate: async function* ({ projectId, period }) {
          yield <LoadingSkeleton message="Analyzing project data..." />;

          // TODO: Call API - const analytics = await analyticsRouter.getProjectAnalytics({ projectId, period });
          return (
            <ToolResult
              type="project-analytics"
              data={{ projectId, period }}
            />
          );
        },
      },

      getTaskDistribution: {
        description:
          "Get task distribution statistics across projects or organization (by status, priority, assignee).",
        parameters: getTaskDistributionSchema,
        generate: async function* ({ projectId, organizationId }) {
          yield <LoadingSkeleton message="Analyzing task distribution..." />;

          // TODO: Call API - const distribution = await analyticsRouter.getTaskDistribution({ projectId, organizationId });
          return (
            <ToolResult
              type="task-distribution"
              data={{ projectId, organizationId }}
            />
          );
        },
      },

      getOverdueTasks: {
        description:
          "Get a list of overdue tasks with filters. Use to identify tasks that need attention.",
        parameters: getOverdueTasksSchema,
        generate: async function* ({ projectId, assigneeId, limit }) {
          yield <LoadingSkeleton message="Finding overdue tasks..." />;

          // TODO: Call API - const tasks = await analyticsRouter.getOverdueTasks({ projectId, assigneeId, limit });
          return (
            <ToolResult
              type="overdue-tasks"
              data={{ projectId, assigneeId, limit }}
            />
          );
        },
      },
    },
  });

  return result.value as any;
}
