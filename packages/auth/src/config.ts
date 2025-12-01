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
import {
  ac,
  admin as adminRole,
  moderator,
  editor,
  user as userRole,
} from "./permissions";

// Define the input needed from the specific app
export interface AuthConfigParams {
  baseURL: string;
  trustedOrigins: string[];
  basePath?: string;
}

/**
 * Base auth configuration shared between all frameworks
 * Does NOT include framework-specific plugins (like nextCookies)
 */
export const getBaseAuthConfig = (
  params: AuthConfigParams
): BetterAuthOptions => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    database: drizzleAdapter(authDb, { provider: "pg" }),
    baseURL: params.baseURL,
    basePath: params.basePath || "/api/auth",
    trustedOrigins: params.trustedOrigins,
    secret: process.env.BETTER_AUTH_SECRET,

    // Social OAuth providers
    socialProviders: {
      // Google OAuth - requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
      ...(process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET && {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }),
      // GitHub OAuth - requires GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET
      ...(process.env.GITHUB_CLIENT_ID &&
        process.env.GITHUB_CLIENT_SECRET && {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }),
    },

    // Account linking for social providers
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google", "github"],
      },
    },

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        const { sendPasswordResetEmail } = await import("./email");
        await sendPasswordResetEmail({ user, url });
      },
    },
    emailVerification: {
      autoSignInAfterVerification: true,
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url }) => {
        const { sendVerificationEmail } = await import("./email");
        await sendVerificationEmail({ user, url });
      },
      afterEmailVerification: async (user) => {
        const { sendWelcomeEmail } = await import("./email");
        await sendWelcomeEmail({ user });
      },
    },
    user: {
      deleteUser: { enabled: true },
      changeEmail: {
        enabled: true,
        sendChangeEmailVerification: async ({ user, newEmail, url }) => {
          const { sendVerificationEmail } = await import("./email");
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
      admin({
        ac,
        roles: { admin: adminRole, moderator, editor, user: userRole },
        defaultRole: "user",
      }),
      twoFactor(),
      multiSession({ maximumSessions: 10 }),
      organization({
        async sendInvitationEmail(data) {
          const { sendOrganizationInvitation } = await import("./email");
          await sendOrganizationInvitation({
            ...data,
            expiresAt: data.invitation.expiresAt,
          });
        },
        organizationLimit: 5,
        invitationExpiresIn: 60 * 60 * 24 * 7,
      }),
      passkey({
        rpName: "Modern Dashboard",
        rpID: new URL(params.baseURL).hostname,
        origin: params.trustedOrigins[0] || params.baseURL,
      }),
      openAPI(),
    ],
    advanced: {
      defaultCookieAttributes: {
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
        httpOnly: true,
        path: "/",
      },
    },
  };
};

/**
 * Create auth instance for generic/API usage
 * Use this for Hono, Express, or other non-Next.js frameworks
 */
export const createAuth = (params: AuthConfigParams) => {
  return betterAuth(getBaseAuthConfig(params));
};

// Legacy export for backwards compatibility and CLI usage
export const getAuthConfig = getBaseAuthConfig;

// Default auth instance for CLI usage (schema generation, etc.)
export const auth = betterAuth(
  getBaseAuthConfig({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
  })
);
