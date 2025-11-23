import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth";
import { dbMiddleware, type DbVariables } from "./lib/db";
import {
  sessionMiddleware,
  requireAuth,
  type AuthVariables,
} from "./middleware/auth";
import users from "./routes/users";

// Combined app variables
type AppVariables = DbVariables & AuthVariables;

const app = new Hono<{ Variables: AppVariables }>();

// Middleware
app.use("*", logger());

// CORS - must be before routes
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Database middleware
app.use("*", dbMiddleware);

// Session middleware - injects user/session into context
app.use("*", sessionMiddleware);

// Health check
app.get("/", (c) => {
  return c.json({ status: "ok", message: "Hono server is running" });
});

app.get("/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Better Auth handler - handles all /api/auth/* routes
app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

// Session endpoint - get current session
app.get("/api/session", (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user) {
    return c.json({ user: null, session: null }, 401);
  }

  return c.json({ user, session });
});

// Protected API routes
app.route("/api/users", users);

// Example protected route
app.get("/api/protected", requireAuth, (c) => {
  const user = c.get("user");
  return c.json({ message: `Hello ${user?.name}!`, user });
});

export default app;
