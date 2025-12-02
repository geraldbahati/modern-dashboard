"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@workspace/ui/components/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { useState, useEffect } from "react";

import { Key } from "lucide-react";
import {
  SUPPORTED_OAUTH_PROVIDERS,
  SUPPORTED_OAUTH_PROVIDER_DETAILS,
  type SupportedOAuthProvider,
} from "@/lib/o-auth-providers";
import {
  authClient,
  signInWithGitHub,
  signInWithGoogle,
} from "@workspace/auth/client";

const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [socialLoading, setSocialLoading] =
    useState<SupportedOAuthProvider | null>(null);
  const [isPasskeySupported, setIsPasskeySupported] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "admin+ufpf5ze0@example.com",
      password: "Admin@123",
    },
  });

  // Check passkey support and enable conditional UI
  useEffect(() => {
    const checkPasskeySupport = async () => {
      // Check if WebAuthn is supported in the browser
      if (
        typeof window !== "undefined" &&
        typeof PublicKeyCredential !== "undefined"
      ) {
        setIsPasskeySupported(true);

        // Check if conditional mediation is available for autofill
        if (
          PublicKeyCredential.isConditionalMediationAvailable &&
          (await PublicKeyCredential.isConditionalMediationAvailable())
        ) {
          // Preload passkeys for conditional UI (autofill)
          void authClient.signIn.passkey({ autoFill: true });
        }
      }
    };

    checkPasskeySupport();
  }, []);

  const onSubmit = async (data: SignInFormData) => {
    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      console.log("Sign in result:", result);

      if (result.error) {
        // Check for email verification required
        // Better Auth returns specific error messages/codes for unverified emails
        const errorMessage = result.error.message?.toLowerCase() || "";
        if (
          errorMessage.includes("verify") ||
          errorMessage.includes("verification") ||
          errorMessage.includes("not verified") ||
          result.error.status === 401
        ) {
          // Email not verified - redirect to verify email page with from=login param
          console.log("Email not verified, redirecting to verify-email page");
          router.push(
            `/auth/verify-email?email=${encodeURIComponent(data.email)}&from=login`
          );
          return;
        }

        // Check for rate limit error
        if (result.error.status === 429) {
          setError("root", {
            message:
              "Too many login attempts. Please wait a minute and try again.",
          });
          return;
        }

        // Check for bot detection
        if (result.error.status === 403) {
          setError("root", {
            message:
              "Access denied. Please try again later or contact support.",
          });
          return;
        }

        setError("root", {
          message: result.error.message || "Invalid email or password",
        });
      } else {
        // Successfully signed in, redirect to callback URL or home
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error: unknown) {
      console.error("Sign in error:", error);
      // Handle network errors or unexpected errors
      const err = error as { status?: number; message?: string };

      if (err.status === 429) {
        setError("root", {
          message:
            "Too many login attempts. Please wait a minute and try again.",
        });
      } else if (err.status === 403) {
        setError("root", {
          message: "Access denied. Please try again later or contact support.",
        });
      } else {
        setError("root", {
          message: "An unexpected error occurred. Please try again.",
        });
      }
    }
  };

  // OAuth provider sign-in handlers
  const oauthHandlers: Record<
    SupportedOAuthProvider,
    (callbackUrl?: string) => Promise<void>
  > = {
    google: signInWithGoogle,
    github: signInWithGitHub,
  };

  const handleOAuthSignIn = async (provider: SupportedOAuthProvider) => {
    try {
      setSocialLoading(provider);
      await oauthHandlers[provider](callbackUrl);
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      setError("root", {
        message: `Failed to sign in with ${SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].name}. Please try again.`,
      });
      setSocialLoading(null);
    }
  };

  const handlePasskeySignIn = async () => {
    try {
      await authClient.signIn.passkey({
        autoFill: false,
        fetchOptions: {
          onSuccess() {
            router.push(callbackUrl);
            router.refresh();
          },
          onError(context) {
            console.error("Passkey authentication failed:", context.error);
            setError("root", {
              message:
                context.error.message || "Failed to sign in with passkey",
            });
          },
        },
      });
    } catch (error) {
      console.error("Passkey sign in error:", error);
      setError("root", {
        message: "Failed to sign in with passkey. Please try again.",
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Enter your email and password to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <FieldSet>
              <FieldGroup>
                {errors.root && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {errors.root.message}
                  </div>
                )}
                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="signin-email">Email</FieldLabel>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="m@example.com"
                    aria-invalid={!!errors.email}
                    disabled={isSubmitting}
                    autoComplete="username webauthn"
                    {...register("email")}
                  />
                  {errors.email && (
                    <FieldError>{errors.email.message}</FieldError>
                  )}
                </Field>
                <Field data-invalid={!!errors.password}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="signin-password">Password</FieldLabel>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    aria-invalid={!!errors.password}
                    disabled={isSubmitting}
                    {...register("password")}
                  />
                  {errors.password && (
                    <FieldError>{errors.password.message}</FieldError>
                  )}
                </Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator>Or continue with</FieldSeparator>
            <FieldSet>
              <FieldGroup>
                {isPasskeySupported && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handlePasskeySignIn}
                    disabled={isSubmitting || socialLoading !== null}
                    className="w-full"
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Sign in with Passkey
                  </Button>
                )}
                <div className="grid grid-cols-2 gap-4 w-full">
                  {SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
                    const { name, icon: Icon } =
                      SUPPORTED_OAUTH_PROVIDER_DETAILS[provider];
                    return (
                      <Button
                        key={provider}
                        variant="outline"
                        type="button"
                        onClick={() => handleOAuthSignIn(provider)}
                        disabled={isSubmitting || socialLoading !== null}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {socialLoading === provider ? "Connecting..." : name}
                      </Button>
                    );
                  })}
                </div>
              </FieldGroup>
            </FieldSet>
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Don&apos;t have an account?{" "}
              </span>
              <Link
                href="/auth/sign-up"
                className="font-medium underline hover:text-primary transition-colors"
              >
                Sign up
              </Link>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
