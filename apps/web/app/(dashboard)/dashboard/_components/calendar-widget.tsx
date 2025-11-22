"use client";

import { Calendar } from "@workspace/ui/components/calendar";
import { useState, useEffect } from "react";
import { DashboardCard } from "@workspace/ui/components/dashboard-card";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function CalendarWidgetSkeleton() {
  return (
    <DashboardCard className="h-auto min-h-[360px]">
      <div className="mb-3 flex items-center justify-between z-1 relative">
        <div>
          <Skeleton className="h-5 w-24 mb-1" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="flex-1 mt-4 flex items-center justify-center">
        <div className="w-full max-w-[320px] space-y-4">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-8" />
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-9 rounded-md" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 mt-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-9 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

export default function CalendarWidget() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDate(new Date());
  }, []);

  if (!mounted) {
    return <CalendarWidgetSkeleton />;
  }

  return (
    <DashboardCard className="h-auto min-h-[360px]">
      <div className="mb-3 flex items-center justify-between z-1 relative">
        <div>
          <h3 className="text-base font-semibold text-foreground">Calendar</h3>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="flex-1 mt-4 flex items-center justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border-none w-full max-w-[320px]"
          classNames={{
            head_cell: "text-muted-foreground font-normal text-[0.8rem]",
            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent/50 rounded-md transition-colors",
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle:
              "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
        />
      </div>
    </DashboardCard>
  );
}
