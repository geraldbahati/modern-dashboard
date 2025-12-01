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
export async function getAuthContext(headers: Headers): Promise<AuthContext> {
  try {
    const session = await auth.api.getSession({ headers });

    if (!session?.user || !session?.session) {
      return { user: null, session: null };
    }

    // Cast to include role field from admin plugin
    const user = session.user as UserWithRole;

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
  } catch {
    return { user: null, session: null };
  }
}
