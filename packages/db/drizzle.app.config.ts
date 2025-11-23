/**
 * Drizzle Kit configuration for App Database
 * Run from root: pnpm db:push:app or pnpm db:migrate:app
 */

import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export default defineConfig({
  schema: "./src/app-db/schema.ts",
  out: "./drizzle/app",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
