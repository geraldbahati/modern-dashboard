import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { connection } from "next/server";
import { auth } from "@workspace/auth/next";
import { VerifyEmailContent } from "./_components/verify-email-content";
import { Skeleton } from "@workspace/ui/components/skeleton";

type VerifyEmailPageProps = {
  searchParams: Promise<{ email?: string; from?: string }>;
};

async function VerifyEmailWrapper({ searchParams }: VerifyEmailPageProps) {
  // Explicitly defer to request time - prevents prerendering errors
  await connection();

  const params = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  // Get email from query params or session
  const email = params.email || session?.user.email;
  // Check if user is coming from a login attempt
  const fromLogin = params.from === "login";

  // If no email in query params and no session, redirect to login
  if (!email) {
    redirect("/auth/login");
  }

  // If email is already verified and user is logged in, redirect to home
  if (session?.user.emailVerified) {
    redirect("/");
  }

  return <VerifyEmailContent email={email} fromLogin={fromLogin} />;
}

function VerifyEmailSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export default function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  return (
    <Suspense fallback={<VerifyEmailSkeleton />}>
      <VerifyEmailWrapper searchParams={searchParams} />
    </Suspense>
  );
}
