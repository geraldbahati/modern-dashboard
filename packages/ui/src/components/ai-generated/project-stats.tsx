/**
 * ProjectStats - Visual analytics for a project
 *
 * @example
 * <ProjectStats stats={mockStats} />
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
  Legend,
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

interface ProjectStatsProps {
  stats: {
    burndown: { date: string; remaining: number }[];
    taskDistribution: { name: string; value: number; color: string }[];
    teamVelocity: { member: string; completed: number }[];
    metrics: {
      velocity: number;
      efficiency: number;
      onTimeCompletionRate: number;
      avgTaskDuration: number; // in days
    };
  };
  className?: string;
}

export function ProjectStats({ stats, className }: ProjectStatsProps) {
  const burndownConfig = {
    remaining: {
      label: "Remaining Tasks",
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

  const velocityConfig = {
    completed: {
      label: "Completed Tasks",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sprint Velocity
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.metrics.velocity} pts
            </div>
            <p className="text-xs text-muted-foreground">
              Average points per sprint
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
              Tasks completed vs planned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.metrics.onTimeCompletionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Tasks completed by due date
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.metrics.avgTaskDuration} days
            </div>
            <p className="text-xs text-muted-foreground">
              Average time to complete a task
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Burndown Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Burndown Chart</CardTitle>
            <CardDescription>
              Remaining tasks over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={burndownConfig}>
              <AreaChart
                accessibilityLayer
                data={stats.burndown}
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
                  dataKey="remaining"
                  type="natural"
                  fill="var(--color-remaining)"
                  fillOpacity={0.4}
                  stroke="var(--color-remaining)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Task Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
            <CardDescription>Current status of all tasks</CardDescription>
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

      {/* Team Velocity */}
      <Card>
        <CardHeader>
          <CardTitle>Team Velocity</CardTitle>
          <CardDescription>
            Tasks completed by team members in the current sprint
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={velocityConfig}>
            <BarChart accessibilityLayer data={stats.teamVelocity}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="member"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="completed"
                fill="var(--color-completed)"
                radius={8}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
