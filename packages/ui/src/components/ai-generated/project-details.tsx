/**
 * ProjectDetails - Comprehensive project view
 *
 * @example
 * <ProjectDetails project={mockProject} stats={mockStats} onAction={handleAction} />
 */

"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@workspace/ui/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import {
  Calendar,
  MoreHorizontal,
  Folder,
  Globe,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Edit,
  Archive,
  Trash2,
  ListTodo,
} from "lucide-react";

interface ProjectMember {
  id: string;
  name: string;
  image: string | null;
  role: string;
}

interface ProjectDetailsProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: "active" | "archived" | "deleted";
    visibility: "public" | "private";
    progress: number;
    startDate: Date;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    members: ProjectMember[];
  };
  stats?: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    daysLeft: number | null;
  };
  onAction?: (action: "edit" | "archive" | "delete", projectId: string) => void;
  className?: string;
}

export function ProjectDetails({
  project,
  stats,
  onAction,
  className,
}: ProjectDetailsProps) {
  const getStatusColor = (status: string) => {
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

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-primary";
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{project.name}</h2>
                  <Badge variant={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  {project.visibility === "private" ? (
                    <Badge variant="outline" className="gap-1">
                      <Lock className="h-3 w-3" /> Private
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <Globe className="h-3 w-3" /> Public
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground max-w-2xl">
                  {project.description || "No description provided."}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAction?.("edit", project.id)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAction?.("archive", project.id)}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {project.status === "archived" ? "Unarchive" : "Archive"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onAction?.("delete", project.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Started {new Date(project.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {project.dueDate
                    ? `Due ${new Date(project.dueDate).toLocaleDateString()}`
                    : "No due date"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                <span>Project ID: {project.id.slice(0, 8)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span className="text-muted-foreground">
                  {project.progress}%
                </span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats.overdueTasks}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Time Remaining
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.daysLeft !== null ? `${stats.daysLeft} days` : "-"}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Team Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {project.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <Avatar>
                  <AvatarImage src={member.image || undefined} />
                  <AvatarFallback>
                    {member.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{member.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
            <Button variant="outline" className="h-auto py-4 border-dashed">
              <Users className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
