"use client";

import { ProjectsGrid } from "@workspace/ui/components/ai-generated/projects-grid";
import { ProjectDetails } from "@workspace/ui/components/ai-generated/project-details";
import type { ToolComponentProps } from "../registry";
import { registerTool } from "../registry";

interface Project {
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

interface ListProjectsResult {
  data: Project[];
  count: number;
}

interface ProjectDetailsResult {
  data: Project;
}

// Transform API project to UI project format
const transformProject = (project: Project) => ({
  id: project.id,
  name: project.name,
  description: project.description,
  slug: project.slug,
  imageUrl: project.imageUrl,
  status: project.status,
  isPublic: project.isPublic,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
});

// Transform API project to detailed UI format
const transformProjectDetails = (project: Project) => ({
  id: project.id,
  name: project.name,
  description: project.description,
  status: project.status,
  visibility: project.isPublic ? ("public" as const) : ("private" as const),
  progress: 0, // Will be calculated from tasks
  startDate: project.createdAt,
  dueDate: null,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
  members: [], // Will be fetched separately if needed
});

export const ListProjectsTool: React.FC<
  ToolComponentProps<ListProjectsResult>
> = ({ tool, result, onAction }) => {
  if (tool.state !== "output-available" || !result) return null;

  return (
    <ProjectsGrid
      projects={(result?.data || []).map(transformProject)}
      total={result?.count}
      onProjectClick={(projectId) => onAction?.("viewDetails", projectId)}
      onEdit={(projectId) => onAction?.("edit", projectId)}
      onDelete={(projectId) => onAction?.("delete", projectId)}
    />
  );
};

export const ProjectDetailsTool: React.FC<
  ToolComponentProps<ProjectDetailsResult>
> = ({ tool, result, onAction }) => {
  if (tool.state !== "output-available" || !result) return null;

  return (
    <ProjectDetails
      project={transformProjectDetails(result?.data)}
      onAction={(action, projectId) => onAction?.(action, projectId)}
    />
  );
};

// Register tools
registerTool("listProjects", ListProjectsTool);
registerTool("getProjectById", ProjectDetailsTool);
registerTool("getProjectBySlug", ProjectDetailsTool);
registerTool("createProject", ProjectDetailsTool);
registerTool("updateProject", ProjectDetailsTool);
registerTool("archiveProject", ProjectDetailsTool);
registerTool("restoreProject", ProjectDetailsTool);
