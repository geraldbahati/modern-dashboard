/**
 * Shared Zod schemas for oRPC procedures
 * Used for validation and type inference
 */

import { z } from "zod";

// Pagination schemas
export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
});

export const cursorPaginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  cursor: z.string().optional(),
});

// User schemas
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "moderator", "editor", "user"]).default("user"),
});

export const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "moderator", "editor", "user"]).optional(),
});

// ID schema
export const idSchema = z.object({
  id: z.string(),
});

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1).max(255),
  ...paginationSchema.shape,
});

// Project schemas
export const projectStatusEnum = z.enum(["active", "archived", "deleted"]);

export const projectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  imageUrl: z.string().nullable(),
  ownerId: z.string(),
  status: projectStatusEnum,
  isPublic: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  imageUrl: z.string().url().optional(),
  isPublic: z.boolean().default(false),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().nullable().optional(),
  status: projectStatusEnum.optional(),
  isPublic: z.boolean().optional(),
});

// Dashboard metrics schemas
export const metricTrendEnum = z.enum(["up", "down", "neutral"]);

export const metricItemSchema = z.object({
  label: z.string(),
  value: z.number(),
  unit: z.string().optional(),
  change: z.number(),
  trend: metricTrendEnum,
  period: z.string(),
});

export const dashboardMetricsSchema = z.object({
  activeUsers: metricItemSchema,
  avgResponseTime: metricItemSchema,
  taskCompletion: metricItemSchema,
  totalProjects: metricItemSchema,
});

// Quick Task schemas
export const quickTaskSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  ownerId: z.string(),
  completed: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createQuickTaskSchema = z.object({
  text: z.string().min(1).max(500),
});

export const updateQuickTaskSchema = z.object({
  text: z.string().min(1).max(500).optional(),
  completed: z.boolean().optional(),
});

// Export types
export type Pagination = z.infer<typeof paginationSchema>;
export type CursorPagination = z.infer<typeof cursorPaginationSchema>;
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type Project = z.infer<typeof projectSchema>;
export type CreateProject = z.infer<typeof createProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type MetricTrend = z.infer<typeof metricTrendEnum>;
export type MetricItem = z.infer<typeof metricItemSchema>;
export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>;
export type QuickTask = z.infer<typeof quickTaskSchema>;
export type CreateQuickTask = z.infer<typeof createQuickTaskSchema>;
export type UpdateQuickTask = z.infer<typeof updateQuickTaskSchema>;
