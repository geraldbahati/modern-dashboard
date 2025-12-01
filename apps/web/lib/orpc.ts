import { createBrowserClient, createClient } from "@workspace/api/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

/**
 * API base URL - server runs on port 3001
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const RPC_URL = `${API_URL}/api/rpc`;

/**
 * Browser client with credentials for client-side usage
 */
const browserClient = createBrowserClient(RPC_URL);

/**
 * TanStack Query utils for client components
 * Usage:
 * ```tsx
 * const { data } = useQuery(orpc.users.list.queryOptions({ input: { limit: 10 } }));
 * ```
 */
export const orpc = createTanstackQueryUtils(browserClient);

/**
 * Create a server-side oRPC client with TanStack Query utils
 * Use this for SSR prefetching in server components
 *
 * @param cookieHeader - The cookie header string to forward for auth
 * @returns TanStack Query utils configured for server-side usage
 *
 * @example
 * ```tsx
 * // In a server component
 * import { cookies } from 'next/headers';
 * const cookieStore = await cookies();
 * const serverOrpc = createServerOrpc(cookieStore.toString());
 * await queryClient.prefetchQuery(serverOrpc.users.me.queryOptions({}));
 * ```
 */
export function createServerOrpc(cookieHeader?: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const serverClient = createClient({
    baseUrl: RPC_URL,
    headers: cookieHeader
      ? () => ({
          cookie: cookieHeader,
          origin: appUrl,
        })
      : undefined,
  });

  return createTanstackQueryUtils(serverClient);
}
