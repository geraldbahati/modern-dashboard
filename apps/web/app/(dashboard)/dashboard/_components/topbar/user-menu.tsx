"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ChevronDown, LogOut, Settings, User, Loader2 } from "lucide-react";
import { useSession, signOut } from "@workspace/auth/client";
import { useState } from "react";

export function UserMenu() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Sign out failed:", error);
      setIsSigningOut(false);
    }
  };

  // Show skeleton while loading
  if (isPending) {
    return <UserMenuSkeleton />;
  }

  // If no session, show sign in link
  if (!session?.user) {
    return (
      <Link
        href="/auth/login"
        className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium hover:bg-accent/50 transition-colors"
      >
        Sign in
      </Link>
    );
  }

  const user = {
    name: session.user.name || "User",
    avatar: session.user.image || undefined,
    email: session.user.email,
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center gap-2 rounded-full border px-3 py-2 outline-none hover:bg-accent/50 data-[state=open]:bg-accent/50 transition-colors ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <Avatar className="size-6">
          <AvatarImage src={user.avatar} alt={`Avatar for ${user.name}`} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{user.name.split(" ")[0]}</span>
        <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px] p-2">
        <div className="flex items-center gap-3 p-2">
          <Avatar className="size-10">
            <AvatarImage src={user.avatar} alt={`Avatar for ${user.name}`} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5 leading-none">
            <div className="font-semibold truncate text-sm">{user.name}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[140px]">
              {user.email}
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/dashboard/profile" className="flex items-center gap-2 w-full">
            <User className="size-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/dashboard/settings" className="flex items-center gap-2 w-full">
            <Settings className="size-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          {isSigningOut ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          <span>{isSigningOut ? "Signing out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenuSkeleton() {
  return (
    <div className="flex items-center gap-2 rounded-full border px-3 py-2">
      <Skeleton className="size-6 rounded-full" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="size-4" />
    </div>
  );
}
