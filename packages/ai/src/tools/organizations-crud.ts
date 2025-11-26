import { z } from "zod";

/**
 * ===========================
 * ORGANIZATION CRUD TOOLS
 * ===========================
 */

// VIEW/READ Operations
export const listOrganizationsSchema = z.object({
  limit: z.number().min(1).max(100).default(20).describe("Number of organizations to return"),
  offset: z.number().min(0).default(0).describe("Number of organizations to skip"),
  search: z.string().optional().describe("Search by organization name"),
});

export const getOrganizationByIdSchema = z.object({
  organizationId: z.string().describe("The organization ID"),
});

export const getOrganizationBySlugSchema = z.object({
  slug: z.string().describe("The organization slug"),
});

export const getOrganizationMembersSchema = z.object({
  organizationId: z.string().describe("The organization ID"),
  role: z
    .enum(["owner", "admin", "member"])
    .optional()
    .describe("Filter members by role"),
  limit: z.number().min(1).max(100).default(20),
});

export const getOrganizationStatsSchema = z.object({
  organizationId: z.string().describe("The organization ID"),
});

export const getMyOrganizationsSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
});

// CREATE Operations
export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(255).describe("Organization name"),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .describe("URL-friendly organization identifier"),
  logo: z.string().url().optional().describe("Organization logo URL"),
  metadata: z.string().optional().describe("Additional metadata (JSON string)"),
});

// UPDATE Operations
export const updateOrganizationSchema = z.object({
  organizationId: z.string().describe("The organization ID to update"),
  name: z.string().min(1).max(255).optional().describe("Update organization name"),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional()
    .describe("Update organization slug"),
  logo: z.string().url().optional().describe("Update organization logo"),
  metadata: z.string().optional().describe("Update metadata (JSON string)"),
});

// MEMBER MANAGEMENT
export const addMemberSchema = z.object({
  organizationId: z.string().describe("The organization ID"),
  userId: z.string().describe("User ID to add as member"),
  role: z.enum(["owner", "admin", "member"]).default("member").describe("Member role"),
});

export const updateMemberRoleSchema = z.object({
  organizationId: z.string().describe("The organization ID"),
  userId: z.string().describe("User ID of the member"),
  role: z.enum(["owner", "admin", "member"]).describe("New role"),
});

export const removeMemberSchema = z.object({
  organizationId: z.string().describe("The organization ID"),
  userId: z.string().describe("User ID to remove from organization"),
});

// INVITATIONS
export const inviteMemberSchema = z.object({
  organizationId: z.string().describe("The organization ID"),
  email: z.string().email().describe("Email address to invite"),
  role: z.enum(["admin", "member"]).default("member").describe("Role for the invited user"),
});

export const listInvitationsSchema = z.object({
  organizationId: z.string().describe("The organization ID"),
  status: z
    .enum(["pending", "accepted", "expired"])
    .optional()
    .describe("Filter by invitation status"),
});

export const cancelInvitationSchema = z.object({
  invitationId: z.string().describe("The invitation ID to cancel"),
});

// DELETE Operations
export const deleteOrganizationSchema = z.object({
  organizationId: z.string().describe("The organization ID to delete"),
});

export const leaveOrganizationSchema = z.object({
  organizationId: z.string().describe("The organization ID to leave"),
});

// Type exports
export type ListOrganizationsInput = z.infer<typeof listOrganizationsSchema>;
export type GetOrganizationByIdInput = z.infer<typeof getOrganizationByIdSchema>;
export type GetOrganizationBySlugInput = z.infer<typeof getOrganizationBySlugSchema>;
export type GetOrganizationMembersInput = z.infer<typeof getOrganizationMembersSchema>;
export type GetOrganizationStatsInput = z.infer<typeof getOrganizationStatsSchema>;
export type GetMyOrganizationsInput = z.infer<typeof getMyOrganizationsSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type ListInvitationsInput = z.infer<typeof listInvitationsSchema>;
export type CancelInvitationInput = z.infer<typeof cancelInvitationSchema>;
export type DeleteOrganizationInput = z.infer<typeof deleteOrganizationSchema>;
export type LeaveOrganizationInput = z.infer<typeof leaveOrganizationSchema>;

/**
 * Organization data types returned by tools
 */
export interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  createdAt: Date;
  metadata: string | null;
}

export interface OrganizationMemberData {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date;
  user: {
    name: string;
    email: string;
    image: string | null;
  };
}

export interface OrganizationStatsData {
  totalMembers: number;
  totalProjects: number;
  totalTasks: number;
  activeMembers: number;
}

export interface InvitationData {
  id: string;
  organizationId: string;
  email: string;
  role: string | null;
  status: string;
  expiresAt: Date;
  inviterId: string;
}
