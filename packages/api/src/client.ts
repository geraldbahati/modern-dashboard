/**
 * oRPC Client setup
 * Import from "@workspace/api/client"
 */

import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import type { AppRouter } from "./router";

// Export the client type for use in other packages
export type Client = RouterClient<AppRouter>;

export interface ClientOptions {
  baseUrl: string;
  headers?: Record<string, string> | (() => Record<string, string> | Promise<Record<string, string>>);
}

/**
 * Create a typed oRPC client
 * This is used for server-side requests where we need to forward cookies manually
 */
export const createClient = (options: ClientOptions): Client => {
  const link = new RPCLink({
    url: options.baseUrl,
    headers: options.headers,
    fetch: (input, init) => {
      // For server-side requests, include credentials
      // This ensures cookies are sent with the request
      return fetch(input, {
        ...init,
        credentials: "include",
      });
    },
  });

  return createORPCClient(link);
};

/**
 * Create client with credentials (for browser)
 */
export const createBrowserClient = (baseUrl: string): Client => {
  const link = new RPCLink({
    url: baseUrl,
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        credentials: "include",
      }),
  });

  return createORPCClient(link);
};

// Re-export types
export type { AppRouter };
