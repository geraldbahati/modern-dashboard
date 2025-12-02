import { eq, and, desc, or, ilike, sql, type SQL } from "drizzle-orm";
import { appDb } from "@workspace/db/app-db";
import { projects } from "@workspace/db/app-db/schema";
import { type Project } from "../schemas/index.js";

// Helper to cast database result to typed Project
const toProject = (row: typeof projects.$inferSelect): Project => ({
  ...row,
  status: row.status as Project["status"],
});

export const ProjectService = {
  /**
   * List all projects for the current user with filters
   */
  list: async (input: {
    userId: string;
    limit: number;
    offset: number;
    search?: string;
    status?: "active" | "archived" | "deleted";
  }) => {
    const { userId, limit, offset, search, status } = input;

    const conditions = [eq(projects.ownerId, userId)];

    if (search) {
      conditions.push(
        or(
          ilike(projects.name, `%${search}%`),
          ilike(projects.description || "", `%${search}%`)
        )!
      );
    }

    if (status) {
      conditions.push(eq(projects.status, status));
    }

    const whereClause = and(...conditions) as unknown as SQL<unknown>;

    const rows = await appDb
      .select()
      .from(projects)
      .where(whereClause!)
      .orderBy(desc(projects.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await appDb
      .select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(whereClause!);

    return {
      data: rows.map(toProject),
      total: countResult[0]?.count ?? 0,
    };
  },

  /**
   * Get project metrics
   */
  metrics: async (userId: string) => {
    const totalResult = await appDb
      .select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(eq(projects.ownerId, userId));

    const activeResult = await appDb
      .select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(and(eq(projects.ownerId, userId), eq(projects.status, "active"))!);

    const archivedResult = await appDb
      .select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(
        and(eq(projects.ownerId, userId), eq(projects.status, "archived"))!
      );

    const deletedResult = await appDb
      .select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(
        and(eq(projects.ownerId, userId), eq(projects.status, "deleted"))!
      );

    return {
      total: totalResult[0]?.count ?? 0,
      active: activeResult[0]?.count ?? 0,
      archived: archivedResult[0]?.count ?? 0,
      deleted: deletedResult[0]?.count ?? 0,
    };
  },

  /**
   * Get a single project by ID
   */
  getById: async (userId: string, projectId: string) => {
    const [project] = await appDb
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, userId)));

    return project ? toProject(project) : null;
  },

  /**
   * Get a project by slug
   */
  getBySlug: async (userId: string, slug: string) => {
    const [project] = await appDb
      .select()
      .from(projects)
      .where(and(eq(projects.slug, slug), eq(projects.ownerId, userId)));

    return project ? toProject(project) : null;
  },

  /**
   * Create a new project
   */
  create: async (input: {
    userId: string;
    name: string;
    slug: string;
    description?: string;
    status?: "active" | "archived" | "deleted";
    environment?: "production" | "staging" | "development";
    framework?: string;
    repository?: string;
    deploymentUrl?: string;
  }) => {
    const { userId, ...data } = input;

    // Check if slug already exists for this user
    const [existing] = await appDb
      .select()
      .from(projects)
      .where(and(eq(projects.slug, data.slug), eq(projects.ownerId, userId)));

    if (existing) {
      throw new Error("A project with this slug already exists");
    }

    const [project] = await appDb
      .insert(projects)
      .values({
        ...data,
        ownerId: userId,
      })
      .returning();

    if (!project) {
      throw new Error("Failed to create project");
    }

    return toProject(project);
  },

  /**
   * Update a project
   */
  update: async (
    userId: string,
    projectId: string,
    data: Partial<Omit<Project, "id" | "ownerId" | "createdAt" | "updatedAt">>
  ) => {
    // Verify ownership
    const [existing] = await appDb
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, userId)));

    if (!existing) {
      throw new Error("Project not found");
    }

    const [updated] = await appDb
      .update(projects)
      .set(data)
      .where(eq(projects.id, projectId))
      .returning();

    if (!updated) {
      throw new Error("Failed to update project");
    }

    return toProject(updated);
  },

  /**
   * Delete a project (soft delete - sets status to 'deleted')
   */
  remove: async (userId: string, projectId: string) => {
    // Verify ownership
    const [existing] = await appDb
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, userId)));

    if (!existing) {
      throw new Error("Project not found");
    }

    // Soft delete
    await appDb
      .update(projects)
      .set({ status: "deleted" })
      .where(eq(projects.id, projectId));

    return { success: true };
  },

  /**
   * Hard delete a project (permanent)
   */
  hardDelete: async (userId: string, projectId: string) => {
    // Verify ownership
    const [existing] = await appDb
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, userId)));

    if (!existing) {
      throw new Error("Project not found");
    }

    await appDb.delete(projects).where(eq(projects.id, projectId));

    return { success: true };
  },

  /**
   * Archive a project
   */
  archive: async (userId: string, projectId: string) => {
    // Verify ownership
    const [existing] = await appDb
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, userId)));

    if (!existing) {
      throw new Error("Project not found");
    }

    const [updated] = await appDb
      .update(projects)
      .set({ status: "archived" })
      .where(eq(projects.id, projectId))
      .returning();

    if (!updated) {
      throw new Error("Failed to archive project");
    }

    return toProject(updated);
  },

  /**
   * Restore a project from archived or deleted status
   */
  restore: async (userId: string, projectId: string) => {
    // Verify ownership
    const [existing] = await appDb
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, userId)));

    if (!existing) {
      throw new Error("Project not found");
    }

    const [updated] = await appDb
      .update(projects)
      .set({ status: "active" })
      .where(eq(projects.id, projectId))
      .returning();

    if (!updated) {
      throw new Error("Failed to restore project");
    }

    return toProject(updated);
  },
};
