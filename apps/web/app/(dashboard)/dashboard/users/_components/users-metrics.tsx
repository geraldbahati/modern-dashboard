"use client";

import { CheckCircle2, Trash2, UserX, Users } from "lucide-react";

import { DashboardCard } from "@workspace/ui/components/dashboard-card";

const metrics = [
  {
    label: "Verified Users",
    value: "13",
    icon: CheckCircle2,
    trend: "up",
  },
  {
    label: "Deleted Users",
    value: "13",
    icon: Trash2,
    trend: "neutral",
  },
  {
    label: "Unverified Users",
    value: "6",
    icon: UserX,
    trend: "neutral",
  },
  {
    label: "Total Users",
    value: "19",
    icon: Users,
    trend: "neutral",
  },
];

export function UsersMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <DashboardCard key={metric.label} className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                <metric.icon className="h-4 w-4 text-foreground" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {metric.label}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4">
            <div className="text-2xl font-bold">{metric.value}</div>
            {/* Add trend indicator if needed matching the design */}
          </div>
        </DashboardCard>
      ))}
    </div>
  );
}
