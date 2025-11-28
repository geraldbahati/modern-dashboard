/**
 * ProjectsGrid - Display projects in a responsive grid
 *
 * @example
 * <ProjectsGrid projects={mockProjects} onProjectClick={(id) => console.log(id)} />
 */

"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { cn } from "@workspace/ui/lib/utils";
import { Folder, Globe, Lock, MoreHorizontal, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

interface Project {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  imageUrl: string | null;
  status: "active" | "archived" | "deleted";
  isPublic: boolean;
  createdAt: Date;
  // Optional stats for display
  progress?: number;
  taskCount?: number;
}

interface ProjectsGridProps {
  /** Array of projects to display */
  projects: Project[];
  /** Total number of projects */
  total?: number;
  /** Callback when a project is clicked */
  onProjectClick?: (projectId: string) => void;
  /** Callback when edit is clicked */
  onEdit?: (projectId: string) => void;
  /** Callback when delete is clicked */
  onDelete?: (projectId: string) => void;
  /** Optional class name */
  className?: string;
}

export function ProjectsGrid({
  projects,
  total,
  onProjectClick,
  onEdit,
  onDelete,
  className,
}: ProjectsGridProps) {
  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "default";
      case "archived":
        return "secondary";
      case "deleted":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
        {total !== undefined && (
          <span className="text-muted-foreground text-sm">
            {total} projects
          </span>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Folder className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
            You haven't created any projects yet. Start by creating a new
            project.
          </p>
          <Button>Create Project</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="group cursor-pointer transition-all hover:shadow-md"
              onClick={() => onProjectClick?.(project.id)}
            >
              <CardHeader className="p-0">
                <div className="relative h-32 w-full overflow-hidden rounded-t-lg bg-muted">
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <Folder className="h-10 w-10 text-muted-foreground/20" />
                    </div>
                  )}
                  <div className="absolute right-2 top-2">
                    <Badge
                      variant={project.isPublic ? "secondary" : "outline"}
                      className="bg-background/80 backdrop-blur-sm"
                    >
                      {project.isPublic ? (
                        <Globe className="mr-1 h-3 w-3" />
                      ) : (
                        <Lock className="mr-1 h-3 w-3" />
                      )}
                      {project.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-start justify-between space-x-4">
                  <div className="space-y-1">
                    <CardTitle className="line-clamp-1 text-base">
                      {project.name}
                    </CardTitle>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {project.description || "No description provided."}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onProjectClick?.(project.id);
                        }}
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(project.id);
                        }}
                      >
                        Edit Project
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(project.id);
                        }}
                      >
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{project.progress || 0}%</span>
                  </div>
                  <Progress value={project.progress || 0} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Badge
                      variant={getStatusColor(project.status)}
                      className="h-5 px-1.5 text-[10px] uppercase"
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
