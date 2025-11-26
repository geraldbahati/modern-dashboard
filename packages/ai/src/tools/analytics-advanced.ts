import { z } from "zod";

/**
 * ===========================
 * ADVANCED ANALYTICS TOOLS
 * ===========================
 */

// Dashboard Overview
export const getDashboardOverviewSchema = z.object({
  period: z
    .enum(["today", "7d", "30d", "90d", "1y", "all"])
    .default("30d")
    .describe("Time period for analytics"),
});

// User Analytics
export const getUserAnalyticsSchema = z.object({
  userId: z.string().optional().describe("Specific user ID (defaults to current user)"),
  period: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
});

export const getUserActivityTimelineSchema = z.object({
  userId: z.string().optional().describe("Specific user ID (defaults to current user)"),
  limit: z.number().min(1).max(100).default(20).describe("Number of activities to return"),
});

// Project Analytics
export const getProjectAnalyticsSchema = z.object({
  projectId: z.string().uuid().describe("The project ID"),
  period: z.enum(["7d", "30d", "90d", "all"]).default("30d"),
});

export const getProjectProgressSchema = z.object({
  projectId: z.string().uuid().describe("The project ID"),
});

export const getProjectVelocitySchema = z.object({
  projectId: z.string().uuid().describe("The project ID"),
  period: z.enum(["7d", "14d", "30d"]).default("14d").describe("Period to calculate velocity"),
});

// Team Analytics
export const getTeamPerformanceSchema = z.object({
  organizationId: z.string().optional().describe("Organization ID (defaults to user's active org)"),
  period: z.enum(["7d", "30d", "90d"]).default("30d"),
});

export const getMemberProductivitySchema = z.object({
  userId: z.string().describe("Team member user ID"),
  period: z.enum(["7d", "30d", "90d"]).default("30d"),
});

// Task Analytics
export const getTaskDistributionSchema = z.object({
  projectId: z.string().uuid().optional().describe("Filter by project ID"),
  organizationId: z.string().optional().describe("Filter by organization ID"),
});

export const getOverdueTasksSchema = z.object({
  projectId: z.string().uuid().optional().describe("Filter by project ID"),
  assigneeId: z.string().optional().describe("Filter by assignee user ID"),
  limit: z.number().min(1).max(100).default(20),
});

export const getTaskCompletionTrendsSchema = z.object({
  projectId: z.string().uuid().optional().describe("Filter by project ID"),
  period: z.enum(["7d", "14d", "30d", "90d"]).default("30d"),
});

// Organization Analytics
export const getOrganizationAnalyticsSchema = z.object({
  organizationId: z.string().describe("The organization ID"),
  period: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
});

export const getOrganizationGrowthSchema = z.object({
  organizationId: z.string().describe("The organization ID"),
  period: z.enum(["30d", "90d", "1y"]).default("90d"),
});

// Comparative Analytics
export const compareProjectsSchema = z.object({
  projectIds: z.array(z.string().uuid()).min(2).max(5).describe("Project IDs to compare"),
  metric: z
    .enum(["completion-rate", "velocity", "active-tasks", "members"])
    .describe("Metric to compare"),
});

export const compareTeamMembersSchema = z.object({
  userIds: z.array(z.string()).min(2).max(10).describe("User IDs to compare"),
  period: z.enum(["7d", "30d", "90d"]).default("30d"),
});

// Custom Reports
export const generateCustomReportSchema = z.object({
  reportType: z
    .enum(["user-activity", "project-summary", "team-performance", "task-analytics"])
    .describe("Type of report to generate"),
  filters: z
    .object({
      dateFrom: z.string().optional().describe("Start date (ISO format)"),
      dateTo: z.string().optional().describe("End date (ISO format)"),
      projectIds: z.array(z.string().uuid()).optional(),
      userIds: z.array(z.string()).optional(),
      organizationId: z.string().optional(),
    })
    .optional()
    .describe("Report filters"),
  format: z.enum(["summary", "detailed"]).default("summary").describe("Report detail level"),
});

// Type exports
export type GetDashboardOverviewInput = z.infer<typeof getDashboardOverviewSchema>;
export type GetUserAnalyticsInput = z.infer<typeof getUserAnalyticsSchema>;
export type GetUserActivityTimelineInput = z.infer<typeof getUserActivityTimelineSchema>;
export type GetProjectAnalyticsInput = z.infer<typeof getProjectAnalyticsSchema>;
export type GetProjectProgressInput = z.infer<typeof getProjectProgressSchema>;
export type GetProjectVelocityInput = z.infer<typeof getProjectVelocitySchema>;
export type GetTeamPerformanceInput = z.infer<typeof getTeamPerformanceSchema>;
export type GetMemberProductivityInput = z.infer<typeof getMemberProductivitySchema>;
export type GetTaskDistributionInput = z.infer<typeof getTaskDistributionSchema>;
export type GetOverdueTasksInput = z.infer<typeof getOverdueTasksSchema>;
export type GetTaskCompletionTrendsInput = z.infer<typeof getTaskCompletionTrendsSchema>;
export type GetOrganizationAnalyticsInput = z.infer<typeof getOrganizationAnalyticsSchema>;
export type GetOrganizationGrowthInput = z.infer<typeof getOrganizationGrowthSchema>;
export type CompareProjectsInput = z.infer<typeof compareProjectsSchema>;
export type CompareTeamMembersInput = z.infer<typeof compareTeamMembersSchema>;
export type GenerateCustomReportInput = z.infer<typeof generateCustomReportSchema>;

/**
 * Analytics data types returned by tools
 */
export interface DashboardOverviewData {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  activeMembers: number;
  completionRate: number;
  trends: {
    users: number; // percentage change
    projects: number;
    tasks: number;
  };
}

export interface UserAnalyticsData {
  tasksCreated: number;
  tasksCompleted: number;
  projectsOwned: number;
  organizationsMember: number;
  activityScore: number;
  completionRate: number;
}

export interface ProjectAnalyticsData {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;
  velocity: number; // tasks completed per week
  averageCompletionTime: number; // hours
  overduePercentage: number;
}

export interface TeamPerformanceData {
  totalMembers: number;
  activeMembers: number;
  totalTasksCompleted: number;
  averageTasksPerMember: number;
  topPerformers: Array<{
    userId: string;
    name: string;
    tasksCompleted: number;
    completionRate: number;
  }>;
}
