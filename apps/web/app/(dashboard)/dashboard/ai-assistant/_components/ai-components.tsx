"use client";

/**
 * Client-side AI-generated components for use in server actions
 * These are simplified wrappers that work with RSC serialization
 */

import { UsersList as BaseUsersList } from "@workspace/ui/components/ai-generated/users-list";
import { UserDetails as BaseUserDetails } from "@workspace/ui/components/ai-generated/user-details";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  createdAt: Date;
  emailVerified: boolean;
  banned: boolean;
  twoFactorEnabled: boolean;
}

export function UsersList({ users, total }: { users: User[]; total: number }) {
  return <BaseUsersList users={users} total={total} onUserClick={() => {}} />;
}

export function UserDetails({ user }: { user: User & { updatedAt: Date } }) {
  return <BaseUserDetails user={user} onAction={() => {}} />;
}
