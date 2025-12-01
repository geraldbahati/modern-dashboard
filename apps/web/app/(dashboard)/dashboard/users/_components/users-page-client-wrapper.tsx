"use client";

import { ReactNode } from "react";
import { useSession } from "@workspace/auth/client";
import { hasPermission, type RoleName } from "@workspace/auth/permissions";

interface UsersPageClientWrapperProps {
  children: (props: {
    userRole: RoleName;
    canManageUsers: boolean;
    isLoading: boolean;
  }) => ReactNode;
}

/**
 * Client wrapper for users page that handles session state
 * and provides permissions to child components
 */
export function UsersPageClientWrapper({
  children,
}: UsersPageClientWrapperProps) {
  const { data: session, isPending } = useSession();

  // Extract user role
  const userRole = (session?.user?.role as RoleName) || "user";

  // Permission checks
  const canManageUsers = hasPermission(userRole, "user", "delete");

  return (
    <>
      {children({
        userRole,
        canManageUsers,
        isLoading: isPending,
      })}
    </>
  );
}
