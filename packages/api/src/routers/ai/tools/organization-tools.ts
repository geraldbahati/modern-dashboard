import { tool } from "ai";
import {
  listOrganizationsSchema,
  getOrganizationByIdSchema,
  getOrganizationBySlugSchema,
  getOrganizationMembersSchema,
  createOrganizationSchema,
  updateOrganizationSchema,
  addMemberSchema,
  updateMemberRoleSchema,
  removeMemberSchema,
  inviteMemberSchema,
  listInvitationsSchema,
  cancelInvitationSchema,
  deleteOrganizationSchema,
  leaveOrganizationSchema,
  getMyOrganizationsSchema,
} from "@workspace/ai/tools";
import { OrganizationService } from "../../../services/organizations";

export const createOrganizationTools = (userId: string) => {
  // Helper to serialize dates for AI SDK
  const serializeOrganization = (org: any) => ({
    ...org,
    createdAt:
      org.createdAt instanceof Date
        ? org.createdAt.toISOString()
        : org.createdAt,
    updatedAt:
      org.updatedAt instanceof Date
        ? org.updatedAt.toISOString()
        : org.updatedAt,
  });

  const serializeMember = (member: any) => ({
    ...member,
    joinedAt:
      member.joinedAt instanceof Date
        ? member.joinedAt.toISOString()
        : member.joinedAt,
    createdAt:
      member.createdAt instanceof Date
        ? member.createdAt.toISOString()
        : member.createdAt,
  });

  const serializeInvitation = (invitation: any) => ({
    ...invitation,
    expiresAt:
      invitation.expiresAt instanceof Date
        ? invitation.expiresAt.toISOString()
        : invitation.expiresAt,
    createdAt:
      invitation.createdAt instanceof Date
        ? invitation.createdAt.toISOString()
        : invitation.createdAt,
  });

  return {
    // LIST ORGANIZATIONS
    listOrganizations: tool({
      description:
        "List and search organizations. Use this to show all organizations or search by name/slug.",
      inputSchema: listOrganizationsSchema,
      execute: async (params) => {
        try {
          const result = await OrganizationService.list(params);
          return {
            success: true,
            data: result.organizations.map(serializeOrganization),
            count: result.total,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch organizations",
          };
        }
      },
    }),

    // GET MY ORGANIZATIONS
    getMyOrganizations: tool({
      description:
        "Get organizations where the current user is a member. Use this to show the user's organizations.",
      inputSchema: getMyOrganizationsSchema,
      execute: async (params) => {
        try {
          const organizations = await OrganizationService.getMyOrganizations(
            userId,
            params.limit
          );
          return {
            success: true,
            data: organizations.map(serializeOrganization),
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch user organizations",
          };
        }
      },
    }),

    // GET ORGANIZATION BY ID
    getOrganizationById: tool({
      description:
        "Get detailed information about a specific organization by its ID.",
      inputSchema: getOrganizationByIdSchema,
      execute: async (params) => {
        try {
          const organization = await OrganizationService.getById(
            params.organizationId
          );
          return {
            success: true,
            data: serializeOrganization(organization),
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch organization",
          };
        }
      },
    }),

    // GET ORGANIZATION BY SLUG
    getOrganizationBySlug: tool({
      description:
        "Get detailed information about a specific organization by its slug.",
      inputSchema: getOrganizationBySlugSchema,
      execute: async (params) => {
        try {
          const organization = await OrganizationService.getBySlug(params.slug);
          return {
            success: true,
            data: serializeOrganization(organization),
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch organization",
          };
        }
      },
    }),

    // GET ORGANIZATION MEMBERS
    getOrganizationMembers: tool({
      description:
        "Get members of an organization. Optionally filter by role (owner, admin, member).",
      inputSchema: getOrganizationMembersSchema,
      execute: async (params) => {
        try {
          const members = await OrganizationService.getMembers(params);
          return {
            success: true,
            data: members.map(serializeMember),
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch organization members",
          };
        }
      },
    }),

    // CREATE ORGANIZATION
    createOrganization: tool({
      description:
        "Create a new organization. The creator automatically becomes the owner.",
      inputSchema: createOrganizationSchema,
      execute: async (params) => {
        try {
          const organization = await OrganizationService.create({
            ...params,
            userId,
          });
          return {
            success: true,
            data: serializeOrganization(organization),
            message: "Organization created successfully",
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to create organization",
          };
        }
      },
    }),

    // UPDATE ORGANIZATION
    updateOrganization: tool({
      description:
        "Update an organization's information. Only owners and admins can update. Only provided fields will be updated.",
      inputSchema: updateOrganizationSchema,
      execute: async (params) => {
        try {
          const organization = await OrganizationService.update({
            ...params,
            userId,
          });
          return {
            success: true,
            data: serializeOrganization(organization),
            message: "Organization updated successfully",
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to update organization",
          };
        }
      },
    }),

    // ADD MEMBER
    addOrganizationMember: tool({
      description:
        "Add a user as a member to an organization. Only owners and admins can add members.",
      inputSchema: addMemberSchema,
      execute: async (params) => {
        try {
          const member = await OrganizationService.addMember({
            organizationId: params.organizationId,
            targetUserId: params.userId,
            role: params.role || "member",
            userId,
          });
          return {
            success: true,
            data: serializeMember(member),
            message: `User ${params.userId} has been added to the organization`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error ? error.message : "Failed to add member",
          };
        }
      },
    }),

    // UPDATE MEMBER ROLE
    updateOrganizationMemberRole: tool({
      description:
        "Update a member's role in an organization (owner, admin, member). Only owners can change roles.",
      inputSchema: updateMemberRoleSchema,
      execute: async (params) => {
        try {
          const member = await OrganizationService.updateMemberRole({
            organizationId: params.organizationId,
            targetUserId: params.userId,
            role: params.role,
            userId,
          });
          return {
            success: true,
            data: serializeMember(member),
            message: `Member role updated to ${params.role}`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to update member role",
          };
        }
      },
    }),

    // REMOVE MEMBER
    removeOrganizationMember: tool({
      description:
        "Remove a member from an organization. Only owners and admins can remove members.",
      inputSchema: removeMemberSchema,
      execute: async (params) => {
        try {
          await OrganizationService.removeMember({
            organizationId: params.organizationId,
            targetUserId: params.userId,
            userId,
          });
          return {
            success: true,
            message: `User ${params.userId} has been removed from the organization`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to remove member",
          };
        }
      },
    }),

    // INVITE MEMBER
    inviteOrganizationMember: tool({
      description:
        "Invite a user to join an organization by email. Only owners and admins can invite members.",
      inputSchema: inviteMemberSchema,
      execute: async (params) => {
        try {
          const invitation = await OrganizationService.inviteMember({
            organizationId: params.organizationId,
            email: params.email,
            role: params.role || "member",
            userId,
          });
          return {
            success: true,
            data: serializeInvitation(invitation),
            message: `Invitation sent to ${params.email}`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to send invitation",
          };
        }
      },
    }),

    // LIST INVITATIONS
    listOrganizationInvitations: tool({
      description:
        "List invitations for an organization. Optionally filter by status (pending, accepted, expired). Only owners and admins can view invitations.",
      inputSchema: listInvitationsSchema,
      execute: async (params) => {
        try {
          const invitations = await OrganizationService.listInvitations({
            organizationId: params.organizationId,
            status: params.status,
            userId,
          });
          return {
            success: true,
            data: invitations.map(serializeInvitation),
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch invitations",
          };
        }
      },
    }),

    // CANCEL INVITATION
    cancelOrganizationInvitation: tool({
      description:
        "Cancel a pending invitation. Only owners and admins can cancel invitations.",
      inputSchema: cancelInvitationSchema,
      execute: async (params) => {
        try {
          await OrganizationService.cancelInvitation({
            invitationId: params.invitationId,
            userId,
          });
          return {
            success: true,
            message: "Invitation cancelled successfully",
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to cancel invitation",
          };
        }
      },
    }),

    // LEAVE ORGANIZATION
    leaveOrganization: tool({
      description:
        "Leave an organization. The only owner cannot leave unless they transfer ownership first.",
      inputSchema: leaveOrganizationSchema,
      execute: async (params) => {
        try {
          await OrganizationService.leave({
            organizationId: params.organizationId,
            userId,
          });
          return {
            success: true,
            message: "You have left the organization",
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to leave organization",
          };
        }
      },
    }),

    // DELETE ORGANIZATION
    deleteOrganization: tool({
      description:
        "Delete an organization permanently. Only owners can delete organizations. This will remove all members and invitations.",
      inputSchema: deleteOrganizationSchema,
      execute: async (params) => {
        try {
          await OrganizationService.delete({
            organizationId: params.organizationId,
            userId,
          });
          return {
            success: true,
            message: `Organization ${params.organizationId} has been deleted`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete organization",
          };
        }
      },
    }),
  };
};
