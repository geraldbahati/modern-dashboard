"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { DashboardCard } from "@workspace/ui/components/dashboard-card";
import { Skeleton } from "@workspace/ui/components/skeleton";

const chartData = [
  { subject: "Engagement", A: 120, fullMark: 150 },
  { subject: "Conversion Rate", A: 98, fullMark: 150 },
  { subject: "User Satisfaction", A: 86, fullMark: 150 },
  { subject: "Content Quality", A: 99, fullMark: 150 },
  { subject: "Performance", A: 85, fullMark: 150 },
];

const chartConfig = {
  A: {
    label: "Metric",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function PerformanceAnalytics() {
  return (
    <div className="h-auto min-h-[280px] lg:min-h-[320px]">
      <DashboardCard className="h-auto p-4">
        <div className="mb-3 flex items-center justify-between z-1 relative">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Performance Analytics
              </h3>
              <p className="text-sm text-muted-foreground">
                Key performance indicators and metrics overview
              </p>
            </div>
          </div>
          <div className="h-[260px] xs:h-[280px] sm:h-[300px] md:h-[320px] max-h-[400px] lg:h-[300px] xl:h-[330px]">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <RadarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  bottom: 20,
                  left: 30,
                }}
              >
                <PolarGrid strokeOpacity={0.2} />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Radar
                  name="Metric"
                  dataKey="A"
                  stroke="var(--color-A)"
                  fill="var(--color-A)"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ChartContainer>
          </div>
      </DashboardCard>
      <div className="mt-4 rounded-md border border-border p-3 bg-sidebar/50">
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-4">
          Tip: Improve performance by optimizing content delivery, enhancing
          user experience, and gathering regular feedback.
        </p>
      </div>
    </div>
  );
}

export function PerformanceAnalyticsSkeleton() {
  return (
    <div className="h-auto min-h-[280px] lg:min-h-[320px]">
      <DashboardCard className="h-auto p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-44 mb-1" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        {/* Radar chart skeleton - pentagon shape */}
        <div className="h-[260px] xs:h-[280px] sm:h-[300px] md:h-[320px] max-h-[400px] lg:h-[300px] xl:h-[330px] flex items-center justify-center">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56">
            {/* Concentric pentagon rings */}
            <Skeleton className="absolute inset-0 rounded-full opacity-30" />
            <Skeleton className="absolute inset-[15%] rounded-full opacity-40" />
            <Skeleton className="absolute inset-[30%] rounded-full opacity-50" />
            <Skeleton className="absolute inset-[45%] rounded-full opacity-60" />
          </div>
        </div>
      </DashboardCard>
      {/* Tip box skeleton */}
      <div className="mt-4 rounded-md border border-border p-3 bg-sidebar/50">
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
