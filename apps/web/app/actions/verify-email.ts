"use server";

import { auth } from "@workspace/auth/next";
import { headers } from "next/headers";

export async function resendVerificationEmail(email: string) {
  try {
    const result = await auth.api.sendVerificationEmail({
      body: {
        email,
        callbackURL: "/auth/verify-email", // Redirect back to verification page
      },
      headers: await headers(),
    });

    if (result) {
      return {
        success: true,
        message: "Verification email sent successfully",
      };
    }

    return {
      success: false,
      message: "Failed to send verification email",
    };
  } catch (error: any) {
    // Handle rate limiting or other errors
    if (error?.status === 429) {
      const retryAfter = error.headers?.get("Retry-After");
      return {
        success: false,
        message: "Too many requests. Please try again later.",
        remainingTime: retryAfter ? parseInt(retryAfter) : 60,
      };
    }

    return {
      success: false,
      message: error.message || "Failed to send verification email",
    };
  }
}
