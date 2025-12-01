"use client";

import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  twoFactorEnabled: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

interface UserActionsProps {
  user: User;
}

export function UserActions({ user }: UserActionsProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    ...orpc.users.delete.mutationOptions(),
    onSuccess: () => {
      toast.success("User deleted successfully");
      // Invalidate both users list and metrics queries
      queryClient.invalidateQueries({ queryKey: ["orpc", "users", "list"] });
      queryClient.invalidateQueries({ queryKey: ["orpc", "users", "metrics"] });
    },
    onError: () => {
      toast.error("Failed to delete user");
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteMutation.mutate({
        userId: user.id,
        permanent: false,
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          disabled={deleteMutation.isPending}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(user.id)}
        >
          Copy user ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>View details</DropdownMenuItem>
        <DropdownMenuItem>Edit user</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
          Delete user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
