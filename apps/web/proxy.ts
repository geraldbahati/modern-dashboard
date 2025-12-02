import { createArcjetMiddleware } from "@workspace/security/next";
import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";

export const config = {
  // Matcher ignoring static files and RPC
  matcher: ["/((?!_next/static|_next/image|favicon.ico|/rpc).*)"],
};

// Initialize Arcjet middleware
const arcjetMiddleware = createArcjetMiddleware(process.env.ARCJET_KEY!);

export default async function proxy(req: NextRequest, event: NextFetchEvent) {
  // 1. Arcjet Security Check
  const arcjetResponse = await arcjetMiddleware(req, event);

  // If Arcjet blocks the request or redirects, return the response immediately
  if (arcjetResponse && arcjetResponse.status !== 200) {
    return arcjetResponse;
  }

  // 2. Custom Auth Logic
  const url = req.nextUrl;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  try {
    // Only check session on the root path to redirect to dashboard
    if (url.pathname === "/") {
      // Fetch session from the API server
      const sessionRes = await fetch(`${API_URL}/api/auth/get-session`, {
        headers: {
          cookie: req.headers.get("cookie") || "",
        },
      });

      if (sessionRes.ok) {
        const { user } = await sessionRes.json();

        if (user) {
          // User is logged in, redirect to dashboard
          url.pathname = "/dashboard";
          return NextResponse.redirect(url);
        }
      }

      // User is not logged in or session check failed, redirect to sign-in
      url.pathname = "/auth/sign-in";
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error("Proxy auth check failed:", error);
    // Fail open
  }

  // Continue request
  return NextResponse.next();
}
