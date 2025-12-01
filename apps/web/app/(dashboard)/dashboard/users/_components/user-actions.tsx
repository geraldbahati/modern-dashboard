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
  const queryKey = orpc.users.list.queryKey();

  const deleteMutation = useMutation({
    ...orpc.users.delete.mutationOptions(),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(queryKey);

      // Optimistically update to remove the user
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old?.users) return old;
        return {
          ...old,
          users: old.users.filter((u: User) => u.id !== user.id),
          pagination: {
            ...old.pagination,
            totalItems: old.pagination.totalItems - 1,
          },
        };
      });

      return { previousUsers };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(queryKey, context.previousUsers);
      }
      toast.error("Failed to delete user");
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
    },
    onSettled: () => {
      // Refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: orpc.users.metrics.queryKey() });
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
