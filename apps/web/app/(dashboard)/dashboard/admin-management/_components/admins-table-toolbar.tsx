"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { RotateCcw, Search } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

interface AdminsTableToolbarProps<TData> {
  table: Table<TData>;
}

function ToolbarInput({
  value: initialValue,
  onChange,
  debounce = 300,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

export function AdminsTableToolbar<TData>({
  table,
}: AdminsTableToolbarProps<TData>) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <span className="text-sm font-medium">Search</span>
          <ToolbarInput
            placeholder="Search admins..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(value) => table.getColumn("name")?.setFilterValue(value)}
            className="h-9"
          />
        </div>
        <div className="space-y-2">
          <span className="text-sm font-medium">Email</span>
          <ToolbarInput
            placeholder="Filter by email"
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(value) =>
              table.getColumn("email")?.setFilterValue(value)
            }
            className="h-9"
          />
        </div>
        <div className="space-y-2">
          <span className="text-sm font-medium">Phone</span>
          <ToolbarInput
            placeholder="Filter by phone"
            value={(table.getColumn("phone")?.getFilterValue() as string) ?? ""}
            onChange={(value) =>
              table.getColumn("phone")?.setFilterValue(value)
            }
            className="h-9"
          />
        </div>
        <div className="space-y-2">
          <span className="text-sm font-medium">Name</span>
          <ToolbarInput
            placeholder="Search by first/last name"
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(value) => table.getColumn("name")?.setFilterValue(value)}
            className="h-9"
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button className="h-9">
          <Search className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button
          variant="outline"
          className="h-9"
          onClick={() => table.resetColumnFilters()}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
