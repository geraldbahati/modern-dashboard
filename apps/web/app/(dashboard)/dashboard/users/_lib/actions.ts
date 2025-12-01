"use server";

import { cacheLife, cacheTag, updateTag } from "next/cache";
import { createClient } from "@workspace/api/client";
import { cookies } from "next/headers";

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  twoFactorEnabled: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DisplayUser = User & {
  joinedDate: string;
  status: "verified" | "unverified";
};

// Create API client with auth cookies
const getApiClient = async () => {
  // Always use NEXT_PUBLIC_API_URL to ensure cookie domain matches
  // In Docker, this will still be localhost:3001 accessed from browser
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const cookieStore = await cookies();

  return createClient({
    baseUrl: baseUrl + "/api/rpc",
    headers: {
      cookie: cookieStore.toString(),
    },
  });
};

// Cached function to get user metrics
export async function getUserMetrics() {
  const client = await getApiClient();

  try {
    const metrics = await client.users.metrics();

    return {
      verified: metrics.verified,
      unverified: metrics.unverified,
      total: metrics.total,
      banned: metrics.banned,
      active: metrics.active,
    };
  } catch (error) {
    console.error("Failed to fetch user metrics:", error);
    // Return default metrics on error
    return {
      verified: 0,
      unverified: 0,
      total: 0,
      banned: 0,
      active: 0,
    };
  }
}

interface GetUsersParams {
  page?: number;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fromDate?: string;
  toDate?: string;
}

// Cached function to get filtered and paginated users
export async function getUsers(params: GetUsersParams) {
  const {
    page = 1,
    username,
    email,
    firstName,
    lastName,
    fromDate,
    toDate,
  } = params;

  const client = await getApiClient();

  try {
    const result = await client.users.list({
      page,
      limit: 10,
      offset: (page - 1) * 10,
      username,
      email,
      firstName,
      lastName,
      fromDate,
      toDate,
    });

    return {
      users: result.users.map((u) => ({
        ...u,
        // Format dates for display
        joinedDate: new Date(u.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        status: u.emailVerified
          ? ("verified" as const)
          : ("unverified" as const),
      })),
      pagination: result.pagination,
    };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    // Return empty results on error
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

// Server action to create a user
export async function createUser(formData: FormData) {
  "use server";

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role =
    (formData.get("role") as "admin" | "moderator" | "editor" | "user") ||
    "user";

  const client = await getApiClient();

  try {
    await client.users.create({
      name,
      email,
      role,
    });

    // Revalidate caches
    updateTag("users-list");
    updateTag("user-metrics");

    return { success: true };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { success: false, error: "Failed to create user" };
  }
}

// Server action to delete a user
export async function deleteUser(userId: string) {
  "use server";

  const client = await getApiClient();

  try {
    await client.users.delete({
      userId,
      permanent: false, // Soft delete by default
    });

    // Revalidate caches
    updateTag("users-list");
    updateTag("user-metrics");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

// Server action to update user status (ban/unban)
export async function updateUserStatus(
  userId: string,
  action: "ban" | "unban"
) {
  "use server";

  const client = await getApiClient();

  try {
    if (action === "ban") {
      await client.users.ban({
        userId,
        reason: "Banned by admin",
      });
    } else {
      await client.users.unban({
        id: userId,
      });
    }

    // Revalidate caches
    updateTag("users-list");
    updateTag("user-metrics");

    return { success: true };
  } catch (error) {
    console.error("Failed to update user status:", error);
    return { success: false, error: "Failed to update user status" };
  }
}

// Server action to update user role
export async function updateUserRole(
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
    updateTag("users-list");
    updateTag("user-metrics");

    return { success: true };
  } catch (error) {
    console.error("Failed to update user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

// Server action to get user by ID
export async function getUserById(userId: string) {
  const client = await getApiClient();

  try {
    const user = await client.users.getById({ id: userId });
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}

// Server action to get current user
export async function getCurrentUser() {
  const client = await getApiClient();

  try {
    const user = await client.users.me();
    return user;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return null;
  }
}

// Server action to update a user
export async function updateUser(formData: FormData) {
  "use server";

  const userId = formData.get("userId") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as
    | "admin"
    | "moderator"
    | "editor"
    | "user";
  const image = formData.get("image") as string;

  if (!userId) {
    return { success: false, error: "User ID is required" };
  }

  const client = await getApiClient();

  try {
    await client.users.update({
      userId,
      name: name || undefined,
      email: email || undefined,
      role: role || undefined,
      image: image || undefined,
    });

    // Revalidate caches
    updateTag("users-list");
    updateTag("user-metrics");
    updateTag(`user-${userId}`);
    if (role) {
      // If role changed, might affect current user permissions if it's them
      updateTag("current-user");
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to update user:", error);
    return { success: false, error: "Failed to update user" };
  }
}
