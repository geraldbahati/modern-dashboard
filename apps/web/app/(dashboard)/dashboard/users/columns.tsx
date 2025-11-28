"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Badge } from "@workspace/ui/components/badge";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { DataTableColumnHeader } from "../_components/data-table/data-table-column-header";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "verified" | "unverified";
  joinedDate: string;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground">{row.getValue("email")}</span>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground">{row.getValue("phone")}</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={status === "verified" ? "default" : "secondary"}
          className={
            status === "verified"
              ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
              : "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
          }
        >
          {status === "verified" ? "Verified" : "Unverified"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "joinedDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined Date" />
    ),
    cell: ({ row }) => {
      return <span>{row.getValue("joinedDate")}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            <Eye className="h-4 w-4" />
            <span>View</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
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
              <DropdownMenuItem className="text-destructive">
                Delete user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
