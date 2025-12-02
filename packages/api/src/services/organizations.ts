import { eq, ilike, or, and, sql } from "drizzle-orm";
import { authDb } from "@workspace/db/auth-db";
import * as schema from "@workspace/db/auth-db/schema";

export const OrganizationService = {
  /**
   * List organizations with search and pagination
   */
  list: async (input: { limit: number; offset: number; search?: string }) => {
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
  },

  /**
   * Get organization by ID
   */
  getById: async (id: string) => {
    const [org] = await authDb
      .select()
      .from(schema.organization)
      .where(eq(schema.organization.id, id));

    return org || null;
  },

  /**
   * Get organization by slug
   */
  getBySlug: async (slug: string) => {
    const [org] = await authDb
      .select()
      .from(schema.organization)
      .where(eq(schema.organization.slug, slug));

    return org || null;
  },

  /**
   * Get my organizations (where I'm a member)
   */
  getMyOrganizations: async (userId: string, limit: number = 20) => {
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
      .where(eq(schema.member.userId, userId))
      .limit(limit)
      .orderBy(sql`${schema.organization.createdAt} DESC`);

    return orgs;
  },

  /**
   * Get organization members
   */
  getMembers: async (input: {
    organizationId: string;
    role?: "owner" | "admin" | "member";
    limit?: number;
  }) => {
    const { organizationId, role, limit = 20 } = input;

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
  },

  /**
   * Create organization
   */
  create: async (input: {
    name: string;
    slug: string;
    userId: string;
    logo?: string;
    metadata?: string;
  }) => {
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
      userId: input.userId,
      role: "owner",
      createdAt: new Date(),
    });

    return newOrg;
  },

  /**
   * Update organization
   */
  update: async (input: {
    organizationId: string;
    userId: string;
    name?: string;
    slug?: string;
    logo?: string;
    metadata?: string;
  }) => {
    const { organizationId, userId, ...updates } = input;

    // Check if user is owner or admin
    const [membership] = await authDb
      .select()
      .from(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, organizationId),
          eq(schema.member.userId, userId)
        )
      );

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error(
        "Unauthorized: Only owners and admins can update organization"
      );
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
  },

  /**
   * Add member to organization
   */
  addMember: async (input: {
    organizationId: string;
    userId: string; // The user performing the action
    targetUserId: string; // The user being added
    role: "owner" | "admin" | "member";
  }) => {
    // Check if current user is owner or admin
    const [membership] = await authDb
      .select()
      .from(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, input.organizationId),
          eq(schema.member.userId, input.userId)
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
        userId: input.targetUserId,
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
      .where(eq(schema.user.id, input.targetUserId));

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
  },

  /**
   * Update member role
   */
  updateMemberRole: async (input: {
    organizationId: string;
    userId: string; // The user performing the action
    targetUserId: string; // The user whose role is being updated
    role: "owner" | "admin" | "member";
  }) => {
    // Check if current user is owner
    const [membership] = await authDb
      .select()
      .from(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, input.organizationId),
          eq(schema.member.userId, input.userId)
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
          eq(schema.member.userId, input.targetUserId)
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
      .where(eq(schema.user.id, input.targetUserId));

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
  },

  /**
   * Remove member from organization
   */
  removeMember: async (input: {
    organizationId: string;
    userId: string; // The user performing the action
    targetUserId: string; // The user being removed
  }) => {
    // Check if current user is owner or admin
    const [membership] = await authDb
      .select()
      .from(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, input.organizationId),
          eq(schema.member.userId, input.userId)
        )
      );

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error(
        "Unauthorized: Only owners and admins can remove members"
      );
    }

    await authDb
      .delete(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, input.organizationId),
          eq(schema.member.userId, input.targetUserId)
        )
      );

    return { success: true };
  },

  /**
   * Invite member to organization
   */
  inviteMember: async (input: {
    organizationId: string;
    userId: string; // The user performing the action
    email: string;
    role: "admin" | "member";
  }) => {
    // Check if current user is owner or admin
    const [membership] = await authDb
      .select()
      .from(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, input.organizationId),
          eq(schema.member.userId, input.userId)
        )
      );

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error(
        "Unauthorized: Only owners and admins can invite members"
      );
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
        inviterId: input.userId,
      })
      .returning();

    if (!invitation) {
      throw new Error("Failed to create invitation");
    }

    return invitation;
  },

  /**
   * List invitations for an organization
   */
  listInvitations: async (input: {
    organizationId: string;
    userId: string; // The user performing the action
    status?: "pending" | "accepted" | "expired";
  }) => {
    // Check if current user is owner or admin
    const [membership] = await authDb
      .select()
      .from(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, input.organizationId),
          eq(schema.member.userId, input.userId)
        )
      );

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error(
        "Unauthorized: Only owners and admins can view invitations"
      );
    }

    const conditions = [
      eq(schema.invitation.organizationId, input.organizationId),
    ];
    if (input.status) {
      conditions.push(eq(schema.invitation.status, input.status));
    }

    const invitations = await authDb
      .select()
      .from(schema.invitation)
      .where(and(...conditions));

    return invitations;
  },

  /**
   * Cancel invitation
   */
  cancelInvitation: async (input: {
    invitationId: string;
    userId: string; // The user performing the action
  }) => {
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
          eq(schema.member.userId, input.userId)
        )
      );

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error(
        "Unauthorized: Only owners and admins can cancel invitations"
      );
    }

    await authDb
      .delete(schema.invitation)
      .where(eq(schema.invitation.id, input.invitationId));

    return { success: true };
  },

  /**
   * Leave organization
   */
  leave: async (input: { organizationId: string; userId: string }) => {
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
      owners.length === 1 && owners[0]?.userId === input.userId;

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
          eq(schema.member.userId, input.userId)
        )
      );

    return { success: true };
  },

  /**
   * Delete organization
   */
  delete: async (input: { organizationId: string; userId: string }) => {
    // Check if current user is owner
    const [membership] = await authDb
      .select()
      .from(schema.member)
      .where(
        and(
          eq(schema.member.organizationId, input.organizationId),
          eq(schema.member.userId, input.userId)
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
  },
};
