import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { DbVariables } from "../lib/db";

// Import schema from the db package
import * as schema from "@workspace/db/auth-db/schema";

const users = new Hono<{ Variables: DbVariables }>()
  // Get all users
  .get("/", async (c) => {
    const db = c.get("db");
    const allUsers = await db.select().from(schema.user);
    return c.json(allUsers);
  })

  // Get user by ID
  .get("/:id", async (c) => {
    const db = c.get("db");
    const id = c.req.param("id");

    const [foundUser] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, id));

    if (!foundUser) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(foundUser);
  });

export default users;
