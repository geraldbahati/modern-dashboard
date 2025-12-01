"use server";

import { updateTag } from "next/cache";
import { createClient } from "@workspace/api/client";
import { cookies } from "next/headers";

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

// Cached function to get project metrics
export async function getProjectMetrics() {
  const client = await getApiClient();

  try {
    const metrics = await client.projects.metrics();
    return metrics;
  } catch (error) {
    console.error("Failed to fetch project metrics:", error);
    return {
      total: 0,
      active: 0,
      archived: 0,
      deleted: 0,
    };
  }
}

interface GetProjectsParams {
  page?: number;
  search?: string;
  status?: "active" | "archived" | "deleted";
  environment?: "production" | "staging" | "development";
}

// Cached function to get filtered and paginated projects
export async function getProjects(params: GetProjectsParams) {
  const { page = 1, search, status, environment } = params;

  const client = await getApiClient();

  try {
    const result = await client.projects.list({
      limit: 10,
      offset: (page - 1) * 10,
      search,
      status,
      environment,
    });

    const startIndex = (page - 1) * 10 + 1;
    const endIndex = Math.min(startIndex + 10 - 1, result.total);

    return {
      projects: result.data.map((p) => ({
        ...p,
        // Format dates for display
        lastUpdated: new Date(p.updatedAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      })),
      total: result.total,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(result.total / 10),
        totalItems: result.total,
        itemsPerPage: 10,
        startIndex: result.total === 0 ? 0 : startIndex,
        endIndex,
      },
    };
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return {
      projects: [],
      total: 0,
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

// Server action to create a project
export async function createProject(formData: FormData) {
  "use server";

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const isPublic = formData.get("isPublic") === "true";

  const client = await getApiClient();

  try {
    await client.projects.create({
      name,
      slug,
      description,
      isPublic,
    });

    // Revalidate caches
    updateTag("projects-list");
    updateTag("project-metrics");

    return { success: true };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { success: false, error: "Failed to create project" };
  }
}

// Server action to delete a project
export async function deleteProject(projectId: string) {
  "use server";

  const client = await getApiClient();

  try {
    await client.projects.remove({
      id: projectId,
    });

    // Revalidate caches
    updateTag("projects-list");
    updateTag("project-metrics");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete project:", error);
    return { success: false, error: "Failed to delete project" };
  }
}
