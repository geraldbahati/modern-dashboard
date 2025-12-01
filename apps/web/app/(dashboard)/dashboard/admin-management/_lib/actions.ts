"use server";

import { cacheLife, cacheTag, updateTag } from "next/cache";
import { createClient } from "@workspace/api/client";
import { cookies } from "next/headers";
import { User } from "@workspace/api/schemas";

// Create API client with auth cookies
const getApiClient = async () => {
  // Always use NEXT_PUBLIC_API_URL to ensure cookie domain matches
  // In Docker, this will still be localhost:3001 accessed from browser
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const cookieStore = await cookies();

  return createClient({
    baseUrl: baseUrl + "/api/rpc",
    headers: {
      cookie: cookieStore.toString(),
      origin: appUrl,
    },
  });
};

// Cached function to get admin metrics
export async function getAdminMetrics() {
  const client = await getApiClient();

  try {
    const metrics = await client.admins.metrics();
    return metrics;
  } catch (error) {
    console.error("Failed to fetch admin metrics:", error);
    return {
      total: 0,
      admins: 0,
      recentlyAdded: 0,
      recentlyUpdated: 0,
    };
  }
}

interface GetAdminsParams {
  page?: number;
  search?: string;
  email?: string;
  phone?: string;
  name?: string;
}

// Cached function to get filtered and paginated admins
export async function getAdmins(params: GetAdminsParams) {
  const { page = 1, search, email, phone, name } = params;

  const client = await getApiClient();

  try {
    const result = await client.admins.list({
      page,
      limit: 10,
      offset: (page - 1) * 10,
      search,
      email,
      phone,
      name,
    });

    return {
      users: result.users.map((u) => ({
        ...u,
        // Format dates for display
        createdDate: new Date(u.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      })),
      pagination: result.pagination,
    };
  } catch (error) {
    console.error("Failed to fetch admins:", error);
    return {
      users: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
        startIndex: 0,
        endIndex: 0,
      },
    };
  }
}

// Server action to update admin role
export async function updateAdminRole(
  userId: string,
  role: "admin" | "moderator" | "editor" | "user"
) {
  "use server";

  const client = await getApiClient();

  try {
    await client.users.updateRole({
      userId,
      role,
    });

    // Revalidate caches
    updateTag("admins-list");
    updateTag("admin-metrics");

    return { success: true };
  } catch (error) {
    console.error("Failed to update admin role:", error);
    return { success: false, error: "Failed to update admin role" };
  }
}

// Server action to remove admin (demote to user or delete)
// For now, let's assume we just demote to user if "remove" is clicked, or delete if explicitly deleted.
// The UI shows "Delete user" in dropdown.
export async function deleteAdmin(userId: string) {
  "use server";

  const client = await getApiClient();

  try {
    await client.users.delete({
      userId,
    });

    // Revalidate caches
    updateTag("admins-list");
    updateTag("admin-metrics");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete admin:", error);
    return { success: false, error: "Failed to delete admin" };
  }
}
