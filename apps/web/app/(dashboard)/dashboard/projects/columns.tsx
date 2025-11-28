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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { DataTableColumnHeader } from "../_components/data-table/data-table-column-header";
import { Project } from "@workspace/api/schemas";

export type DisplayProject = Project & {
  lastUpdated: string;
};

export const columns: ColumnDef<DisplayProject>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const description = row.original.description;
      const imageUrl = row.original.imageUrl;

      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg border bg-muted/50 flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-muted-foreground">
                {name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium leading-none">{name}</span>
            {description && (
              <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                {description}
              </span>
            )}
          </div>
        </div>
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

      let variant: "default" | "secondary" | "destructive" | "outline" =
        "secondary";
      let className = "";

      switch (status) {
        case "ready":
        case "completed":
        case "active":
          variant = "default";
          className =
            "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
          break;
        case "in_progress":
          variant = "secondary";
          className = "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
          break;
        case "blocked":
        case "deleted":
          variant = "destructive";
          break;
        default:
          variant = "secondary";
      }

      return (
        <Badge variant={variant} className={className}>
          {status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Badge>
      );
    },
  },
  {
    accessorKey: "environment",
    header: "Environment",
    cell: ({ row }) => {
      // Mock environment since it's not in schema yet, or use a placeholder
      // Assuming we might add it later or infer it.
      // For now, let's just show "Production" as a placeholder or nothing if not available.
      // Or if we want to match the design, we can hardcode or randomise for demo if data missing.
      // But better to leave empty or show a default.
      return <span>Production</span>;
    },
  },
  {
    accessorKey: "lastUpdated",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
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
    cell: ({ row }) => {
      const project = row.original;

      return (
        <div className="flex items-center justify-end gap-2">
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
                onClick={() => navigator.clipboard.writeText(project.id)}
              >
                Copy project ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
