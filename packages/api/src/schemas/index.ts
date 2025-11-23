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

// Export types
export type Pagination = z.infer<typeof paginationSchema>;
export type CursorPagination = z.infer<typeof cursorPaginationSchema>;
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
