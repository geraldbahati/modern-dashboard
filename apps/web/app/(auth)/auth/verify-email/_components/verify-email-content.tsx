import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ResendButton } from "./resend-button";
import { Mail, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import Link from "next/link";

type VerifyEmailContentProps = {
  email: string;
  fromLogin?: boolean;
};

export function VerifyEmailContent({
  email,
  fromLogin = false,
}: VerifyEmailContentProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {fromLogin ? "Verify your email to continue" : "Check your email"}
          </CardTitle>
          <CardDescription>
            We&apos;ve sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email verification required notice (for login attempts) */}
          {fromLogin && (
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Email verification required</AlertTitle>
              <AlertDescription>
                You must verify your email address before you can sign in.
                Please check your inbox and click the verification link.
              </AlertDescription>
            </Alert>
          )}

          {/* Email sent confirmation */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Email sent successfully</AlertTitle>
            <AlertDescription>
              A verification email has been sent to{" "}
              <span className="font-medium">{email}</span>
            </AlertDescription>
          </Alert>

          {/* Instructions */}
          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Next steps:</p>
            <ol className="list-inside list-decimal space-y-2">
              <li>Check your inbox for an email from us</li>
              <li>Click the verification link in the email</li>
              <li>You&apos;ll be automatically redirected once verified</li>
            </ol>
          </div>

          {/* Important notice */}
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Can&apos;t find the email?</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                Check your spam or junk folder. If you still can&apos;t find it,
                you can request a new one below.
              </p>
            </AlertDescription>
          </Alert>

          {/* Resend button */}
          <ResendButton email={email} />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          {/* Back to home */}
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Return to home page
            </Link>
          </div>

          {/* Security notice */}
          <div className="rounded-lg bg-muted p-4 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Security tip</p>
            <p>
              The verification link will expire after 24 hours. If it expires,
              you can request a new one using the button above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
