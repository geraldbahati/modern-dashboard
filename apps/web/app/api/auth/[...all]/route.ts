/**
 * Next.js Auth Route Handler
 * Handles all /api/auth/* requests using better-auth
 */

import { auth } from "@workspace/auth/next";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
