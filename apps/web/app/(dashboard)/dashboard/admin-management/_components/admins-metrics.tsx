"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { AdminsMetricsList } from "./admins-metrics-list";
import { MetricsSkeleton } from "../../_components/metrics-skeleton";

export function AdminsMetrics() {
  const { data: metrics, isLoading } = useQuery(
    orpc.users.metrics.queryOptions()
  );

  if (isLoading) {
    return <MetricsSkeleton />;
  }

  if (!metrics) {
    return null;
  }

  return <AdminsMetricsList metrics={metrics} />;
}
