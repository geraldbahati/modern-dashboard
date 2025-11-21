import { createAuthClient } from "better-auth/react";
import type { Auth } from "./types";
import {
  inferAdditionalFields,
  adminClient,
  multiSessionClient,
  twoFactorClient,
  passkeyClient,
  organizationClient,
} from "better-auth/client/plugins";
import {
  ac,
  admin as adminRole,
  moderator,
  editor,
  user as userRole,
} from "./permissions";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3001/api/auth",
  plugins: [
    inferAdditionalFields<Auth>(),
    adminClient({
      // Configure access control with custom roles
      ac,
      roles: {
        admin: adminRole,
        moderator,
        editor,
        user: userRole,
      },
    }),
    multiSessionClient(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        window.location.href = "/auth/verify-2fa";
      },
    }),
    passkeyClient(),
    organizationClient(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;

export type Session = typeof authClient.$Infer.Session;

/**
 * Sign in with GitHub OAuth
 */
export const signInWithGitHub = async () => {
  await authClient.signIn.social({
    provider: "github",
    callbackURL: "/", // Redirect to home page after sign in
  });
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/", // Redirect to home page after sign in
  });
};
