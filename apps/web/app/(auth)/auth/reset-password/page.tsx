import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "./_components/reset-password-form";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Card, CardHeader } from "@workspace/ui/components/card";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

async function ResetPasswordWrapper({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token;

  // If no token, redirect to forgot password page
  if (!token) {
    redirect("/auth/forgot-password");
  }

  return <ResetPasswordForm token={token} />;
}

function ResetPasswordSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </CardHeader>
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordWrapper searchParams={searchParams} />
    </Suspense>
  );
}
