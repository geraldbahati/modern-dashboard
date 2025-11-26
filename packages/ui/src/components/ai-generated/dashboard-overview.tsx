/**
 * DashboardOverview - Display key metrics with sparkline charts
 *
 * @example
 * <DashboardOverview stats={mockStats} period="30d" />
 */

"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  Users,
  Folder,
  CheckSquare,
  Activity,
} from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { Line, LineChart, ResponsiveContainer } from "recharts";

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  activeMembers: number;
  completionRate: number;
  trends: {
    users: number; // % change
    projects: number;
    tasks: number;
  };
  // Mock data for sparklines - in a real app this would come from the API
  history?: {
    users: { value: number }[];
    projects: { value: number }[];
    tasks: { value: number }[];
  };
}

interface DashboardOverviewProps {
  stats: DashboardStats;
  period?: string;
  onPeriodChange?: (period: string) => void;
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  data?: { value: number }[];
  color?: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  data,
  color = "hsl(var(--primary))",
}: StatCardProps) {
  const chartColor =
    trend && trend < 0
      ? "hsl(var(--destructive))"
      : trend && trend > 0
        ? "hsl(var(--green-500))"
        : color;

  const chartConfig = {
    value: {
      label: "Value",
      color: chartColor,
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {trend !== undefined && (
              <p
                className={cn(
                  "text-xs flex items-center mt-1",
                  trend > 0
                    ? "text-green-500"
                    : trend < 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                )}
              >
                {trend > 0 ? (
                  <ArrowUp className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(trend)}% from last month
              </p>
            )}
          </div>
          {data && data.length > 0 && (
            <div className="h-[40px] w-[80px]">
              <ChartContainer config={chartConfig}>
                <LineChart data={data}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent hideLabel hideIndicator />}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardOverview({
  stats,
  period = "30d",
  onPeriodChange,
  className,
}: DashboardOverviewProps) {
  // Mock history data if not provided
  const defaultHistory = {
    users: Array.from({ length: 10 }, () => ({
      value: Math.floor(Math.random() * 100) + 50,
    })),
    projects: Array.from({ length: 10 }, () => ({
      value: Math.floor(Math.random() * 20) + 10,
    })),
    tasks: Array.from({ length: 10 }, () => ({
      value: Math.floor(Math.random() * 50) + 20,
    })),
  };

  const history = stats.history || defaultHistory;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend={stats.trends.users}
          data={history.users}
        />
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={Folder}
          trend={stats.trends.projects}
          data={history.projects}
        />
        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={CheckSquare}
          trend={stats.trends.tasks}
          data={history.tasks}
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          icon={Activity}
          trend={5} // Mock trend for completion rate
          data={[
            { value: 60 },
            { value: 65 },
            { value: 62 },
            { value: 68 },
            { value: 70 },
            { value: 75 },
          ]}
        />
      </div>
    </div>
  );
}
