import { DashboardHeaderSkeleton } from "./_components/dashboard-header";
import { HeaderSectionSkeleton } from "./_components/header-section";
import { RecentProjectsSkeleton } from "./_components/recent-projects";
import { MetricsCardsSkeleton } from "./_components/metrics-cards";
import { QuickTasksSkeleton } from "./_components/quick-tasks";
import { CalendarWidgetSkeleton } from "./_components/calendar-widget";
import { ActivityMapSkeleton } from "./_components/activity-map";
import { InsightAnalyticsSkeleton } from "./_components/insight-analytics";
import { RevenueAnalyticsSkeleton } from "./_components/revenue-analytics";
import { PerformanceMetricsSkeleton } from "./_components/performance-metrics";
import { PerformanceAnalyticsSkeleton } from "./_components/performance-analytics";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeaderSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <HeaderSectionSkeleton />
          <MetricsCardsSkeleton />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickTasksSkeleton />
            <CalendarWidgetSkeleton />
          </div>

          <RecentProjectsSkeleton />
          <ActivityMapSkeleton />
        </div>

        {/* Right Column (Analytics Sidebar) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <InsightAnalyticsSkeleton />
          <RevenueAnalyticsSkeleton />
          <PerformanceMetricsSkeleton />
          <PerformanceAnalyticsSkeleton />
        </div>
      </div>
    </div>
  );
}
