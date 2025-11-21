import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { authDb } from "@workspace/db/auth-db";
import { betterAuth, BetterAuthOptions } from "better-auth";
import {
  admin,
  multiSession,
  organization,
  twoFactor,
  openAPI,
} from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { nextCookies } from "better-auth/next-js";
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrganizationInvitation,
} from "./email";
import {
  ac,
  admin as adminRole,
  moderator,
  editor,
  user as userRole,
} from "./permissions";

// Define the input needed from the specific app
interface AuthConfigParams {
  baseURL: string;
  trustedOrigins: string[];
}

export const getAuthConfig = (params: AuthConfigParams): BetterAuthOptions => {
  return {
    database: drizzleAdapter(authDb, { provider: "pg" }),

    // These come from the App, ensuring they are always correct for the environment
    baseURL: params.baseURL,
    trustedOrigins: params.trustedOrigins,
    secret: process.env.BETTER_AUTH_SECRET,

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        await sendPasswordResetEmail({ user, url });
      },
    },
    emailVerification: {
      autoSignInAfterVerification: true,
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendVerificationEmail({ user, url });
      },
      afterEmailVerification: async (user) => {
        await sendWelcomeEmail({ user });
      },
    },
    user: {
      deleteUser: { enabled: true },
      changeEmail: {
        enabled: true,
        sendChangeEmailVerification: async ({ user, newEmail, url }) => {
          await sendVerificationEmail({
            user: { ...user, email: newEmail },
            url,
          });
        },
      },
    },
    session: {
      cookieCache: { enabled: true, maxAge: 60 * 60 * 24 * 30 },
    },
    plugins: [
      nextCookies(),
      admin({
        ac,
        roles: { admin: adminRole, moderator, editor, user: userRole },
        defaultRole: "user",
      }),
      twoFactor(),
      multiSession({ maximumSessions: 10 }),
      organization({
        async sendInvitationEmail(data) {
          await sendOrganizationInvitation({
            ...data,
            expiresAt: data.invitation.expiresAt,
          });
        },
        organizationLimit: 5,
        invitationExpiresIn: 60 * 60 * 24 * 7,
      }),
      passkey({
        rpName: "Better Auth App",
        // Passkey relies on the Frontend URL, so we derive it from trustedOrigins or pass explicitly
        rpID: new URL(params.baseURL).hostname,
        origin: params.trustedOrigins[0],
      }),
      openAPI(),
    ],
  };
};

// Default auth instance for CLI usage (schema generation, etc.)
// Apps should use getAuthConfig() with their specific baseURL and trustedOrigins
export const auth = betterAuth(
  getAuthConfig({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
  })
);
