import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { connection } from "next/server";
import { SignUp } from "./_components/sign-up";
import { SignUpSkeleton } from "./_components/sign-up-skeleton";
import { auth } from "@workspace/auth/next";

type SignUpPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

// Component that handles authentication check and redirect
async function AuthCheck({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  // Explicitly defer to request time - prevents prerendering errors
  await connection();

  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    const params = await searchParams;
    const callbackUrl = params.callbackUrl || "/";
    redirect(callbackUrl);
  }

  return null;
}

export default function SignUpPage({ searchParams }: SignUpPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center w-full">
      {/* Wrap auth check in Suspense to allow partial prerendering */}
      <Suspense fallback={null}>
        <AuthCheck searchParams={searchParams} />
      </Suspense>

      <div className="mx-auto w-full my-6 px-4 flex justify-center">
        <Suspense fallback={<SignUpSkeleton />}>
          <SignUp />
        </Suspense>
      </div>
    </main>
  );
}
