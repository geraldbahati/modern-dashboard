"use client";

import { useSession } from "@workspace/auth/client";

export interface UserContext {
  userName: string;
  userEmail: string;
  userRole: string;
}

/**
 * Hook to get user context for the AI assistant
 * Falls back to default values if session is not available
 */
export function useUserContext(): UserContext {
  const { data: session } = useSession();

  const user = session?.user;

  return {
    userName: user?.name || user?.email?.split("@")[0] || "User",
    userEmail: user?.email || "",
    userRole: (user as any)?.role || "user",
  };
}
