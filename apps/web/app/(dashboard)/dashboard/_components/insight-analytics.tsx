"use client";

import { Target, TrendingUp, Users, Clock } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useState } from "react";
import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { DashboardCard } from "@workspace/ui/components/dashboard-card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";

const chartConfig = {
  value: {
    label: "Percentage",
  },
  taskCompletion: {
    label: "Task Completion",
    color: "hsl(217, 91%, 60%)",
  },
  userEngagement: {
    label: "User Engagement",
    color: "hsl(142, 71%, 45%)",
  },
  responseTime: {
    label: "Response Time",
    color: "hsl(220, 9%, 76%)",
  },
  userGrowth: {
    label: "User Growth",
    color: "hsl(217, 91%, 60%)",
  },
  engagementRate: {
    label: "Engagement Rate",
    color: "hsl(142, 71%, 45%)",
  },
  retention: {
    label: "Retention",
    color: "hsl(220, 9%, 76%)",
  },
} satisfies ChartConfig;

export default function InsightAnalytics() {
  const [activeTab, setActiveTab] = useState<"performance" | "trends">(
    "performance"
  );

  const {
    data: insights,
    isLoading,
    error,
  } = useQuery(orpc.insights.getInsights.queryOptions({}));

  if (isLoading) {
    return <InsightAnalyticsSkeleton />;
  }

  if (error || !insights) {
    return (
      <DashboardCard className="w-full h-auto min-h-0">
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          <p>Failed to load insights. Please try again.</p>
        </div>
      </DashboardCard>
    );
  }

  const currentData = activeTab === "performance" ? insights.performance : insights.trends;
  const metrics = activeTab === "performance"
    ? [
        { key: "taskCompletion", data: insights.performance.taskCompletion, Icon: Target, iconColor: "text-blue-400", bgColor: "rgba(96, 165, 250, 0.2)" },
        { key: "userEngagement", data: insights.performance.userEngagement, Icon: Users, iconColor: "text-green-400", bgColor: "rgba(74, 222, 128, 0.2)" },
        { key: "responseTime", data: insights.performance.responseTime, Icon: Clock, iconColor: "text-gray-300", bgColor: "rgba(209, 213, 219, 0.2)" },
      ]
    : [
        { key: "userGrowth", data: insights.trends.userGrowth, Icon: TrendingUp, iconColor: "text-blue-400", bgColor: "rgba(96, 165, 250, 0.2)" },
        { key: "engagementRate", data: insights.trends.engagementRate, Icon: Users, iconColor: "text-green-400", bgColor: "rgba(74, 222, 128, 0.2)" },
        { key: "retention", data: insights.trends.retention, Icon: Clock, iconColor: "text-gray-300", bgColor: "rgba(209, 213, 219, 0.2)" },
      ];

  const chartData = metrics.map((m) => ({
    name: m.data.name,
    value: m.data.value,
    fill: `var(--color-${m.key})`,
  }));

  return (
    <DashboardCard className="w-full h-auto min-h-0">
      <div className="mb-3 flex items-center justify-between z-1 relative">
        <div>
          <h3 className="text-base font-semibold text-foreground">Insights</h3>
          <p className="text-sm text-muted-foreground">Performance analytics</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-col h-full">
          <div
            role="tablist"
            aria-label="Smooth tabs"
            className="flex flex-wrap items-center gap-2 p-1 relative bg-muted/50 w-full rounded-2xl border border-border/60 transition-none"
          >
            <div
              className={cn(
                "absolute rounded-lg z-[1] bg-background shadow-sm transition-all duration-300 ease-in-out",
                activeTab === "performance"
                  ? "left-1 w-[48%]"
                  : "left-[51%] w-[48%]"
              )}
              style={{ height: "32px" }}
            />
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "performance"}
              onClick={() => setActiveTab("performance")}
              className={cn(
                "relative flex items-center justify-center gap-1.5 rounded-lg px-4 py-1.5 z-[2] text-sm font-medium transition-opacity duration-300 outline-none focus-visible:outline-none focus-visible:ring-0 truncate w-[48%] sm:w-[48%]",
                activeTab === "performance"
                  ? "text-foreground opacity-100"
                  : "text-muted-foreground opacity-75 hover:opacity-100"
              )}
            >
              <Target className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Performance</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "trends"}
              onClick={() => setActiveTab("trends")}
              className={cn(
                "relative flex items-center justify-center gap-1.5 rounded-lg px-4 py-1.5 z-[2] text-sm font-medium transition-opacity duration-300 outline-none focus-visible:outline-none focus-visible:ring-0 truncate w-[48%] sm:w-[48%]",
                activeTab === "trends"
                  ? "text-foreground opacity-100"
                  : "text-muted-foreground opacity-75 hover:opacity-100"
              )}
            >
              <TrendingUp className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Trends</span>
            </button>
          </div>
          <div className="flex-1 relative mt-4">
            <div
              className="bg-sidebar border border-border/60 rounded-lg w-full relative overflow-hidden"
              style={{ height: "100%" }}
            >
              <div className="p-3 sm:p-4 w-full flex items-center justify-center overflow-visible h-full">
                <div className="flex items-center justify-center gap-4 flex-row flex-wrap w-full">
                  <div className="relative flex-shrink-0 w-[140px] h-[140px] sm:w-[170px] sm:h-[170px]">
                    <ChartContainer
                      config={chartConfig}
                      className="aspect-square w-full h-full"
                    >
                      <RadialBarChart
                        data={chartData}
                        innerRadius="50%"
                        outerRadius="100%"
                        barSize={10}
                        startAngle={90}
                        endAngle={-270}
                      >
                        <PolarAngleAxis
                          type="number"
                          domain={[0, 100]}
                          angleAxisId={0}
                          tick={false}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={
                            <ChartTooltipContent
                              hideLabel
                              nameKey="name"
                              formatter={(value, name) => (
                                <div className="flex items-center justify-between gap-2 w-full">
                                  <span className="text-muted-foreground">
                                    {name}
                                  </span>
                                  <span className="font-mono font-medium">
                                    {value}%
                                  </span>
                                </div>
                              )}
                            />
                          }
                        />
                        <RadialBar
                          dataKey="value"
                          background={{ fill: "hsl(var(--muted))" }}
                          cornerRadius={5}
                        />
                      </RadialBarChart>
                    </ChartContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-lg font-bold text-foreground">
                        {currentData.overallScore}%
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-2 min-w-[200px]">
                    {metrics.map((metric) => (
                      <div key={metric.key} className="flex items-center gap-2 p-2 rounded-lg">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: metric.bgColor }}
                        >
                          <metric.Icon className={cn("w-3.5 h-3.5", metric.iconColor)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-xs font-medium text-foreground truncate">
                              {metric.data.label}
                            </span>
                            <span className={cn("text-xs font-semibold flex-shrink-0", metric.iconColor)}>
                              {metric.data.value}%
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">
                            {metric.data.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

export function InsightAnalyticsSkeleton() {
  return (
    <DashboardCard className="w-full h-auto min-h-0">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <Skeleton className="h-5 w-24 mb-1" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-col h-full">
          {/* Tab skeleton */}
          <div className="flex items-center gap-2 p-1 bg-muted/50 w-full rounded-2xl border border-border/60">
            <Skeleton className="h-8 w-[48%] rounded-lg" />
            <Skeleton className="h-8 w-[48%] rounded-lg" />
          </div>
          <div className="flex-1 relative mt-4">
            <div className="bg-sidebar border border-border/60 rounded-lg w-full p-3 sm:p-4 h-full">
              <div className="flex items-center justify-center gap-4 flex-row flex-wrap w-full">
                {/* Radial chart skeleton */}
                <div className="relative flex-shrink-0 w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] flex items-center justify-center">
                  <Skeleton className="w-full h-full rounded-full" />
                </div>
                {/* Metrics list skeleton */}
                <div className="flex-1 flex flex-col gap-2 min-w-[200px]">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg">
                      <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-8" />
                        </div>
                        <Skeleton className="h-2.5 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
