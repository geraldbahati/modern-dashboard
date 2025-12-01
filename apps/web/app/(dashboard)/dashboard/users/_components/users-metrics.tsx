"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { UsersMetricsList } from "./users-metrics-list";
import { MetricsSkeleton } from "../../_components/metrics-skeleton";

export function UsersMetrics() {
  const { data: metrics, isLoading, error } = useQuery(
    orpc.users.metrics.queryOptions({})
  );

  if (isLoading) {
    return <MetricsSkeleton />;
  }

  if (error || !metrics) {
    return (
      <div className="text-sm text-muted-foreground">
        Failed to load user metrics
      </div>
    );
  }

  return <UsersMetricsList metrics={metrics} />;
}
