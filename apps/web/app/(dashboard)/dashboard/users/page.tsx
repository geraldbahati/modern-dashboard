import { Suspense } from "react";
import { Metadata } from "next";
import { DashboardHeader } from "../_components/dashboard-header";
import { Button } from "@workspace/ui/components/button";
import { UsersMetrics } from "./_components/users-metrics";
import { UsersTable } from "./_components/users-table";
import { UsersFilters } from "./_components/users-filters";
import { MetricsSkeleton } from "../_components/metrics-skeleton";
import { TableSkeleton } from "../_components/table-skeleton";

export const metadata: Metadata = {
  title: "Users Management | Dashboard",
  description:
    "Manage platform users and accounts. View, filter, and manage user profiles, verification status, and user data.",
  keywords: [
    "users",
    "user management",
    "accounts",
    "verified users",
    "user dashboard",
  ],
  openGraph: {
    title: "Users Management | Dashboard",
    description: "Manage platform users and accounts",
    type: "website",
  },
};

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    username?: string;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    fromDate?: string;
    toDate?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  // Force rebuild

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="All Users"
        description="Manage platform users and accounts"
      >
        <Button size="sm" className="h-8">
          Create User
        </Button>
      </DashboardHeader>

      {/* Metrics Cards - Cached and included in static shell */}
      <Suspense fallback={<MetricsSkeleton />}>
        <UsersMetrics />
      </Suspense>

      {/* Filters - Client Component for interactivity */}
      <UsersFilters />

      {/* Data Table - Streaming with Suspense */}
      <Suspense key={JSON.stringify(params)} fallback={<TableSkeleton />}>
        <UsersTable searchParams={params} />
      </Suspense>
    </div>
  );
}
