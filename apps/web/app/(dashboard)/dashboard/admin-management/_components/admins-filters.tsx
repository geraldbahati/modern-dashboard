"use client";

import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Search, RotateCcw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function AdminsFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [name, setName] = useState(searchParams.get("name") || "");

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (email) params.set("email", email);
    if (phone) params.set("phone", phone);
    if (name) params.set("name", name);

    params.set("page", "1");

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setSearch("");
    setEmail("");
    setPhone("");
    setName("");

    startTransition(() => {
      replace(pathname);
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-card border rounded-xl">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <Input
            placeholder="Search admins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            placeholder="Filter by email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone</label>
          <Input
            placeholder="Filter by phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <Input
            placeholder="Search by first/last name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={handleFilter}
          disabled={isPending}
          className="gap-2"
        >
          <Search className="h-4 w-4" />
          Filter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="gap-2"
          disabled={isPending}
        >
          <RotateCcw className="h-4 w-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
