"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  { month: "Product", revenue: 25000 },
  { month: "Subscriptions", revenue: 28000 },
  { month: "Services", revenue: 27000 },
  { month: "Licenses", revenue: 35000 },
  { month: "Consulting", revenue: 42000 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function RevenueAnalytics() {
  return (
    <DashboardCard className="h-full min-h-[400px] flex-1 p-4">
      <div className="mb-3 flex items-center justify-between z-1 relative">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Revenue Analytics
            </h3>
            <p className="text-sm text-muted-foreground">
              Revenue breakdown by category
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 sm:gap-1.5 cursor-pointer hover:text-foreground transition-colors">
              <span className="text-xs text-muted-foreground">
                This Quarter
              </span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        </div>
        <div className="flex-1 w-full min-h-[240px] max-h-[400px] sm:min-h-[280px] lg:min-h-0">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: -20,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
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
                tickFormatter={(value) => value.slice(0, 12)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" hideLabel />}
              />
              <Area
                dataKey="revenue"
                type="natural"
                fill="url(#fillRevenue)"
                fillOpacity={0.4}
                stroke="var(--color-revenue)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </div>
        <div className="mt-2 sm:mt-2.5 grid grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center">
            <div className="text-foreground text-sm sm:text-base font-medium">
              $193,390
            </div>
            <div className="text-muted-foreground text-xs">Total Revenue</div>
          </div>
          <div className="text-center">
            <div
              dir="ltr"
              className="text-foreground text-sm sm:text-base font-medium"
            >
              +13.9%
            </div>
            <div className="text-muted-foreground text-xs">Avg Growth</div>
          </div>
          <div className="text-center">
            <div className="text-foreground text-sm sm:text-base font-medium">
              6/6
            </div>
            <div className="text-muted-foreground text-xs">Positive</div>
          </div>
        </div>
    </DashboardCard>
  );
}

export function RevenueAnalyticsSkeleton() {
  return (
    <DashboardCard className="h-full min-h-[400px] flex-1 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <Skeleton className="h-5 w-36 mb-1" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
      {/* Chart area skeleton */}
      <div className="flex-1 w-full min-h-[240px] max-h-[400px] sm:min-h-[280px] lg:min-h-0 flex flex-col justify-end gap-2 p-4">
        <div className="flex items-end justify-between gap-2 h-full">
          {[60, 75, 70, 90, 100].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end h-full">
              <Skeleton
                className="w-full rounded-t-sm"
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Stats skeleton */}
      <div className="mt-2 sm:mt-2.5 grid grid-cols-3 gap-2 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center flex flex-col items-center">
            <Skeleton className="h-5 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
