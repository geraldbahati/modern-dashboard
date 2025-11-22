"use client";

import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from "@workspace/ui/components/sortable";
import { cn } from "@workspace/ui/lib/utils";
import { DashboardCard } from "@workspace/ui/components/dashboard-card";
import {
  Activity,
  CheckCircle2,
  Clock,
  Folder,
  GripVertical,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  GripHorizontal,
} from "lucide-react";
import { useState } from "react";

interface Metric {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  trendNeutral?: boolean;
  icon: React.ElementType;
}

const initialMetrics: Metric[] = [
  {
    id: "task-completion",
    label: "Task Completion",
    value: "78%",
    trend: "+5%",
    trendUp: true,
    icon: CheckCircle2,
  },
  {
    id: "active-users",
    label: "Active Users",
    value: "1,847",
    trend: "+12%",
    trendUp: true,
    icon: Activity,
  },
  {
    id: "avg-response-time",
    label: "Avg. Response Time",
    value: "32 min",
    trend: "-> 0%",
    trendUp: false,
    trendNeutral: true,
    icon: Clock,
  },
  {
    id: "total-projects",
    label: "Total Projects",
    value: "24",
    trend: "+3",
    trendUp: true,
    icon: Folder,
  },
];

function MetricCard({
  item,
  isOverlay = false,
}: {
  item: Metric;
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
            {item.label}
          </p>
        </div>
        <div className="p-1 text-muted-foreground/20">
          <GripHorizontal className="size-4" />
        </div>
      </div>

      <div className="flex items-end justify-between mt-4 relative z-10">
        <h3 className="text-lg font-bold tracking-tight">{item.value}</h3>
        <div
          className={cn(
            "flex items-center text-xs font-medium mb-1",
            item.trendNeutral
              ? "text-muted-foreground"
              : item.trendUp
                ? "text-emerald-500"
                : "text-rose-500"
          )}
        >
          {item.trendNeutral ? (
            <ArrowRight className="w-4 h-4 mr-1" />
          ) : item.trendUp ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 mr-1" />
          )}
          {item.trend}
        </div>
      </div>
    </DashboardCard>
  );
}

export default function MetricsCards() {
  const [items, setItems] = useState(initialMetrics);

  return (
    <Sortable
      value={items}
      onValueChange={setItems}
      getItemValue={(item) => item.id}
      orientation="mixed"
    >
      <SortableContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <SortableItem key={item.id} value={item.id} asChild asHandle>
            <div className="h-full">
              <MetricCard item={item} />
            </div>
          </SortableItem>
        ))}
      </SortableContent>
      <SortableOverlay>
        {({ value }) => {
          const item = items.find((i) => i.id === value);
          if (!item) return null;
          return <MetricCard item={item} isOverlay />;
        }}
      </SortableOverlay>
    </Sortable>
  );
}
