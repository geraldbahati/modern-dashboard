import { Suspense } from "react";
import { TwoFactorVerificationForm } from "./_components/two-factor-verification-form";
import { Skeleton } from "@workspace/ui/components/skeleton";

export default function TwoFactorVerificationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<FormSkeleton />}>
        <TwoFactorVerificationForm />
      </Suspense>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="w-full max-w-md space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
