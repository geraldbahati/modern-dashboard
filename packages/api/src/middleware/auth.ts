/**
 * oRPC authentication middleware
 * Provides auth context to procedures
 */

import { ORPCError, os } from "@orpc/server";

// Context types
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string | null;
}

export interface AuthSession {
  id: string;
  expiresAt: Date;
}

export interface AuthContext {
  user: AuthUser | null;
  session: AuthSession | null;
}

export interface RequestContext {
  headers: Headers;
  request: Request;
}

// Full context type
export type FullContext = RequestContext & AuthContext;

// Base procedure with full context
export const publicProcedure = os.$context<FullContext>();

// Authenticated procedure - requires valid session
export const protectedProcedure = publicProcedure.use(
  async ({ context, next }) => {
    if (!context.user || !context.session) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "You must be logged in",
      });
    }
    return next({
      context: {
        ...context,
        user: context.user,
        session: context.session,
      },
    });
  }
);

// Admin procedure - requires admin role
export const adminProcedure = protectedProcedure.use(
  async ({ context, next }) => {
    if (context.user.role !== "admin") {
      throw new ORPCError("FORBIDDEN", {
        message: "Admin access required",
      });
    }
    return next({ context });
  }
);

// Moderator procedure - requires moderator or admin role
export const moderatorProcedure = protectedProcedure.use(
  async ({ context, next }) => {
    const allowedRoles = ["admin", "moderator"];
    if (!context.user.role || !allowedRoles.includes(context.user.role)) {
      throw new ORPCError("FORBIDDEN", {
        message: "Moderator access required",
      });
    }
    return next({ context });
  }
);
