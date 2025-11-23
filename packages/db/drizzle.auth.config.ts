/**
 * Drizzle Kit configuration for Auth Database
 * Run from root: pnpm db:push:auth or pnpm db:migrate:auth
 */

import { defineConfig } from "drizzle-kit";

if (!process.env.AUTH_DATABASE_URL) {
  throw new Error("AUTH_DATABASE_URL environment variable is required");
}

export default defineConfig({
  schema: "./src/auth-db/schema.ts",
  out: "./drizzle/auth",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.AUTH_DATABASE_URL,
  },
});
