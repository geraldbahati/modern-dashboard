import { Suspense } from "react";
import { cookies } from "next/headers";
import HeaderSection, {
  HeaderSectionSkeleton,
} from "./_components/header-section";
import RecentProjects, {
  RecentProjectsSkeleton,
} from "./_components/recent-projects";
import MetricsCards from "./_components/metrics-cards";
import QuickTasks, { QuickTasksSkeleton } from "./_components/quick-tasks";
import CalendarWidget, {
  CalendarWidgetSkeleton,
} from "./_components/calendar-widget";
import ActivityMap, { ActivityMapSkeleton } from "./_components/activity-map";

import InsightAnalytics, {
  InsightAnalyticsSkeleton,
} from "./_components/insight-analytics";
import RevenueAnalytics, {
  RevenueAnalyticsSkeleton,
} from "./_components/revenue-analytics";
import PerformanceMetrics, {
  PerformanceMetricsSkeleton,
} from "./_components/performance-metrics";
import PerformanceAnalytics,
  { PerformanceAnalyticsSkeleton,
} from "./_components/performance-analytics";
import { DashboardHeader } from "./_components/dashboard-header";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { createServerOrpc } from "@/lib/orpc";

export default async function DashboardPage() {
  const queryClient = getQueryClient();
  const cookieStore = await cookies();
  const serverOrpc = createServerOrpc(cookieStore.toString());

  // Prefetch metrics data on the server
  // Wrapped in try-catch to handle auth errors gracefully
  // If prefetch fails, client will fetch on mount
  try {
    await queryClient.prefetchQuery(
      serverOrpc.metrics.getDashboardMetrics.queryOptions({})
    );
  } catch (error) {
    // Log error in development, silently fail in production
    // Client-side will retry with proper credentials
    console.error("Failed to prefetch metrics:", error);
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Overview"
        description="Monitor key metrics and manage your platform"
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Suspense fallback={<HeaderSectionSkeleton />}>
            <HeaderSection />
          </Suspense>
          <HydrateClient client={queryClient}>
            <MetricsCards />
          </HydrateClient>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Suspense fallback={<QuickTasksSkeleton />}>
              <QuickTasks />
            </Suspense>
            <Suspense fallback={<CalendarWidgetSkeleton />}>
              <CalendarWidget />
            </Suspense>
          </div>

          <Suspense fallback={<RecentProjectsSkeleton />}>
            <RecentProjects />
          </Suspense>

          <Suspense fallback={<ActivityMapSkeleton />}>
            <ActivityMap />
          </Suspense>
        </div>

        {/* Right Column (Analytics Sidebar) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Suspense fallback={<InsightAnalyticsSkeleton />}>
            <InsightAnalytics />
          </Suspense>
          <Suspense fallback={<RevenueAnalyticsSkeleton />}>
            <RevenueAnalytics />
          </Suspense>
          <Suspense fallback={<PerformanceMetricsSkeleton />}>
            <PerformanceMetrics />
          </Suspense>
          <Suspense fallback={<PerformanceAnalyticsSkeleton />}>
            <PerformanceAnalytics />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
