"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { CalendarIcon, RotateCcw, Search } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Calendar } from "@workspace/ui/components/calendar";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";

interface UsersTableToolbarProps<TData> {
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

function ToolbarDatePicker({
  value: initialValue,
  onChange,
  placeholder = "Pick a date",
}: {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}) {
  const [date, setDate] = React.useState<Date | undefined>(initialValue);

  React.useEffect(() => {
    setDate(initialValue);
  }, [initialValue]);

  const handleSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    onChange(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-9",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export function UsersTableToolbar<TData>({
  table,
}: UsersTableToolbarProps<TData>) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <span className="text-sm font-medium">Username</span>
          <ToolbarInput
            placeholder="Filter by username"
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
          <span className="text-sm font-medium">From Date</span>
          <ToolbarDatePicker
            placeholder="YYYY-MM-DD"
            value={table.getColumn("joinedDate")?.getFilterValue() as Date}
            onChange={(date) =>
              table.getColumn("joinedDate")?.setFilterValue(date)
            }
          />
        </div>
        <div className="space-y-2">
          <span className="text-sm font-medium">To Date</span>
          <ToolbarDatePicker
            placeholder="YYYY-MM-DD"
            value={undefined} // Placeholder for To Date logic
            onChange={() => {}} // Placeholder for To Date logic
          />
        </div>
        <div className="flex items-end gap-2">
          <Button className="flex-1 h-9">
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
    </div>
  );
}
