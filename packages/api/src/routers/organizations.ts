/**
 * Organizations router - oRPC procedures for organization management
 */

import { eq, ilike, or, and, sql } from "drizzle-orm";
import { z } from "zod";
import { authDb } from "@workspace/db/auth-db";
import * as schema from "@workspace/db/auth-db/schema";
import {
  protectedProcedure,
} from "../middleware/auth.js";
import { paginationSchema, idSchema } from "../schemas/index.js";

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
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    image: z.string().nullable(),
  }).optional(),
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
    const { limit, offset, search } = input;

    // Build where conditions
    const conditions = [];

    // Search filter (name or slug)
    if (search) {
      conditions.push(
        or(
          ilike(schema.organization.name, `%${search}%`),
          ilike(schema.organization.slug, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Execute query with pagination
    const organizations = await authDb
      .select()
      .from(schema.organization)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${schema.organization.createdAt} DESC`);

    // Get total count
    const totalResult = await authDb
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.organization)
      .where(whereClause);

    const total = totalResult[0]?.count ?? 0;

    return {
      organizations,
      total,
    };
  });

// Get organization by ID
export const getById = protectedProcedure
  .input(idSchema)
  .output(organizationSchema.nullable())
  .handler(async ({ input }) => {
    const [org] = await authDb
      .select()
      .from(schema.organization)
      .where(eq(schema.organization.id, input.id));

    return org || null;
  });

// Get organization by slug
export const getBySlug = protectedProcedure
  .input(z.object({ slug: z.string() }))
  .output(organizationSchema.nullable())
  .handler(async ({ input }) => {
    const [org] = await authDb
      .select()
      .from(schema.organization)
      .where(eq(schema.organization.slug, input.slug));

    return org || null;
  });

// Get my organizations (where I'm a member)
export const getMyOrganizations = protectedProcedure
  .input(z.object({ limit: z.number().min(1).max(100).default(20) }))
  .output(z.array(organizationSchema))
  .handler(async ({ context, input }) => {
    const orgs = await authDb
      .select({
        id: schema.organization.id,
        name: schema.organization.name,
        slug: schema.organization.slug,
        logo: schema.organization.logo,
        createdAt: schema.organization.createdAt,
        metadata: schema.organization.metadata,
      })
      .from(schema.organization)
      .innerJoin(
        schema.member,
        eq(schema.member.organizationId, schema.organization.id)
      )
      .where(eq(schema.member.userId, context.user.id))
      .limit(input.limit)
      .orderBy(sql`${schema.organization.createdAt} DESC`);

    return orgs;
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
    const { organizationId, role, limit } = input;

    const conditions = [eq(schema.member.organizationId, organizationId)];
    if (role) {
      conditions.push(eq(schema.member.role, role));
    }

    const members = await authDb
      .select({
        id: schema.member.id,
        organizationId: schema.member.organizationId,
        userId: schema.member.userId,
        role: schema.member.role,
        createdAt: schema.member.createdAt,
        user: {
          id: schema.user.id,
          name: schema.user.name,
          email: schema.user.email,
          image: schema.user.image,
        },
      })
      .from(schema.member)
      .innerJoin(schema.user, eq(schema.user.id, schema.member.userId))
      .where(and(...conditions))
      .limit(limit);

    return members;
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
    const orgId = crypto.randomUUID();

    // Create organization
    const [newOrg] = await authDb
      .insert(schema.organization)
      .values({
        id: orgId,
        name: input.name,
        slug: input.slug,
        logo: input.logo,
        createdAt: new Date(),
        metadata: input.metadata,
      })
      .returning();

    if (!newOrg) {
      throw new Error("Failed to create organization");
    }

    // Add creator as owner
    await authDb.insert(schema.member).values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId: context.user.id,
      role: "owner",
      createdAt: new Date(),
    });

    return newOrg;
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
    const { organizationId, ...updates } = input;

    // Check if user is owner or admin
    const [membership] = await authDb
      .select()
      .from(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, organizationId),
          eq(schema.member.userId, context.user.id)
        )
      );

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("Unauthorized: Only owners and admins can update organization");
    }

    const [updated] = await authDb
      .update(schema.organization)
      .set(updates)
      .where(eq(schema.organization.id, organizationId))
      .returning();

    if (!updated) {
      throw new Error("Organization not found");
    }

    return updated;
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
    // Check if current user is owner or admin
    const [membership] = await authDb
      .select()
      .from(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, input.organizationId),
          eq(schema.member.userId, context.user.id)
        )
      );

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("Unauthorized: Only owners and admins can add members");
    }

    // Add new member
    const [newMember] = await authDb
      .insert(schema.member)
      .values({
        id: crypto.randomUUID(),
        organizationId: input.organizationId,
        userId: input.userId,
        role: input.role,
        createdAt: new Date(),
      })
      .returning();

    if (!newMember) {
      throw new Error("Failed to add member");
    }

    // Fetch user details
    const [user] = await authDb
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, input.userId));

    return {
      ...newMember,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          }
        : undefined,
    };
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
    // Check if current user is owner
    const [membership] = await authDb
      .select()
      .from(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, input.organizationId),
          eq(schema.member.userId, context.user.id)
        )
      );

    if (!membership || membership.role !== "owner") {
      throw new Error("Unauthorized: Only owners can change member roles");
    }

    const [updated] = await authDb
      .update(schema.member)
      .set({ role: input.role })
      .where(
        and(
          eq(schema.member.organizationId, input.organizationId),
          eq(schema.member.userId, input.userId)
        )
      )
      .returning();

    if (!updated) {
      throw new Error("Member not found");
    }

    // Fetch user details
    const [user] = await authDb
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, input.userId));

    return {
      ...updated,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          }
        : undefined,
    };
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
    // Check if current user is owner or admin
    const [membership] = await authDb
      .select()
      .from(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, input.organizationId),
          eq(schema.member.userId, context.user.id)
        )
      );

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("Unauthorized: Only owners and admins can remove members");
    }

    await authDb
      .delete(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, input.organizationId),
          eq(schema.member.userId, input.userId)
        )
      );

    return { success: true };
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
    // Check if current user is owner or admin
    const [membership] = await authDb
      .select()
      .from(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, input.organizationId),
          eq(schema.member.userId, context.user.id)
        )
      );

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("Unauthorized: Only owners and admins can invite members");
    }

    // Create invitation (expires in 7 days)
    const [invitation] = await authDb
      .insert(schema.invitation)
      .values({
        id: crypto.randomUUID(),
        organizationId: input.organizationId,
        email: input.email,
        role: input.role,
        status: "pending",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        inviterId: context.user.id,
      })
      .returning();

    if (!invitation) {
      throw new Error("Failed to create invitation");
    }

    return invitation;
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
    // Check if current user is owner or admin
    const [membership] = await authDb
      .select()
      .from(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, input.organizationId),
          eq(schema.member.userId, context.user.id)
        )
      );

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("Unauthorized: Only owners and admins can view invitations");
    }

    const conditions = [eq(schema.invitation.organizationId, input.organizationId)];
    if (input.status) {
      conditions.push(eq(schema.invitation.status, input.status));
    }

    const invitations = await authDb
      .select()
      .from(schema.invitation)
      .where(and(...conditions));

    return invitations;
  });

// Cancel invitation (admin/owner only)
export const cancelInvitation = protectedProcedure
  .input(z.object({ invitationId: z.string() }))
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    // Get invitation to check organization
    const [invitation] = await authDb
      .select()
      .from(schema.invitation)
      .where(eq(schema.invitation.id, input.invitationId));

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Check if current user is owner or admin
    const [membership] = await authDb
      .select()
      .from(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, invitation.organizationId),
          eq(schema.member.userId, context.user.id)
        )
      );

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("Unauthorized: Only owners and admins can cancel invitations");
    }

    await authDb
      .delete(schema.invitation)
      .where(eq(schema.invitation.id, input.invitationId));

    return { success: true };
  });

// Leave organization
export const leave = protectedProcedure
  .input(z.object({ organizationId: z.string() }))
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    // Check if user is the only owner
    const owners = await authDb
      .select()
      .from(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, input.organizationId),
          eq(schema.member.role, "owner")
        )
      );

    const isOnlyOwner =
      owners.length === 1 && owners[0]?.userId === context.user.id;

    if (isOnlyOwner) {
      throw new Error(
        "Cannot leave: You are the only owner. Transfer ownership or delete the organization."
      );
    }

    await authDb
      .delete(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, input.organizationId),
          eq(schema.member.userId, context.user.id)
        )
      );

    return { success: true };
  });

// Delete organization (owner only)
export const deleteOrganization = protectedProcedure
  .input(z.object({ organizationId: z.string() }))
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    // Check if current user is owner
    const [membership] = await authDb
      .select()
      .from(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, input.organizationId),
          eq(schema.member.userId, context.user.id)
        )
      );

    if (!membership || membership.role !== "owner") {
      throw new Error("Unauthorized: Only owners can delete the organization");
    }

    // Delete organization (cascade will handle members and invitations)
    await authDb
      .delete(schema.organization)
      .where(eq(schema.organization.id, input.organizationId));

    return { success: true };
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
