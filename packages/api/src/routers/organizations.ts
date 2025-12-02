/**
 * Organizations router - oRPC procedures for organization management
 */

import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { protectedProcedure } from "../middleware/auth.js";
import { paginationSchema, idSchema } from "../schemas/index.js";
import { OrganizationService } from "../services/organizations";

// Enhanced list schema with search
const listOrganizationsSchema = paginationSchema.extend({
  search: z.string().optional(),
});

// Organization schema for output
const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable(),
  createdAt: z.date(),
  metadata: z.string().nullable(),
});

// Member schema with user details
const memberSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  role: z.string(),
  createdAt: z.date(),
  user: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      image: z.string().nullable(),
    })
    .optional(),
});

// Invitation schema
const invitationSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  email: z.string(),
  role: z.string().nullable(),
  status: z.string(),
  expiresAt: z.date(),
  inviterId: z.string(),
});

// List all organizations (protected - any logged in user can view)
export const list = protectedProcedure
  .input(listOrganizationsSchema)
  .output(
    z.object({
      organizations: z.array(organizationSchema),
      total: z.number(),
    })
  )
  .handler(async ({ input }) => {
    return OrganizationService.list(input);
  });

// Get organization by ID
export const getById = protectedProcedure
  .input(idSchema)
  .output(organizationSchema.nullable())
  .handler(async ({ input }) => {
    return OrganizationService.getById(input.id);
  });

// Get organization by slug
export const getBySlug = protectedProcedure
  .input(z.object({ slug: z.string() }))
  .output(organizationSchema.nullable())
  .handler(async ({ input }) => {
    return OrganizationService.getBySlug(input.slug);
  });

// Get my organizations (where I'm a member)
export const getMyOrganizations = protectedProcedure
  .input(z.object({ limit: z.number().min(1).max(100).default(20) }))
  .output(z.array(organizationSchema))
  .handler(async ({ context, input }) => {
    return OrganizationService.getMyOrganizations(context.user.id, input.limit);
  });

// Get organization members
export const getMembers = protectedProcedure
  .input(
    z.object({
      organizationId: z.string(),
      role: z.enum(["owner", "admin", "member"]).optional(),
      limit: z.number().min(1).max(100).default(20),
    })
  )
  .output(z.array(memberSchema))
  .handler(async ({ input }) => {
    return OrganizationService.getMembers(input);
  });

// Create organization (protected - any user can create)
export const create = protectedProcedure
  .input(
    z.object({
      name: z.string().min(1).max(255),
      slug: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-]+$/),
      logo: z.string().url().optional(),
      metadata: z.string().optional(),
    })
  )
  .output(organizationSchema)
  .handler(async ({ input, context }) => {
    try {
      return await OrganizationService.create({
        ...input,
        userId: context.user.id,
      });
    } catch (error) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create organization",
      });
    }
  });

// Update organization (admin/owner only)
export const update = protectedProcedure
  .input(
    z.object({
      organizationId: z.string(),
      name: z.string().min(1).max(255).optional(),
      slug: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9-]+$/)
        .optional(),
      logo: z.string().url().optional(),
      metadata: z.string().optional(),
    })
  )
  .output(organizationSchema)
  .handler(async ({ input, context }) => {
    try {
      return await OrganizationService.update({
        ...input,
        userId: context.user.id,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        throw new ORPCError("UNAUTHORIZED", { message: error.message });
      }
      if (
        error instanceof Error &&
        error.message === "Organization not found"
      ) {
        throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update organization",
      });
    }
  });

// Add member to organization (admin/owner only)
export const addMember = protectedProcedure
  .input(
    z.object({
      organizationId: z.string(),
      userId: z.string(),
      role: z.enum(["owner", "admin", "member"]).default("member"),
    })
  )
  .output(memberSchema)
  .handler(async ({ input, context }) => {
    try {
      return await OrganizationService.addMember({
        organizationId: input.organizationId,
        targetUserId: input.userId,
        role: input.role,
        userId: context.user.id,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        throw new ORPCError("UNAUTHORIZED", { message: error.message });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to add member",
      });
    }
  });

// Update member role (owner only)
export const updateMemberRole = protectedProcedure
  .input(
    z.object({
      organizationId: z.string(),
      userId: z.string(),
      role: z.enum(["owner", "admin", "member"]),
    })
  )
  .output(memberSchema)
  .handler(async ({ input, context }) => {
    try {
      return await OrganizationService.updateMemberRole({
        organizationId: input.organizationId,
        targetUserId: input.userId,
        role: input.role,
        userId: context.user.id,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        throw new ORPCError("UNAUTHORIZED", { message: error.message });
      }
      if (error instanceof Error && error.message === "Member not found") {
        throw new ORPCError("NOT_FOUND", { message: "Member not found" });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update member role",
      });
    }
  });

// Remove member from organization (admin/owner only)
export const removeMember = protectedProcedure
  .input(
    z.object({
      organizationId: z.string(),
      userId: z.string(),
    })
  )
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    try {
      return await OrganizationService.removeMember({
        organizationId: input.organizationId,
        targetUserId: input.userId,
        userId: context.user.id,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        throw new ORPCError("UNAUTHORIZED", { message: error.message });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to remove member",
      });
    }
  });

// Invite member to organization (admin/owner only)
export const inviteMember = protectedProcedure
  .input(
    z.object({
      organizationId: z.string(),
      email: z.string().email(),
      role: z.enum(["admin", "member"]).default("member"),
    })
  )
  .output(invitationSchema)
  .handler(async ({ input, context }) => {
    try {
      return await OrganizationService.inviteMember({
        organizationId: input.organizationId,
        email: input.email,
        role: input.role,
        userId: context.user.id,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        throw new ORPCError("UNAUTHORIZED", { message: error.message });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to invite member",
      });
    }
  });

// List invitations for an organization (admin/owner only)
export const listInvitations = protectedProcedure
  .input(
    z.object({
      organizationId: z.string(),
      status: z.enum(["pending", "accepted", "expired"]).optional(),
    })
  )
  .output(z.array(invitationSchema))
  .handler(async ({ input, context }) => {
    try {
      return await OrganizationService.listInvitations({
        organizationId: input.organizationId,
        status: input.status,
        userId: context.user.id,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        throw new ORPCError("UNAUTHORIZED", { message: error.message });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to list invitations",
      });
    }
  });

// Cancel invitation (admin/owner only)
export const cancelInvitation = protectedProcedure
  .input(z.object({ invitationId: z.string() }))
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    try {
      return await OrganizationService.cancelInvitation({
        invitationId: input.invitationId,
        userId: context.user.id,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        throw new ORPCError("UNAUTHORIZED", { message: error.message });
      }
      if (error instanceof Error && error.message === "Invitation not found") {
        throw new ORPCError("NOT_FOUND", { message: "Invitation not found" });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to cancel invitation",
      });
    }
  });

// Leave organization
export const leave = protectedProcedure
  .input(z.object({ organizationId: z.string() }))
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    try {
      return await OrganizationService.leave({
        organizationId: input.organizationId,
        userId: context.user.id,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Cannot leave")) {
        throw new ORPCError("BAD_REQUEST", { message: error.message });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to leave organization",
      });
    }
  });

// Delete organization (owner only)
export const deleteOrganization = protectedProcedure
  .input(z.object({ organizationId: z.string() }))
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    try {
      return await OrganizationService.delete({
        organizationId: input.organizationId,
        userId: context.user.id,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Unauthorized")) {
        throw new ORPCError("UNAUTHORIZED", { message: error.message });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to delete organization",
      });
    }
  });

// Organizations router
export const organizationsRouter = {
  list,
  getById,
  getBySlug,
  getMyOrganizations,
  getMembers,
  create,
  update,
  addMember,
  updateMemberRole,
  removeMember,
  inviteMember,
  listInvitations,
  cancelInvitation,
  leave,
  delete: deleteOrganization,
};
