"use client";

import { DashboardOverview } from "@workspace/ui/components/ai-generated/dashboard-overview";
import { UserAnalytics } from "@workspace/ui/components/ai-generated/user-analytics";
import { ProjectStats } from "@workspace/ui/components/ai-generated/project-stats";
import { ResourceAllocation } from "@workspace/ui/components/ai-generated/resource-allocation";
import { PredictiveAnalytics } from "@workspace/ui/components/ai-generated/predictive-analytics";
import type { ToolComponentProps } from "../registry";
import { registerTool } from "../registry";
import type {
  ResourceAllocationData,
  PredictiveAnalyticsData,
  UserAnalyticsDetailedData,
} from "@workspace/ai/tools";

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
  if (tool.state !== "output-available" || !result || !result.data) return null;

  const data = result.data;

  // Add default values for safety
  const totalUsers = data.totalUsers ?? 0;
  const totalProjects = data.totalProjects ?? 0;
  const totalTasks = data.totalTasks ?? 0;
  const completedTasks = data.completedTasks ?? 0;
  const activeMembers = data.activeMembers ?? 0;
  const completionRate = data.completionRate ?? 0;
  const trends = data.trends ?? { users: 0, projects: 0, tasks: 0 };

  // Transform to DashboardOverview component format
  const stats = {
    totalUsers,
    totalProjects,
    totalTasks,
    completedTasks,
    activeMembers,
    completionRate,
    trends,
  };

  return <DashboardOverview stats={stats} />;
};

// User Analytics Tool (simple format - generates mock chart data)
export const UserAnalyticsTool: React.FC<
  ToolComponentProps<UserAnalyticsResult>
> = ({ tool, result }) => {
  if (tool.state !== "output-available" || !result || !result.data) return null;

  const data = result.data;

  // Generate mock chart data for simple analytics format
  const now = new Date();
  const activity = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!,
    tasks: Math.floor(Math.random() * 5),
  }));

  const taskDistribution = [
    { name: "Todo", value: Math.floor((data.tasksCreated - data.tasksCompleted) * 0.4), color: "hsl(var(--muted-foreground))" },
    { name: "In Progress", value: Math.floor((data.tasksCreated - data.tasksCompleted) * 0.6), color: "hsl(var(--blue-500))" },
    { name: "Done", value: data.tasksCompleted, color: "hsl(var(--green-500))" },
  ];

  const performance = Array.from({ length: 4 }, (_, i) => ({
    week: `Week ${i + 1}`,
    completed: Math.floor(data.tasksCompleted / 4) + Math.floor(Math.random() * 3),
    assigned: Math.floor(data.tasksCreated / 4) + Math.floor(Math.random() * 3),
  }));

  const stats = {
    activity,
    taskDistribution,
    performance,
    metrics: {
      totalTasks: data.tasksCreated,
      completionRate: data.completionRate,
      avgCompletionTime: 24, // Mock data
      efficiency: Math.max(70, data.completionRate), // Mock data based on completion rate
    },
  };

  return <UserAnalytics stats={stats} />;
};

// Project Analytics Tool
export const ProjectAnalyticsTool: React.FC<
  ToolComponentProps<ProjectAnalyticsResult>
> = ({ tool, result }) => {
  if (tool.state !== "output-available" || !result || !result.data) return null;

  const data = result.data;

  const stats = {
    totalTasks: data.totalTasks ?? 0,
    completedTasks: data.completedTasks ?? 0,
    inProgressTasks: data.inProgressTasks ?? 0,
    todoTasks: data.todoTasks ?? 0,
    completionRate: data.completionRate ?? 0,
    velocity: data.velocity ?? 0,
    averageCompletionTime: data.averageCompletionTime ?? 0,
    overduePercentage: data.overduePercentage ?? 0,
  };

  return <ProjectStats stats={stats} />;
};

// Dashboard Metrics Tool (different from Overview)
export const DashboardMetricsTool: React.FC<
  ToolComponentProps<DashboardMetricsResult>
> = ({ tool, result }) => {
  if (tool.state !== "output-available" || !result || !result.data) return null;

  const data = result.data;

  // Convert metrics to stats format for DashboardOverview
  const stats = {
    totalUsers: data.activeUsers?.value ?? 0,
    totalProjects: data.totalProjects?.value ?? 0,
    totalTasks: 0, // Not provided in metrics
    completedTasks: 0, // Not provided in metrics
    activeMembers: data.activeUsers?.value ?? 0,
    completionRate: data.taskCompletion?.value ?? 0,
    trends: {
      users: data.activeUsers?.change ?? 0,
      projects: data.totalProjects?.change ?? 0,
      tasks: data.taskCompletion?.change ?? 0,
    },
  };

  return <DashboardOverview stats={stats} />;
};

// Task Distribution Tool
export const TaskDistributionTool: React.FC<
  ToolComponentProps<{ data: { todo: number; inProgress: number; done: number; byPriority: { low: number; medium: number; high: number } } }>
> = ({ tool, result }) => {
  if (tool.state !== "output-available" || !result || !result.data) return null;

  const data = result.data;
  const total = (data.todo ?? 0) + (data.inProgress ?? 0) + (data.done ?? 0);

  // Display as simple stats
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-lg font-semibold mb-4">Task Distribution</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">By Status</p>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">To Do:</span>
                <span className="font-medium">{data.todo ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">In Progress:</span>
                <span className="font-medium">{data.inProgress ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Done:</span>
                <span className="font-medium">{data.done ?? 0}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium">Total:</span>
                <span className="font-bold">{total}</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">By Priority</p>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">High:</span>
                <span className="font-medium text-destructive">{data.byPriority?.high ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Medium:</span>
                <span className="font-medium text-yellow-500">{data.byPriority?.medium ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Low:</span>
                <span className="font-medium text-muted-foreground">{data.byPriority?.low ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Insights Result Interface
interface InsightsResult {
  data: {
    performance: {
      overallScore: number;
      taskCompletion: {
        value: number;
        trend: "up" | "down" | "neutral";
        status: "good" | "warning" | "critical";
      };
      userEngagement: {
        value: number;
        trend: "up" | "down" | "neutral";
        status: "good" | "warning" | "critical";
      };
      responseTime: {
        value: number;
        trend: "up" | "down" | "neutral";
        status: "good" | "warning" | "critical";
      };
    };
    trends: {
      overallScore: number;
      userGrowth: {
        value: number;
        trend: "up" | "down" | "neutral";
      };
      engagementRate: {
        value: number;
        trend: "up" | "down" | "neutral";
      };
      retention: {
        value: number;
        trend: "up" | "down" | "neutral";
      };
    };
  };
}

// Insights Tool
export const InsightsTool: React.FC<ToolComponentProps<InsightsResult>> = ({ tool, result }) => {
  if (tool.state !== "output-available" || !result || !result.data) return null;

  const { performance, trends } = result.data;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-destructive";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/10";
    if (score >= 60) return "bg-yellow-500/10";
    return "bg-destructive/10";
  };

  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    if (trend === "up") return "↑";
    if (trend === "down") return "↓";
    return "→";
  };

  const getTrendColor = (trend: "up" | "down" | "neutral") => {
    if (trend === "up") return "text-green-500";
    if (trend === "down") return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      {/* Performance Section */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Performance Insights</h3>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getScoreBg(performance?.overallScore ?? 0)}`}>
            <span className={`text-2xl font-bold ${getScoreColor(performance?.overallScore ?? 0)}`}>
              {performance?.overallScore ?? 0}
            </span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Task Completion</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{performance?.taskCompletion?.value ?? 0}%</span>
              <span className={getTrendColor(performance?.taskCompletion?.trend ?? "neutral")}>
                {getTrendIcon(performance?.taskCompletion?.trend ?? "neutral")}
              </span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              performance?.taskCompletion?.status === "good" ? "bg-green-500/10 text-green-500" :
              performance?.taskCompletion?.status === "warning" ? "bg-yellow-500/10 text-yellow-500" :
              "bg-destructive/10 text-destructive"
            }`}>
              {performance?.taskCompletion?.status ?? "unknown"}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">User Engagement</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{performance?.userEngagement?.value ?? 0}%</span>
              <span className={getTrendColor(performance?.userEngagement?.trend ?? "neutral")}>
                {getTrendIcon(performance?.userEngagement?.trend ?? "neutral")}
              </span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              performance?.userEngagement?.status === "good" ? "bg-green-500/10 text-green-500" :
              performance?.userEngagement?.status === "warning" ? "bg-yellow-500/10 text-yellow-500" :
              "bg-destructive/10 text-destructive"
            }`}>
              {performance?.userEngagement?.status ?? "unknown"}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg Response Time</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{performance?.responseTime?.value ?? 0}h</span>
              <span className={getTrendColor(performance?.responseTime?.trend ?? "neutral")}>
                {getTrendIcon(performance?.responseTime?.trend ?? "neutral")}
              </span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              performance?.responseTime?.status === "good" ? "bg-green-500/10 text-green-500" :
              performance?.responseTime?.status === "warning" ? "bg-yellow-500/10 text-yellow-500" :
              "bg-destructive/10 text-destructive"
            }`}>
              {performance?.responseTime?.status ?? "unknown"}
            </span>
          </div>
        </div>
      </div>

      {/* Trends Section */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Growth Trends</h3>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getScoreBg(trends?.overallScore ?? 0)}`}>
            <span className={`text-2xl font-bold ${getScoreColor(trends?.overallScore ?? 0)}`}>
              {trends?.overallScore ?? 0}
            </span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">User Growth</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{trends?.userGrowth?.value ?? 0}%</span>
              <span className={getTrendColor(trends?.userGrowth?.trend ?? "neutral")}>
                {getTrendIcon(trends?.userGrowth?.trend ?? "neutral")}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Engagement Rate</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{trends?.engagementRate?.value ?? 0}%</span>
              <span className={getTrendColor(trends?.engagementRate?.trend ?? "neutral")}>
                {getTrendIcon(trends?.engagementRate?.trend ?? "neutral")}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Retention</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{trends?.retention?.value ?? 0}%</span>
              <span className={getTrendColor(trends?.retention?.trend ?? "neutral")}>
                {getTrendIcon(trends?.retention?.trend ?? "neutral")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Resource Allocation Tool
export const ResourceAllocationTool: React.FC<ToolComponentProps<{ data: ResourceAllocationData }>> = ({ tool, result }) => {
  if (tool.state !== "output-available" || !result || !result.data) return null;

  return <ResourceAllocation data={result.data} />;
};

// Predictive Analytics Tool
export const PredictiveAnalyticsTool: React.FC<ToolComponentProps<{ data: PredictiveAnalyticsData }>> = ({ tool, result }) => {
  if (tool.state !== "output-available" || !result || !result.data) return null;

  return <PredictiveAnalytics data={result.data} />;
};

// Detailed User Analytics Tool (with full chart data)
export const UserAnalyticsDetailedTool: React.FC<ToolComponentProps<{ data: UserAnalyticsDetailedData }>> = ({ tool, result }) => {
  if (tool.state !== "output-available" || !result || !result.data) return null;

  return <UserAnalytics stats={result.data} />;
};

// Register analytics tools
registerTool("getDashboardOverview", DashboardOverviewTool);
registerTool("getDashboardMetrics", DashboardMetricsTool);
registerTool("getUserAnalytics", UserAnalyticsTool);
registerTool("getProjectAnalytics", ProjectAnalyticsTool);
registerTool("getTaskDistribution", TaskDistributionTool);
registerTool("getInsights", InsightsTool);
registerTool("getResourceAllocation", ResourceAllocationTool);
registerTool("getPredictiveAnalytics", PredictiveAnalyticsTool);
registerTool("getUserAnalyticsDetailed", UserAnalyticsDetailedTool);
