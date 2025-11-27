"use client";

import { UsersList } from "@workspace/ui/components/ai-generated/users-list";
import { UserDetails } from "@workspace/ui/components/ai-generated/user-details";
import type { ToolComponentProps } from "../registry";
import { registerTool } from "../registry";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  twoFactorEnabled?: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ListUsersResult {
  data: User[];
  count: number;
}

interface UserDetailsResult {
  data: User;
}

export const ListUsersTool: React.FC<ToolComponentProps<ListUsersResult>> = ({
  tool,
  result,
  onAction,
}) => {
  if (tool.state !== "output-available" || !result) return null;

  return (
    <UsersList
      users={result?.data || []}
      total={result?.count}
      onUserClick={(userId) => onAction?.("viewDetails", userId)}
    />
  );
};

export const UserDetailsTool: React.FC<
  ToolComponentProps<UserDetailsResult>
> = ({ tool, result, onAction }) => {
  if (tool.state !== "output-available" || !result) return null;

  return (
    <UserDetails
      user={result?.data}
      onAction={(action, userId) => onAction?.(action, userId)}
    />
  );
};

// Register tools
registerTool("listUsers", ListUsersTool);
registerTool("getUserById", UserDetailsTool);
