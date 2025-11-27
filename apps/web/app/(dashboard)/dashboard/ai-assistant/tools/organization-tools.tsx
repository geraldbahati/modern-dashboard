"use client";

import { OrganizationsList } from "@workspace/ui/components/ai-generated/organizations-list";
import { OrganizationDetails } from "@workspace/ui/components/ai-generated/organization-details";
import type { ToolComponentProps } from "../registry";
import { registerTool } from "../registry";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: Date;
  metadata?: string | null;
}

interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

interface ListOrganizationsResult {
  data: Organization[];
  count: number;
}

interface OrganizationDetailsResult {
  data: Organization;
}

interface OrganizationMembersResult {
  data: OrganizationMember[];
}

export const ListOrganizationsTool: React.FC<
  ToolComponentProps<ListOrganizationsResult>
> = ({ tool, result, onAction }) => {
  if (tool.state !== "output-available" || !result) return null;

  return (
    <OrganizationsList
      organizations={result?.data || []}
      total={result?.count}
      onOrgClick={(orgId) => onAction?.("viewDetails", orgId)}
    />
  );
};

export const OrganizationDetailsTool: React.FC<
  ToolComponentProps<OrganizationDetailsResult>
> = ({ tool, result, onAction }) => {
  if (tool.state !== "output-available" || !result) return null;

  return (
    <OrganizationDetails
      organization={result?.data}
      onAction={(action, data) => onAction?.(action, data)}
    />
  );
};

export const OrganizationMembersTool: React.FC<
  ToolComponentProps<OrganizationMembersResult>
> = ({ tool, result, onAction }) => {
  if (tool.state !== "output-available" || !result) return null;

  // Extract organization ID from tool input if available
  const orgId =
    tool.input && "organizationId" in tool.input
      ? (tool.input as { organizationId: string }).organizationId
      : undefined;

  // Create a minimal organization object for the details view
  const organization = orgId
    ? {
        id: orgId,
        name: "Organization",
        slug: "organization",
        createdAt: new Date(),
      }
    : undefined;

  return organization ? (
    <OrganizationDetails
      organization={organization}
      members={result?.data || []}
      onAction={(action, data) => onAction?.(action, data)}
    />
  ) : null;
};

// Register tools
registerTool("listOrganizations", ListOrganizationsTool);
registerTool("getMyOrganizations", ListOrganizationsTool);
registerTool("getOrganizationById", OrganizationDetailsTool);
registerTool("getOrganizationBySlug", OrganizationDetailsTool);
registerTool("getOrganizationMembers", OrganizationMembersTool);
