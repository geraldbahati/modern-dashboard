/**
 * UserAnalytics - Visual analytics for a user's performance
 *
 * @example
 * <UserAnalytics stats={mockStats} />
 */

"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { Activity, CheckCircle2, Clock, TrendingUp } from "lucide-react";

interface UserAnalyticsProps {
  stats: {
    activity: { date: string; tasks: number }[];
    taskDistribution: { name: string; value: number; color: string }[];
    performance: { week: string; completed: number; assigned: number }[];
    metrics: {
      totalTasks: number;
      completionRate: number;
      avgCompletionTime: number; // in hours
      efficiency: number;
    };
  };
  className?: string;
}

export function UserAnalytics({ stats, className }: UserAnalyticsProps) {
  const activityConfig = {
    tasks: {
      label: "Tasks Completed",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  const distributionConfig = {
    value: {
      label: "Tasks",
    },
    todo: {
      label: "Todo",
      color: "hsl(var(--muted-foreground))",
    },
    in_progress: {
      label: "In Progress",
      color: "hsl(var(--blue-500))",
    },
    done: {
      label: "Done",
      color: "hsl(var(--green-500))",
    },
  } satisfies ChartConfig;

  const performanceConfig = {
    completed: {
      label: "Completed",
      color: "hsl(var(--primary))",
    },
    assigned: {
      label: "Assigned",
      color: "hsl(var(--muted-foreground))",
    },
  } satisfies ChartConfig;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.metrics.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              Assigned tasks all time
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.metrics.completionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Tasks completed vs assigned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.metrics.avgCompletionTime}h
            </div>
            <p className="text-xs text-muted-foreground">
              Average time to complete a task
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.metrics.efficiency}%
            </div>
            <p className="text-xs text-muted-foreground">
              On-time completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Activity Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Activity Over Time</CardTitle>
            <CardDescription>
              Tasks completed in the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={activityConfig}>
              <AreaChart
                accessibilityLayer
                data={stats.activity}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="tasks"
                  type="natural"
                  fill="var(--color-tasks)"
                  fillOpacity={0.4}
                  stroke="var(--color-tasks)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Task Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
            <CardDescription>Current workload by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={distributionConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={stats.taskDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  {stats.taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Performance</CardTitle>
          <CardDescription>
            Tasks assigned vs completed per week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={performanceConfig}>
            <BarChart accessibilityLayer data={stats.performance}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="week"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar dataKey="assigned" fill="var(--color-assigned)" radius={4} />
              <Bar
                dataKey="completed"
                fill="var(--color-completed)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
