import { createBrowserClient } from "@workspace/api/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

const client = createBrowserClient(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
);

export const orpc = createTanstackQueryUtils(client);
