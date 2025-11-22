"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { ChevronDown } from "lucide-react";
import { DashboardCard } from "@workspace/ui/components/dashboard-card";
import { Skeleton } from "@workspace/ui/components/skeleton";

const chartData = [
  { month: "Jan", completion: 85 },
  { month: "Feb", completion: 92 },
  { month: "Mar", completion: 78 },
  { month: "Apr", completion: 96 },
  { month: "May", completion: 88 },
];

const chartConfig = {
  completion: {
    label: "Completion",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function PerformanceMetrics() {
  return (
    <DashboardCard className="h-full min-h-[400px] flex-1 p-4">
      <div className="mb-3 flex items-center justify-between z-1 relative">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Performance Metrics
            </h3>
            <p className="text-sm text-muted-foreground">
              Monthly completion rate tracking
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 sm:gap-1.5 cursor-pointer hover:text-foreground transition-colors">
              <span className="text-xs text-muted-foreground">
                Last 5 Months
              </span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        </div>
        <div className="flex-1 w-full min-h-[240px] sm:min-h-[280px] max-h-[400px] lg:min-h-0 py-4 px-2">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: -20,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" hideLabel />}
              />
              <Bar
                dataKey="completion"
                fill="var(--color-completion)"
                radius={[20, 20, 20, 20]}
                barSize={32}
              />
            </BarChart>
          </ChartContainer>
        </div>
        <div className="mt-2 sm:mt-2.5 grid grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center">
            <div className="text-foreground text-sm sm:text-base font-medium">
              88.0%
            </div>
            <div className="text-muted-foreground text-xs">Avg Completion</div>
          </div>
          <div className="text-center">
            <div className="text-foreground text-sm sm:text-base font-medium">
              4/5
            </div>
            <div className="text-muted-foreground text-xs">Above Target</div>
          </div>
          <div className="text-center">
            <div className="text-foreground text-sm sm:text-base font-medium">
              Apr
            </div>
            <div className="text-muted-foreground text-xs">Best Month</div>
          </div>
        </div>
    </DashboardCard>
  );
}

export function PerformanceMetricsSkeleton() {
  return (
    <DashboardCard className="h-full min-h-[400px] flex-1 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <Skeleton className="h-5 w-40 mb-1" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
      {/* Bar chart skeleton */}
      <div className="flex-1 w-full min-h-[240px] sm:min-h-[280px] max-h-[400px] lg:min-h-0 py-4 px-2 flex items-end gap-4">
        {[85, 92, 78, 96, 88].map((height, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end h-full">
            <Skeleton
              className="w-full rounded-full"
              style={{ height: `${height}%` }}
            />
          </div>
        ))}
      </div>
      {/* Stats skeleton */}
      <div className="mt-2 sm:mt-2.5 grid grid-cols-3 gap-2 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center flex flex-col items-center">
            <Skeleton className="h-5 w-14 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
