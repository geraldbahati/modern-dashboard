"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { ProjectsMetricsList } from "./projects-metrics-list";
import { MetricsSkeleton } from "../../_components/metrics-skeleton";

export function ProjectsMetrics() {
  const { data: metrics, isLoading } = useQuery(
    orpc.projects.metrics.queryOptions({})
  );

  if (isLoading) {
    return <MetricsSkeleton />;
  }

  if (!metrics) {
    return null;
  }

  return <ProjectsMetricsList metrics={metrics} />;
}
