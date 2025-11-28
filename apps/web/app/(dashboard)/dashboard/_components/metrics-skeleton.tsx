import { DashboardCard } from "@workspace/ui/components/dashboard-card";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <DashboardCard
          key={index}
          className="p-6 justify-between h-full min-h-[110px] rounded-3xl"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="w-4 h-4" />
          </div>
          <div className="flex items-end justify-between mt-4">
            <Skeleton className="h-6 w-16" />
          </div>
        </DashboardCard>
      ))}
    </div>
  );
}
