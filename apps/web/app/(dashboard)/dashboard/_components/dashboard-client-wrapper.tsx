"use client";

import { ReactNode } from "react";
import { useSession } from "@workspace/auth/client";
import { hasPermission, type RoleName } from "@workspace/auth/permissions";

interface DashboardClientWrapperProps {
  children: (props: {
    userName?: string;
    userRole: RoleName;
    canViewAnalytics: boolean;
    canViewProjects: boolean;
    canViewTasks: boolean;
    isLoading: boolean;
  }) => ReactNode;
}

/**
 * Client wrapper for dashboard page that handles session state
 * and provides user data and permissions to child components
 */
export function DashboardClientWrapper({
  children,
}: DashboardClientWrapperProps) {
  const { data: session, isPending } = useSession();

  // Extract user data
  const userName = session?.user?.name;
  const userRole = (session?.user?.role as RoleName) || "user";

  // Permission checks
  const canViewAnalytics = hasPermission(userRole, "analytics", "view");
  const canViewProjects = hasPermission(userRole, "project", "read");
  const canViewTasks = hasPermission(userRole, "task", "read");

  return (
    <>
      {children({
        userName,
        userRole,
        canViewAnalytics,
        canViewProjects,
        canViewTasks,
        isLoading: isPending,
      })}
    </>
  );
}
