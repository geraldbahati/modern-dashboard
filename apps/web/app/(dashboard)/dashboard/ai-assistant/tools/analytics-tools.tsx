"use client";

import { DashboardOverview } from "@workspace/ui/components/ai-generated/dashboard-overview";
import { UserAnalytics } from "@workspace/ui/components/ai-generated/user-analytics";
import { ProjectStats } from "@workspace/ui/components/ai-generated/project-stats";
import type { ToolComponentProps } from "../registry";
import { registerTool } from "../registry";

// Dashboard Overview Result
interface DashboardOverviewResult {
  data: {
    totalUsers: number;
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    activeMembers: number;
    completionRate: number;
    trends: {
      users: number;
      projects: number;
      tasks: number;
    };
  };
}

// Dashboard Metrics Result
interface DashboardMetricsResult {
  data: {
    activeUsers: {
      label: string;
      value: number;
      change: number;
      trend: "up" | "down" | "neutral";
      period: string;
    };
    avgResponseTime: {
      label: string;
      value: number;
      unit: string;
      change: number;
      trend: "up" | "down" | "neutral";
      period: string;
    };
    taskCompletion: {
      label: string;
      value: number;
      unit: string;
      change: number;
      trend: "up" | "down" | "neutral";
      period: string;
    };
    totalProjects: {
      label: string;
      value: number;
      change: number;
      trend: "up" | "down" | "neutral";
      period: string;
    };
  };
}

// User Analytics Result
interface UserAnalyticsResult {
  data: {
    tasksCreated: number;
    tasksCompleted: number;
    projectsOwned: number;
    organizationsMember: number;
    activityScore: number;
    completionRate: number;
  };
}

// Project Analytics Result
interface ProjectAnalyticsResult {
  data: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    completionRate: number;
    velocity: number;
    averageCompletionTime: number;
    overduePercentage: number;
  };
}

// Dashboard Overview Tool
export const DashboardOverviewTool: React.FC<
  ToolComponentProps<DashboardOverviewResult>
> = ({ tool, result }) => {
  if (tool.state !== "output-available" || !result) return null;

  const data = result.data;

  // Transform to DashboardOverview component format
  const metrics = [
    {
      title: "Total Users",
      value: data.totalUsers.toString(),
      description: `${data.trends.users > 0 ? "+" : ""}${data.trends.users}% from last period`,
      trend: data.trends.users > 0 ? ("up" as const) : ("down" as const),
    },
    {
      title: "Total Projects",
      value: data.totalProjects.toString(),
      description: `${data.trends.projects > 0 ? "+" : ""}${data.trends.projects}% from last period`,
      trend: data.trends.projects > 0 ? ("up" as const) : ("down" as const),
    },
    {
      title: "Tasks Completed",
      value: `${data.completedTasks}/${data.totalTasks}`,
      description: `${data.completionRate}% completion rate`,
      trend: "neutral" as const,
    },
    {
      title: "Active Members",
      value: data.activeMembers.toString(),
      description: "Last 7 days",
      trend: "neutral" as const,
    },
  ];

  return <DashboardOverview metrics={metrics} />;
};

// User Analytics Tool
export const UserAnalyticsTool: React.FC<
  ToolComponentProps<UserAnalyticsResult>
> = ({ tool, result }) => {
  if (tool.state !== "output-available" || !result) return null;

  const data = result.data;

  const analyticsData = {
    tasksCompleted: data.tasksCompleted,
    tasksCreated: data.tasksCreated,
    projectsOwned: data.projectsOwned,
    completionRate: data.completionRate,
    activityScore: data.activityScore,
    organizationsMember: data.organizationsMember,
  };

  return <UserAnalytics analytics={analyticsData} />;
};

// Project Analytics Tool
export const ProjectAnalyticsTool: React.FC<
  ToolComponentProps<ProjectAnalyticsResult>
> = ({ tool, result }) => {
  if (tool.state !== "output-available" || !result) return null;

  const data = result.data;

  const stats = {
    totalTasks: data.totalTasks,
    completedTasks: data.completedTasks,
    inProgressTasks: data.inProgressTasks,
    todoTasks: data.todoTasks,
    completionRate: data.completionRate,
    velocity: data.velocity,
    averageCompletionTime: data.averageCompletionTime,
    overduePercentage: data.overduePercentage,
  };

  return <ProjectStats stats={stats} />;
};

// Register analytics tools
registerTool("getDashboardOverview", DashboardOverviewTool);
registerTool("getDashboardMetrics", DashboardOverviewTool);
registerTool("getUserAnalytics", UserAnalyticsTool);
registerTool("getProjectAnalytics", ProjectAnalyticsTool);
registerTool("getTaskDistribution", DashboardOverviewTool);
registerTool("getInsights", DashboardOverviewTool);
