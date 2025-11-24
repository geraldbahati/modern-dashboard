import { Resend } from "resend";

// Initialize Resend with API key
// Use a placeholder during build/CLI time if the key is not set
const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

// Get the from email from environment or use Resend's development email
// For production, set RESEND_FROM_EMAIL to your verified domain email
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// Frontend URL for email links (defaults to Next.js frontend)
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

type User = {
  id: string;
  email: string;
  name: string;
};

/**
 * Send email verification link to user
 * This is called when a user signs up or requests a new verification email
 */
export async function sendVerificationEmail({
  user,
  url,
}: {
  user: User;
  url: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: "Verify your email address",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify your email</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0;">
              <h1 style="color: #1a1a1a; margin-bottom: 20px; font-size: 24px;">Verify your email address</h1>

              <p style="margin-bottom: 20px; font-size: 16px;">Hi ${user.name || "there"},</p>

              <p style="margin-bottom: 20px; font-size: 16px;">
                Thank you for signing up! Please verify your email address by clicking the button below:
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${url}"
                   style="background-color: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>

              <p style="margin-bottom: 20px; font-size: 14px; color: #666;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="word-break: break-all; font-size: 14px; color: #0066cc; background-color: #f0f0f0; padding: 10px; border-radius: 4px;">
                ${url}
              </p>

              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </div>

            <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
              This email was sent from an automated system. Please do not reply.
            </p>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending verification email:", error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }

    console.log("Verification email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in sendVerificationEmail:", error);
    throw error;
  }
}

/**
 * Send password reset link to user
 * This is called when a user requests a password reset
 */
export async function sendPasswordResetEmail({
  user,
  url,
}: {
  user: User;
  url: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: "Reset your password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset your password</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0;">
              <h1 style="color: #1a1a1a; margin-bottom: 20px; font-size: 24px;">Reset your password</h1>

              <p style="margin-bottom: 20px; font-size: 16px;">Hi ${user.name || "there"},</p>

              <p style="margin-bottom: 20px; font-size: 16px;">
                We received a request to reset your password. Click the button below to choose a new password:
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${url}"
                   style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>

              <p style="margin-bottom: 20px; font-size: 14px; color: #666;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="word-break: break-all; font-size: 14px; color: #0066cc; background-color: #f0f0f0; padding: 10px; border-radius: 4px;">
                ${url}
              </p>

              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #856404;">
                  <strong>Security tip:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                </p>
              </div>
            </div>

            <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
              This email was sent from an automated system. Please do not reply.
            </p>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }

    console.log("Password reset email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in sendPasswordResetEmail:", error);
    throw error;
  }
}

/**
 * Send welcome email to new users after signup
 * This is called automatically after a user successfully signs up
 */
export async function sendWelcomeEmail({ user }: { user: User }) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: "Welcome! Your account is ready",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome!</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0;">
              <h1 style="color: #1a1a1a; margin-bottom: 20px; font-size: 28px;">Welcome to Better Auth! 🎉</h1>

              <p style="margin-bottom: 20px; font-size: 16px;">Hi ${user.name || "there"},</p>

              <p style="margin-bottom: 20px; font-size: 16px;">
                Thank you for signing up! We're excited to have you on board. Your account has been created successfully.
              </p>

              <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #2e7d32;">
                  <strong>What's next?</strong> Start exploring and make the most of your account!
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${FRONTEND_URL}"
                   style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Get Started
                </a>
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <h3 style="color: #1a1a1a; font-size: 18px; margin-bottom: 15px;">Quick Tips:</h3>
                <ul style="padding-left: 20px; color: #666; font-size: 14px;">
                  <li style="margin-bottom: 10px;">Keep your account secure by using a strong password</li>
                  <li style="margin-bottom: 10px;">Enable two-factor authentication for extra security</li>
                  <li style="margin-bottom: 10px;">Complete your profile to personalize your experience</li>
                </ul>
              </div>

              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                If you have any questions or need help, feel free to reach out to our support team.
              </p>
            </div>

            <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
              This email was sent from an automated system. Please do not reply.
            </p>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }

    console.log("Welcome email sent successfully to:", user.email, data);
    return data;
  } catch (error) {
    console.error("Error in sendWelcomeEmail:", error);
    // Don't throw error - we don't want to fail signup if welcome email fails
    // Just log it and continue
    return null;
  }
}

type OrganizationInvitationData = {
  id: string;
  email: string;
  role: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  inviter: {
    user: {
      name: string;
      email: string;
    };
  };
  expiresAt: Date;
};

/**
 * Send organization invitation email
 * This is called when a user is invited to join an organization
 */
export async function sendOrganizationInvitation(
  data: OrganizationInvitationData
) {
  try {
    const inviteLink = `${FRONTEND_URL}/organization/accept-invitation/${data.id}`;

    const { data: emailData, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `You've been invited to join ${data.organization.name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Organization Invitation</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin: 20px 0;">
              <h1 style="color: #1a1a1a; margin-bottom: 20px; font-size: 24px;">You've been invited! 🎉</h1>

              <p style="margin-bottom: 20px; font-size: 16px;">
                <strong>${data.inviter.user.name}</strong> (${data.inviter.user.email}) has invited you to join <strong>${data.organization.name}</strong> as a <strong>${data.role}</strong>.
              </p>

              <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #1565c0;">
                  <strong>Organization:</strong> ${data.organization.name}<br>
                  <strong>Role:</strong> ${data.role}<br>
                  <strong>Invited by:</strong> ${data.inviter.user.name}
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}"
                   style="background-color: #2196f3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Accept Invitation
                </a>
              </div>

              <p style="margin-bottom: 20px; font-size: 14px; color: #666;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="word-break: break-all; font-size: 14px; color: #0066cc; background-color: #f0f0f0; padding: 10px; border-radius: 4px;">
                ${inviteLink}
              </p>

              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #856404;">
                  <strong>Note:</strong> This invitation will expire on ${new Date(data.expiresAt).toLocaleDateString()} at ${new Date(data.expiresAt).toLocaleTimeString()}. If you didn't expect this invitation, you can safely ignore this email.
                </p>
              </div>
            </div>

            <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
              This email was sent from an automated system. Please do not reply.
            </p>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending organization invitation email:", error);
      throw new Error(
        `Failed to send organization invitation email: ${error.message}`
      );
    }

    console.log("Organization invitation email sent successfully:", emailData);
    return emailData;
  } catch (error) {
    console.error("Error in sendOrganizationInvitation:", error);
    throw error;
  }
}
