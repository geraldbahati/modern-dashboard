import { Suspense } from "react";
import { Metadata } from "next";
import { Button } from "@workspace/ui/components/button";
import { ProjectsMetrics } from "./_components/projects-metrics";
import { ProjectsTable } from "./_components/projects-table";
import { ProjectsFilters } from "./_components/projects-filters";
import { Plus } from "lucide-react";
import { DashboardHeader } from "../_components/dashboard-header";
import { MetricsSkeleton } from "../_components/metrics-skeleton";
import { TableSkeleton } from "../_components/table-skeleton";

export const metadata: Metadata = {
  title: "Projects | Dashboard",
  description: "Manage your projects, track progress, and view status updates.",
};

interface ProjectsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    environment?: string;
  }>;
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Projects"
        description="Manage your projects and track progress"
      >
        <Button size="sm" className="h-8 gap-1">
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </DashboardHeader>

      <Suspense fallback={<MetricsSkeleton />}>
        <ProjectsMetrics />
      </Suspense>

      <ProjectsFilters />

      <Suspense key={JSON.stringify(params)} fallback={<TableSkeleton />}>
        <ProjectsTable searchParams={params} />
      </Suspense>
    </div>
  );
}
