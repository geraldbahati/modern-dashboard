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
import type { Client } from "../../../client.js";

export const createOrganizationTools = (client: Client) => ({
  // LIST ORGANIZATIONS
  listOrganizations: tool({
    description:
      "List and search organizations. Use this to show all organizations or search by name/slug.",
    inputSchema: listOrganizationsSchema,
    execute: async (params) => {
      try {
        const result = await client.organizations.list(params);
        return {
          success: true,
          data: result.organizations,
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
        const organizations =
          await client.organizations.getMyOrganizations(params);
        return {
          success: true,
          data: organizations,
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
        const organization = await client.organizations.getById({
          id: params.organizationId,
        });
        return {
          success: true,
          data: organization,
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
        const organization = await client.organizations.getBySlug(params);
        return {
          success: true,
          data: organization,
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
        const members = await client.organizations.getMembers(params);
        return {
          success: true,
          data: members,
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
        const organization = await client.organizations.create(params);
        return {
          success: true,
          data: organization,
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
        const organization = await client.organizations.update(params);
        return {
          success: true,
          data: organization,
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
        const member = await client.organizations.addMember(params);
        return {
          success: true,
          data: member,
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
        const member = await client.organizations.updateMemberRole(params);
        return {
          success: true,
          data: member,
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
        await client.organizations.removeMember(params);
        return {
          success: true,
          message: `User ${params.userId} has been removed from the organization`,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to remove member",
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
        const invitation = await client.organizations.inviteMember(params);
        return {
          success: true,
          data: invitation,
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
        const invitations = await client.organizations.listInvitations(params);
        return {
          success: true,
          data: invitations,
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
        await client.organizations.cancelInvitation(params);
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
        await client.organizations.leave(params);
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
        await client.organizations.delete(params);
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
});
