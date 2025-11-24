"use server";

import { auth } from "@workspace/auth/next";
import { headers } from "next/headers";

export async function sendPasswordResetEmail(email: string) {
  try {
    const result = await auth.api.forgetPassword({
      body: {
        email,
        redirectTo: "/auth/reset-password",
      },
      headers: await headers(),
    });

    if (result) {
      return {
        success: true,
        message: "Password reset email sent successfully",
      };
    }

    return {
      success: false,
      message: "Failed to send password reset email",
    };
  } catch (error: any) {
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
      message: error.message || "Failed to send password reset email",
    };
  }
}
