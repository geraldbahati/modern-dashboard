"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Code,
  Smartphone,
  LayoutDashboard,
  Cloud,
} from "lucide-react";
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
  description: string;
  status: "Ready" | "In Progress" | "Failed";
  lastUpdated: string;
  icon: React.ElementType;
};

export const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const project = row.original;
      const Icon = project.icon;
      return (
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-muted rounded-md border border-border flex-shrink-0">
            <Icon className="w-4 h-4 text-foreground" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-foreground truncate">
              {project.name}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {project.description}
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
      const status = row.getValue("status") as string;
      let badgeClass = "";

      switch (status) {
        case "Ready":
          badgeClass =
            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-900/40";
          break;
        case "In Progress":
          badgeClass =
            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-900/40";
          break;
        case "Failed":
          badgeClass =
            "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-900/40";
          break;
        default:
          badgeClass =
            "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-300 dark:border-gray-900/40";
      }

      return (
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
            badgeClass
          )}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground">
          {row.getValue("lastUpdated")}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
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
