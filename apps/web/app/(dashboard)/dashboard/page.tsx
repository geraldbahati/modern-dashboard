import { Suspense } from "react";
import { connection } from "next/server";
import { cookies, headers } from "next/headers";
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
import PerformanceAnalytics, {
  PerformanceAnalyticsSkeleton,
} from "./_components/performance-analytics";
import { DashboardHeader } from "./_components/dashboard-header";
import { getQueryClient, HydrateClient } from "@/lib/query/hydration";
import { createServerOrpc } from "@/lib/orpc";
import { auth } from "@workspace/auth/next";
import { hasPermission, type RoleName } from "@workspace/auth/permissions";

// Extended user type that includes role from admin plugin
interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role?: string | null;
}

export default async function DashboardPage() {
  // Defer to request time to access runtime data (required for Next.js 16 with PPR)
  await connection();

  const queryClient = getQueryClient();
  const cookieStore = await cookies();
  const serverOrpc = createServerOrpc(cookieStore.toString());

  // Fetch session to get user role for permission checks
  // Note: Server components can't reliably access browser cookies during SSR
  // Use client components (useSession) for displaying user data
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user as UserWithRole | undefined;
  const userRole = (user?.role as RoleName) || "user";

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

  // Permission checks
  const canViewAnalytics = hasPermission(userRole, "analytics", "view");
  const canViewProjects = hasPermission(userRole, "project", "read");
  const canViewTasks = hasPermission(userRole, "task", "read");

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

          {canViewAnalytics && (
            <HydrateClient client={queryClient}>
              <MetricsCards />
            </HydrateClient>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {canViewTasks && (
              <Suspense fallback={<QuickTasksSkeleton />}>
                <QuickTasks />
              </Suspense>
            )}
            <Suspense fallback={<CalendarWidgetSkeleton />}>
              <CalendarWidget />
            </Suspense>
          </div>

          {canViewProjects && (
            <Suspense fallback={<RecentProjectsSkeleton />}>
              <RecentProjects />
            </Suspense>
          )}

          {canViewAnalytics && (
            <Suspense fallback={<ActivityMapSkeleton />}>
              <ActivityMap />
            </Suspense>
          )}
        </div>

        {/* Right Column (Analytics Sidebar) */}
        {canViewAnalytics && (
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
        )}
      </div>
    </div>
  );
}
