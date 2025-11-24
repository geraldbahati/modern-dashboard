"use server";

import { auth } from "@workspace/auth/next";
import { headers } from "next/headers";

export async function resetPassword(token: string, password: string) {
  try {
    const result = await auth.api.resetPassword({
      body: {
        token,
        newPassword: password,
      },
      headers: await headers(),
    });

    if (result) {
      return {
        success: true,
        message: "Password reset successfully",
      };
    }

    return {
      success: false,
      message: "Failed to reset password",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to reset password",
    };
  }
}
