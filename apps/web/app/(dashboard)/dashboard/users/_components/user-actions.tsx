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
import { deleteUser, type User } from "../_lib/actions";
import { useTransition } from "react";
import { toast } from "sonner";

interface UserActionsProps {
  user: User;
}

export function UserActions({ user }: UserActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this user?")) {
      startTransition(async () => {
        const result = await deleteUser(user.id);
        if (result.success) {
          toast.success("User deleted successfully");
        } else {
          toast.error("Failed to delete user");
        }
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
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
