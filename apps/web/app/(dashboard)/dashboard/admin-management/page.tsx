import { Suspense } from "react";
import { Metadata } from "next";
import { DashboardHeader } from "../_components/dashboard-header";
import { Button } from "@workspace/ui/components/button";
import { AdminsMetrics } from "./_components/admins-metrics";
import { AdminsTable } from "./_components/admins-table";
import { AdminsFilters } from "./_components/admins-filters";
import { MetricsSkeleton } from "../_components/metrics-skeleton";
import { TableSkeleton } from "../_components/table-skeleton";
import { UserPlus } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Management | Dashboard",
  description: "Manage admin users and their access permissions.",
};

interface AdminsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    email?: string;
    name?: string;
  }>;
}

export default async function AdminsPage({ searchParams }: AdminsPageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Admin Management"
        description="Manage admin users and their access"
      >
        <Button size="sm" className="h-8 gap-1">
          <UserPlus className="h-4 w-4" />
          Add Admin
        </Button>
      </DashboardHeader>

      <Suspense fallback={<MetricsSkeleton />}>
        <AdminsMetrics />
      </Suspense>

      <AdminsFilters />

      <Suspense key={JSON.stringify(params)} fallback={<TableSkeleton />}>
        <AdminsTable searchParams={params} />
      </Suspense>
    </div>
  );
}
