"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, Layout, MoreVertical } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { DataTableColumnHeader } from "../../_components/data-table/data-table-column-header";

export type Project = {
  id: string;
  name: string;
  description: string;
  status: "Ready" | "In Progress" | "Blocked";
  environment: "Production" | "Development" | "Staging";
  lastUpdated: string;
};

export const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background">
            <Layout className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{row.getValue("name")}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.description}
            </span>
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

      let variant = "secondary";
      let className = "border-0";

      if (status === "Ready") {
        className +=
          " bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25";
      } else if (status === "In Progress") {
        className += " bg-amber-500/15 text-amber-500 hover:bg-amber-500/25";
      } else if (status === "Blocked") {
        className += " bg-red-500/15 text-red-500 hover:bg-red-500/25";
      }

      return (
        <Badge variant="secondary" className={className}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "environment",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Environment" />
    ),
  },
  {
    accessorKey: "lastUpdated",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
