"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSession } from "@workspace/auth/client";
import { hasPermission, type RoleName } from "@workspace/auth/permissions";

interface DashboardSessionContextValue {
  // User data
  userName?: string;
  userEmail?: string;
  userRole: RoleName;
  userId?: string;

  // Permissions
  canViewAnalytics: boolean;
  canViewProjects: boolean;
  canViewTasks: boolean;
  canManageUsers: boolean;

  // Loading state
  isLoading: boolean;

  // Raw session (for advanced use cases)
  session: ReturnType<typeof useSession>["data"];
}

const DashboardSessionContext = createContext<
  DashboardSessionContextValue | undefined
>(undefined);

/**
 * Provider that fetches session once at layout level
 * and provides it to all dashboard pages
 */
export function DashboardSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { data: session, isPending } = useSession();

  // Extract user data
  const userName = session?.user?.name;
  const userEmail = session?.user?.email;
  const userId = session?.user?.id;
  const userRole = (session?.user?.role as RoleName) || "user";

  // Calculate all permissions once
  const canViewAnalytics = hasPermission(userRole, "analytics", "view");
  const canViewProjects = hasPermission(userRole, "project", "read");
  const canViewTasks = hasPermission(userRole, "task", "read");
  const canManageUsers = hasPermission(userRole, "user", "delete");

  const value: DashboardSessionContextValue = {
    userName,
    userEmail,
    userRole,
    userId,
    canViewAnalytics,
    canViewProjects,
    canViewTasks,
    canManageUsers,
    isLoading: isPending,
    session,
  };

  return (
    <DashboardSessionContext.Provider value={value}>
      {children}
    </DashboardSessionContext.Provider>
  );
}

/**
 * Hook to access dashboard session data
 * Must be used within DashboardSessionProvider
 */
export function useDashboardSession() {
  const context = useContext(DashboardSessionContext);

  if (context === undefined) {
    throw new Error(
      "useDashboardSession must be used within DashboardSessionProvider"
    );
  }

  return context;
}
