import { createMiddleware } from "hono/factory";
import { authDb } from "@workspace/db/auth-db";

// Type for the database context
export type DbVariables = {
  db: typeof authDb;
};

// Middleware that provides database access via context
export const dbMiddleware = createMiddleware<{ Variables: DbVariables }>(
  async (c, next) => {
    c.set("db", authDb);
    await next();
  }
);

// Re-export for direct imports if needed
export { authDb };
