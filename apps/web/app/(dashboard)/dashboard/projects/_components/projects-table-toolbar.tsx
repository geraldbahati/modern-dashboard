"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { RotateCcw, Search } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

interface ProjectsTableToolbarProps<TData> {
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

export function ProjectsTableToolbar<TData>({
  table,
}: ProjectsTableToolbarProps<TData>) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <span className="text-sm font-medium">Search</span>
          <ToolbarInput
            placeholder="Search projects..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(value) => table.getColumn("name")?.setFilterValue(value)}
            className="h-9"
          />
        </div>
        <div className="space-y-2">
          <span className="text-sm font-medium">Name</span>
          <ToolbarInput
            placeholder="Search by project name"
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(value) => table.getColumn("name")?.setFilterValue(value)}
            className="h-9"
          />
        </div>
        <div className="space-y-2">
          <span className="text-sm font-medium">Filter by Status</span>
          <Select
            value={
              (table.getColumn("status")?.getFilterValue() as string) ?? "all"
            }
            onValueChange={(value) =>
              table
                .getColumn("status")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Ready">Ready</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <span className="text-sm font-medium">Filter by Environment</span>
          <Select
            value={
              (table.getColumn("environment")?.getFilterValue() as string) ??
              "all"
            }
            onValueChange={(value) =>
              table
                .getColumn("environment")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Filter by environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Environments</SelectItem>
              <SelectItem value="Production">Production</SelectItem>
              <SelectItem value="Development">Development</SelectItem>
              <SelectItem value="Staging">Staging</SelectItem>
            </SelectContent>
          </Select>
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
          Reset
        </Button>
      </div>
    </div>
  );
}
