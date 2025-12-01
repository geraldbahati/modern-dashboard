import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth";
import { rpcHandler, getAuthContext } from "./lib/rpc";
import { dbMiddleware, type DbVariables } from "./lib/db";
import {
  sessionMiddleware,
  requireAuth,
  type AuthVariables,
} from "./middleware/auth";
import {
  authSecurityMiddleware,
  apiSecurityMiddleware,
} from "./middleware/security";

// Cloudflare Workers environment bindings
type Bindings = {
  BETTER_AUTH_URL?: string;
  FRONTEND_URL?: string;
  BETTER_AUTH_SECRET?: string;
  AUTH_DATABASE_URL?: string;
  DATABASE_URL?: string;
  RESEND_API_KEY?: string;
  ARCJET_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
};

// Combined app variables
type AppVariables = DbVariables & AuthVariables;

const app = new Hono<{ Variables: AppVariables; Bindings: Bindings }>();

// Global middleware
app.use("*", logger());

// CORS - must be before routes
app.use("*", (c, next) => {
  const frontendUrl = c.env.FRONTEND_URL || "http://localhost:3000";
  return cors({
    origin: [frontendUrl],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })(c, next);
});

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
