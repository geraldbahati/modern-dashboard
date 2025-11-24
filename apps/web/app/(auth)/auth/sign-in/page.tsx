import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { connection } from "next/server";
import { SignIn } from "./_components/sign-in";
import { SignInSkeleton } from "./_components/sign-in-skeleton";
import { auth } from "@workspace/auth/next";

type LoginPageProps = {
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

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center w-full">
      <Suspense fallback={null}>
        <AuthCheck searchParams={searchParams} />
      </Suspense>

      <div className="mx-auto w-full my-6 px-4 flex justify-center">
        <Suspense fallback={<SignInSkeleton />}>
          <SignIn />
        </Suspense>
      </div>
    </main>
  );
}
