"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Field,
  FieldDescription,
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
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
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
import { toast } from "sonner";
import { Key } from "lucide-react";

const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const router = useRouter();
  const [socialLoading, setSocialLoading] =
    useState<SupportedOAuthProvider | null>(null);
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      console.log("Sign up result:", result);

      // Check if there's an error
      if (result.error) {
        console.error("Sign up error:", result.error);
        setError("root", {
          message: result.error.message || "Failed to create account",
        });
        return;
      }

      // Store email for passkey prompt
      setUserEmail(data.email);

      // Always redirect to verify email page after signup
      // Even if there's no explicit success, the email was sent
      console.log("Redirecting to verify email page with email:", data.email);
      const verifyUrl = `/auth/verify-email?email=${encodeURIComponent(data.email)}`;
      console.log("Verify URL:", verifyUrl);

      // Redirect to verify email page
      router.push(verifyUrl);
    } catch (error) {
      console.error("Unexpected sign up error:", error);
      setError("root", {
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handleAddPasskey = async () => {
    try {
      const result = await authClient.passkey.addPasskey({
        name: `${userEmail} - Browser`,
      });

      if (result?.error) {
        toast.error(result.error.message || "Failed to add passkey");
        setShowPasskeyPrompt(false);
        // Redirect anyway
        router.push(
          `/auth/verify-email?email=${encodeURIComponent(userEmail)}`
        );
        return;
      }

      toast.success("Passkey added successfully!");
      setShowPasskeyPrompt(false);
      router.push(`/auth/verify-email?email=${encodeURIComponent(userEmail)}`);
    } catch (error) {
      console.error("Add passkey error:", error);
      toast.error("Failed to add passkey");
      setShowPasskeyPrompt(false);
      router.push(`/auth/verify-email?email=${encodeURIComponent(userEmail)}`);
    }
  };

  const handleSkipPasskey = () => {
    setShowPasskeyPrompt(false);
    router.push(`/auth/verify-email?email=${encodeURIComponent(userEmail)}`);
  };

  // OAuth provider sign-up handlers
  const oauthHandlers: Record<SupportedOAuthProvider, () => Promise<void>> = {
    google: signInWithGoogle,
    github: signInWithGitHub,
  };

  const handleOAuthSignUp = async (provider: SupportedOAuthProvider) => {
    try {
      setSocialLoading(provider);
      await oauthHandlers[provider]();
    } catch (error) {
      console.error(`${provider} sign up error:`, error);
      setError("root", {
        message: `Failed to sign up with ${SUPPORTED_OAUTH_PROVIDER_DETAILS[provider].name}. Please try again.`,
      });
      setSocialLoading(null);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>
          Enter your information to create an account
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
                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor="signup-name">Full Name</FieldLabel>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    aria-invalid={!!errors.name}
                    disabled={isSubmitting}
                    {...register("name")}
                  />
                  {errors.name && (
                    <FieldError>{errors.name.message}</FieldError>
                  )}
                </Field>
                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="m@example.com"
                    aria-invalid={!!errors.email}
                    disabled={isSubmitting}
                    {...register("email")}
                  />
                  {errors.email && (
                    <FieldError>{errors.email.message}</FieldError>
                  )}
                </Field>
                <Field data-invalid={!!errors.password}>
                  <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    aria-invalid={!!errors.password}
                    disabled={isSubmitting}
                    {...register("password")}
                  />
                  <FieldDescription>
                    Must be at least 8 characters with uppercase, lowercase, and
                    number
                  </FieldDescription>
                  {errors.password && (
                    <FieldError>{errors.password.message}</FieldError>
                  )}
                </Field>
                <Field data-invalid={!!errors.confirmPassword}>
                  <FieldLabel htmlFor="signup-confirm-password">
                    Confirm Password
                  </FieldLabel>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    aria-invalid={!!errors.confirmPassword}
                    disabled={isSubmitting}
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <FieldError>{errors.confirmPassword.message}</FieldError>
                  )}
                </Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator>Or continue with</FieldSeparator>
            <FieldSet>
              <FieldGroup>
                <div className="grid grid-cols-2 gap-4 w-full">
                  {SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
                    const { name, icon: Icon } =
                      SUPPORTED_OAUTH_PROVIDER_DETAILS[provider];
                    return (
                      <Button
                        key={provider}
                        variant="outline"
                        type="button"
                        onClick={() => handleOAuthSignUp(provider)}
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
            <FieldSeparator />
            <div className="text-center text-sm mb-4">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link
                href="/auth/sign-in"
                className="font-medium underline hover:text-primary transition-colors"
              >
                Sign in
              </Link>
            </div>
            <FieldSet>
              <p className="text-sm text-muted-foreground text-center">
                By signing up, you agree to our{" "}
                <a
                  href="#"
                  className="underline hover:text-foreground transition-colors"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="underline hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </a>
              </p>
            </FieldSet>
          </FieldGroup>
        </form>
      </CardContent>

      {/* Passkey Setup Prompt Dialog */}
      <AlertDialog open={showPasskeyPrompt} onOpenChange={setShowPasskeyPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Set Up Passkey?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to add a passkey for faster, passwordless sign-in?
              You can use your device&apos;s biometrics (Face ID, Touch ID,
              Windows Hello) or a security key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleSkipPasskey}>
              Skip for now
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAddPasskey}>
              Add Passkey
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
