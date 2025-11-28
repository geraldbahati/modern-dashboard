"use client";

import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Search, RotateCcw } from "lucide-react";
import { DatePicker } from "../../_components/date-picker";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function UsersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [username, setUsername] = useState(searchParams.get("username") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [firstName, setFirstName] = useState(
    searchParams.get("firstName") || ""
  );
  const [lastName, setLastName] = useState(searchParams.get("lastName") || "");
  const [fromDate, setFromDate] = useState<Date | undefined>(
    searchParams.get("fromDate")
      ? new Date(searchParams.get("fromDate")!)
      : undefined
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    searchParams.get("toDate") ? new Date(searchParams.get("toDate")!) : undefined
  );

  const handleFilter = () => {
    const params = new URLSearchParams();

    if (username) params.set("username", username);
    if (email) params.set("email", email);
    if (phone) params.set("phone", phone);
    if (firstName) params.set("firstName", firstName);
    if (lastName) params.set("lastName", lastName);
    if (fromDate)
      params.set("fromDate", fromDate.toISOString().split("T")[0]);
    if (toDate) params.set("toDate", toDate.toISOString().split("T")[0]);

    params.set("page", "1"); // Reset to first page

    startTransition(() => {
      router.push(`/dashboard/users?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setUsername("");
    setEmail("");
    setPhone("");
    setFirstName("");
    setLastName("");
    setFromDate(undefined);
    setToDate(undefined);

    startTransition(() => {
      router.push("/dashboard/users");
    });
  };

  return (
    <>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Username</label>
          <Input
            placeholder="Filter by username"
            className="h-9"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Email</label>
          <Input
            placeholder="Filter by email"
            className="h-9"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Phone</label>
          <Input
            placeholder="Filter by phone"
            className="h-9"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">First Name</label>
          <Input
            placeholder="Filter by first name"
            className="h-9"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Last Name</label>
          <Input
            placeholder="Filter by last name"
            className="h-9"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">From Date</label>
          <DatePicker
            date={fromDate}
            onDateChange={setFromDate}
            placeholder="Select start date"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">To Date</label>
          <DatePicker
            date={toDate}
            onDateChange={setToDate}
            placeholder="Select end date"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2"
          onClick={handleFilter}
          disabled={isPending}
        >
          <Search className="h-4 w-4" />
          <span>Filter</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2"
          onClick={handleReset}
          disabled={isPending}
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset Filters</span>
        </Button>
      </div>
    </>
  );
}
