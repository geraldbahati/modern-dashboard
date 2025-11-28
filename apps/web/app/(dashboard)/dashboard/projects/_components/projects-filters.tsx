"use client";

import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import { Search, Filter, RotateCcw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function ProjectsFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [environment, setEnvironment] = useState(
    searchParams.get("environment") || "all"
  );

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status && status !== "all") params.set("status", status);
    if (environment && environment !== "all")
      params.set("environment", environment);

    params.set("page", "1");

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setSearch("");
    setStatus("all");
    setEnvironment("all");

    startTransition(() => {
      replace(pathname);
    });
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 bg-card border rounded-xl">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by Status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
          </SelectContent>
        </Select>

        <Select value={environment} onValueChange={setEnvironment}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by Environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Environments</SelectItem>
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
            <SelectItem value="development">Development</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="default"
          size="sm"
          onClick={handleFilter}
          disabled={isPending}
        >
          Filter
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          title="Reset filters"
          disabled={isPending}
        >
          <RotateCcw className="h-4 w-4" />
          <span className="sr-only">Reset filters</span>
        </Button>
      </div>
    </div>
  );
}
