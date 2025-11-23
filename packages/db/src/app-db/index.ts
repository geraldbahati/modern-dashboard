/**
 * App Database Connection
 * Separate database for application data (projects, tasks, etc.)
 * Uses DATABASE_URL environment variable
 */

import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let _appDb: NeonHttpDatabase<typeof schema> | null = null;

export const getAppDb = () => {
  if (_appDb) return _appDb;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  _appDb = drizzle(connectionString, { schema });

  return _appDb;
};

// Lazy-loaded database instance
export const appDb = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get: (_, property) =>
    getAppDb()[property as keyof NeonHttpDatabase<typeof schema>],
});

// Re-export schema for convenience
export * as appSchema from "./schema";
