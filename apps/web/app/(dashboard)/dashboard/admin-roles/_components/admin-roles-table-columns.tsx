"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreVertical, Shield } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { DataTableColumnHeader } from "../../_components/data-table/data-table-column-header";

export type AdminRole = {
  id: string;
  name: string;
  guardName: string;
  createdDate: string;
  updatedDate: string;
};

export const columns: ColumnDef<AdminRole>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background">
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{row.getValue("name")}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.guardName}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "guardName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Guard Name" />
    ),
  },
  {
    accessorKey: "createdDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created Date" />
    ),
  },
  {
    accessorKey: "updatedDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated Date" />
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
