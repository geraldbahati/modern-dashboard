"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, FolderKanban } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { cn } from "@workspace/ui/lib/utils";

export type Project = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  imageUrl: string | null;
  ownerId: string;
  status: "active" | "archived" | "deleted";
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const project = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-muted rounded-md border border-border flex-shrink-0">
            <FolderKanban className="w-4 h-4 text-foreground" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-foreground truncate">
              {project.name}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {project.description || "No description"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Project["status"];
      const statusConfig = {
        active: {
          label: "Active",
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-900/40",
        },
        archived: {
          label: "Archived",
          className:
            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-900/40",
        },
        deleted: {
          label: "Deleted",
          className:
            "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-900/40",
        },
      };

      const config = statusConfig[status] || {
        label: status,
        className:
          "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-300 dark:border-gray-900/40",
      };

      return (
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize",
            config.className
          )}
        >
          {config.label}
        </span>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as Date;
      const formatted = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(date));
      return <span className="text-muted-foreground">{formatted}</span>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: () => {
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Edit project</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Delete project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
