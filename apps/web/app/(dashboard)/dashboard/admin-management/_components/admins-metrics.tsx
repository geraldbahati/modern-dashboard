"use client";

import { Clock, ShieldCheck, UserPlus, Users } from "lucide-react";

import { DashboardCard } from "@workspace/ui/components/dashboard-card";

const metrics = [
  {
    label: "Total Admins",
    value: "700",
    icon: Users,
    trend: "neutral",
  },
  {
    label: "Admins with Roles",
    value: "700",
    icon: ShieldCheck,
    trend: "neutral",
  },
  {
    label: "Recently Added",
    value: "700",
    icon: UserPlus,
    trend: "neutral",
  },
  {
    label: "Recently Updated",
    value: "700",
    icon: Clock,
    trend: "neutral",
  },
];

export function AdminsMetrics() {
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
          </div>
        </DashboardCard>
      ))}
    </div>
  );
}
