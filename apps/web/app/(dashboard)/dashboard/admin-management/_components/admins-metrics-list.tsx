"use client";

import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableOverlay,
} from "@workspace/ui/components/sortable";
import { cn } from "@workspace/ui/lib/utils";
import { DashboardCard } from "@workspace/ui/components/dashboard-card";
import { Users, Shield, UserPlus, Clock, GripHorizontal } from "lucide-react";
import { useState } from "react";

interface AdminsMetricsListProps {
  metrics: {
    total: number;
    admins: number;
    recentlyAdded: number;
    recentlyUpdated: number;
  };
}

type MetricKey = "total" | "admins" | "recentlyAdded" | "recentlyUpdated";

interface MetricConfig {
  id: MetricKey;
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
}

const metricIcons: Record<MetricKey, React.ElementType> = {
  total: Users,
  admins: Shield,
  recentlyAdded: UserPlus,
  recentlyUpdated: Clock,
};

const metricTitles: Record<MetricKey, string> = {
  total: "Total Admins",
  admins: "Admins with Roles",
  recentlyAdded: "Recently Added",
  recentlyUpdated: "Recently Updated",
};

const metricDescriptions: Record<MetricKey, string> = {
  total: "All administrators",
  admins: "Assigned specific roles",
  recentlyAdded: "In the last 30 days",
  recentlyUpdated: "In the last 30 days",
};

function MetricCard({
  item,
  isOverlay = false,
}: {
  item: MetricConfig;
  isOverlay?: boolean;
}) {
  const Icon = item.icon;

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
            {item.title}
          </p>
        </div>
        <div className="p-1 text-muted-foreground/20">
          <GripHorizontal className="size-4" />
        </div>
      </div>

      <div className="flex items-end justify-between mt-4 relative z-10">
        <div>
          <h3 className="text-lg font-bold tracking-tight">{item.value}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {item.description}
          </p>
        </div>
      </div>
    </DashboardCard>
  );
}

export function AdminsMetricsList({ metrics }: AdminsMetricsListProps) {
  const [items, setItems] = useState<MetricKey[]>([
    "total",
    "admins",
    "recentlyAdded",
    "recentlyUpdated",
  ]);

  const displayMetrics: MetricConfig[] = items.map((key) => ({
    id: key,
    title: metricTitles[key],
    value: metrics[key],
    icon: metricIcons[key],
    description: metricDescriptions[key],
  }));

  return (
    <Sortable
      value={items}
      onValueChange={setItems}
      getItemValue={(item: MetricKey) => item}
      orientation="mixed"
    >
      <SortableContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayMetrics.map((item) => (
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
