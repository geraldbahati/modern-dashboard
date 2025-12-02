"use client";

import Image from "next/image";
import { useSession } from "@workspace/auth/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending) {
      if (session) {
        router.push("/dashboard");
      } else {
        router.push("/auth/sign-in");
      }
    }
  }, [session, isPending, router]);

  // Always return null as this page is now just a redirection handler
  return null;
}
