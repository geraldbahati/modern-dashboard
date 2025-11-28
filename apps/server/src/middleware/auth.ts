import { createMiddleware } from "hono/factory";
import { auth, type User, type Session } from "../lib/auth.js";

// Types for auth context
export type AuthVariables = {
  user: User | null;
  session: Session["session"] | null;
};

// Middleware that injects session into context (doesn't require auth)
export const sessionMiddleware = createMiddleware<{
  Variables: AuthVariables;
}>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  c.set("user", session?.user ?? null);
  c.set("session", session?.session ?? null);

  await next();
});

// Middleware that requires authentication
export const requireAuth = createMiddleware<{
  Variables: AuthVariables;
}>(async (c, next) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
});

// Middleware that requires specific role
export const requireRole = (...roles: string[]) => {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (!user.role || !roles.includes(user.role)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await next();
  });
};
