import { Suspense } from "react";
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

export default function DashboardPage() {
  return (
    <main className="min-h-screen">
      {/* Main grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-auto">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Suspense fallback={<HeaderSectionSkeleton />}>
            <HeaderSection />
          </Suspense>
          <MetricsCards />

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
        <div className="lg:col-span-1">{/* <AnalyticsSidebar /> */}</div>
      </div>
    </main>
  );
}
