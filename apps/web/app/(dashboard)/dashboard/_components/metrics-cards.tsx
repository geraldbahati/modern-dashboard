"use client";

import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableOverlay,
} from "@workspace/ui/components/sortable";
import { cn } from "@workspace/ui/lib/utils";
import { DashboardCard } from "@workspace/ui/components/dashboard-card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Activity,
  CheckCircle2,
  Clock,
  Folder,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  GripHorizontal,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import type { DashboardMetrics, MetricItem } from "@workspace/api/schemas";

type MetricKey = keyof DashboardMetrics;

interface DisplayMetric {
  id: MetricKey;
  data: MetricItem;
  icon: React.ElementType;
}

const metricIcons: Record<MetricKey, React.ElementType> = {
  activeUsers: Activity,
  avgResponseTime: Clock,
  taskCompletion: CheckCircle2,
  totalProjects: Folder,
};

const metricOrder: MetricKey[] = [
  "taskCompletion",
  "activeUsers",
  "avgResponseTime",
  "totalProjects",
];

function formatValue(value: number, unit?: string): string {
  const formattedValue = value >= 1000 ? value.toLocaleString() : String(value);
  return unit ? `${formattedValue} ${unit}` : formattedValue;
}

function formatChange(change: number, trend: string, unit?: string): string {
  if (trend === "neutral") return "-> 0%";
  const sign = change >= 0 ? "+" : "";
  // For percentage unit, show as percentage change
  if (unit === "%") return `${sign}${change}%`;
  // For other units or no unit, check if it's a percentage change or absolute
  return `${sign}${change}${Math.abs(change) > 100 ? "" : "%"}`;
}

function MetricCard({
  item,
  isOverlay = false,
}: {
  item: DisplayMetric;
  isOverlay?: boolean;
}) {
  const Icon = item.icon;
  const { data } = item;
  const formattedValue = formatValue(data.value, data.unit);
  const formattedChange = formatChange(data.change, data.trend, data.unit);

  return (
    <DashboardCard
      className={cn(
        "p-6 justify-between h-full min-h-[110px] transition-colors rounded-3xl",
        isOverlay
          ? "shadow-xl cursor-grabbing"
          : "cursor-grab active:cursor-grabbing hover:bg-accent/50"
      )}
    >
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <Icon className="w-5 h-5 text-foreground" />
          </div>
          <p className="text-muted-foreground font-medium text-xs">
            {data.label}
          </p>
        </div>
        <div className="p-1 text-muted-foreground/20">
          <GripHorizontal className="size-4" />
        </div>
      </div>

      <div className="flex items-end justify-between mt-4 relative z-10">
        <h3 className="text-lg font-bold tracking-tight">{formattedValue}</h3>
        <div
          className={cn(
            "flex items-center text-xs font-medium mb-1",
            data.trend === "neutral"
              ? "text-muted-foreground"
              : data.trend === "up"
                ? "text-emerald-500"
                : "text-rose-500"
          )}
        >
          {data.trend === "neutral" ? (
            <ArrowRight className="w-4 h-4 mr-1" />
          ) : data.trend === "up" ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 mr-1" />
          )}
          {formattedChange}
        </div>
      </div>
    </DashboardCard>
  );
}

export default function MetricsCards() {
  const { data: metrics, isLoading, isError } = useQuery(
    orpc.metrics.getDashboardMetrics.queryOptions({})
  );

  const [items, setItems] = useState<MetricKey[]>(metricOrder);

  // Transform API data to display format with preserved order
  const displayMetrics = useMemo((): DisplayMetric[] => {
    if (!metrics) return [];
    return metricOrder.map((key) => ({
      id: key,
      data: metrics[key],
      icon: metricIcons[key],
    }));
  }, [metrics]);

  // Get ordered items based on current sort order
  const orderedItems = useMemo(() => {
    return items
      .map((id) => displayMetrics.find((m) => m.id === id))
      .filter((item): item is DisplayMetric => item !== undefined);
  }, [items, displayMetrics]);

  // Show skeleton while loading
  if (isLoading || !metrics) {
    return <MetricsCardsSkeleton />;
  }

  // Show error state
  if (isError) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard className="col-span-full p-6 text-center text-muted-foreground">
          Failed to load metrics. Please try again.
        </DashboardCard>
      </div>
    );
  }

  return (
    <Sortable
      value={items}
      onValueChange={setItems}
      getItemValue={(item: MetricKey) => item}
      orientation="mixed"
    >
      <SortableContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {orderedItems.map((item) => (
          <SortableItem key={item.id} value={item.id} asChild asHandle>
            <div className="h-full">
              <MetricCard item={item} />
            </div>
          </SortableItem>
        ))}
      </SortableContent>
      <SortableOverlay>
        {({ value }) => {
          const item = displayMetrics.find((i) => i.id === value);
          if (!item) return null;
          return <MetricCard item={item} isOverlay />;
        }}
      </SortableOverlay>
    </Sortable>
  );
}

export function MetricsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <DashboardCard
          key={i}
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
            <Skeleton className="h-4 w-12" />
          </div>
        </DashboardCard>
      ))}
    </div>
  );
}
