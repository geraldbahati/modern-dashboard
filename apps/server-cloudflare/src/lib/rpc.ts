/**
 * oRPC handler for Hono
 * Bridges oRPC router with Hono server
 */

import { RPCHandler } from "@orpc/server/fetch";
import { router, type AuthContext } from "@workspace/api/router";
import { auth } from "./auth";

// Create RPC handler for oRPC client communication
// Note: RPCHandler works with RPCLink clients (standard oRPC protocol)
// For OpenAPI/REST compatibility, use OpenAPIHandler from @orpc/openapi/fetch
export const rpcHandler = new RPCHandler(router);

// Extended user type that includes role from admin plugin
interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role?: string | null;
}

/**
 * Get auth context from request headers
 */
/**
 * Get auth context from request headers
 */
export async function getAuthContext(
  headers: Headers,
  env?: { INTERNAL_API_KEY?: string }
): Promise<AuthContext> {
  try {
    // Check for internal bypass token
    const internalToken = headers.get("x-internal-token");
    const expectedToken =
      env?.INTERNAL_API_KEY ||
      "e4539e9b6edb44aaf974adf22b62c0aa5c2e8af1b42e2a46ac71042e1bfc5165";

    if (internalToken === expectedToken) {
      if (process.env.NODE_ENV === "development") {
        console.log("[RPC] Internal token bypass accepted");
      }
      return {
        user: {
          id: "internal-admin",
          name: "Internal Admin",
          email: "admin@internal.system",
          role: "admin",
        },
        session: {
          id: "internal-session",
          expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
        },
      };
    }

    // Debug: Log cookies being received
    const cookieHeader = headers.get("cookie");
    if (process.env.NODE_ENV === "development") {
      console.log("[RPC] Cookies received:", cookieHeader ? "present" : "none");
    }

    const session = await auth.api.getSession({ headers });

    if (!session?.user || !session?.session) {
      if (process.env.NODE_ENV === "development") {
        console.log("[RPC] No valid session found");
      }
      return { user: null, session: null };
    }

    // Cast to include role field from admin plugin
    const user = session.user as UserWithRole;

    if (process.env.NODE_ENV === "development") {
      console.log("[RPC] Session found for user:", user.email);
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role ?? null,
      },
      session: {
        id: session.session.id,
        expiresAt: session.session.expiresAt,
      },
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[RPC] Error getting auth context:", error);
    }
    return { user: null, session: null };
  }
}
