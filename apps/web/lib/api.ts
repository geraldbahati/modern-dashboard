/**
 * oRPC client for Next.js
 * Use this to make type-safe API calls to the server
 */

import { createBrowserClient } from "@workspace/api/client";

// API base URL - server runs on port 3001
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * oRPC client instance
 * Use this in client components for type-safe API calls
 *
 * @example
 * ```tsx
 * const users = await api.users.list({ limit: 10, offset: 0 });
 * const health = await api.health.check();
 * ```
 */
export const api = createBrowserClient(`${API_URL}/api/rpc`);

/**
 * Server-side API client
 * Use in Server Components and Server Actions
 */
export const createServerApi = (headers?: HeadersInit) => {
  const { createClient } = require("@workspace/api/client");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return createClient({
    baseUrl: `${API_URL}/api/rpc`,
    headers: headers
      ? () => ({
          ...Object.fromEntries(new Headers(headers).entries()),
          origin: appUrl,
        })
      : undefined,
  });
};
