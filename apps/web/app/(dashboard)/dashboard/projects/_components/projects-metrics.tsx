"use client";

import { AlertTriangle, CheckCircle2, Folder, Loader2 } from "lucide-react";

import { DashboardCard } from "@workspace/ui/components/dashboard-card";

const metrics = [
  {
    label: "Total Projects",
    value: "17",
    icon: Folder,
    trend: "neutral",
  },
  {
    label: "In Progress",
    value: "6",
    icon: Loader2,
    trend: "neutral",
  },
  {
    label: "Ready",
    value: "11",
    icon: CheckCircle2,
    trend: "up",
  },
  {
    label: "Blocked",
    value: "0",
    icon: AlertTriangle,
    trend: "down",
  },
];

export function ProjectsMetrics() {
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
