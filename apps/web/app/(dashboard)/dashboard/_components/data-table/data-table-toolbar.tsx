"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { X, Search, RotateCcw } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filterFields?: {
    key: string;
    label: string;
    placeholder?: string;
  }[];
  children?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  filterFields = [],
  children,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="flex flex-1 items-center space-x-2">
        {filterFields.map((field) => {
          const column = table.getColumn(field.key);
          if (!column) return null;

          return (
            <div key={field.key} className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={field.placeholder || `Filter ${field.label}...`}
                value={(column.getFilterValue() as string) ?? ""}
                onChange={(event) => column.setFilterValue(event.target.value)}
                className="h-8 w-[200px] pl-9"
              />
            </div>
          );
        })}
        {children}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <RotateCcw className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
