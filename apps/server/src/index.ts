import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth.js";
import { rpcHandler, getAuthContext } from "./lib/rpc.js";
import { dbMiddleware, type DbVariables } from "./lib/db.js";
import {
  sessionMiddleware,
  requireAuth,
  type AuthVariables,
} from "./middleware/auth.js";
import {
  authSecurityMiddleware,
  apiSecurityMiddleware,
} from "./middleware/security.js";

// Combined app variables
type AppVariables = DbVariables & AuthVariables;

const app = new Hono<{ Variables: AppVariables }>();

// Global middleware
app.use("*", logger());

// CORS - must be before routes
app.use(
  "*",
  cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Database middleware
app.use("*", dbMiddleware);

// Session middleware - injects user/session into context
app.use("*", sessionMiddleware);

// Health check endpoints (no security middleware - for uptime monitors)
app.get("/", (c) => {
  return c.json({ status: "ok", message: "Hono server is running" });
});

app.get("/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Better Auth routes - with auth-specific security (stricter rate limiting)
app.on(["POST", "GET"], "/api/auth/**", authSecurityMiddleware, (c) => {
  return auth.handler(c.req.raw);
});

// oRPC routes - /api/rpc/*
app.all("/api/rpc/*", apiSecurityMiddleware, async (c) => {
  // Get auth context from session
  const authContext = await getAuthContext(c.req.raw.headers);

  // Handle RPC request
  const result = await rpcHandler.handle(c.req.raw, {
    prefix: "/api/rpc",
    context: {
      headers: c.req.raw.headers,
      request: c.req.raw,
      ...authContext,
    },
  });

  if (result.matched) {
    return result.response;
  }

  return c.json({ error: "RPC procedure not found" }, 404);
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

// Example protected route
app.get("/api/protected", apiSecurityMiddleware, requireAuth, (c) => {
  const user = c.get("user");
  return c.json({ message: `Hello ${user?.name}!`, user });
});

export default app;
