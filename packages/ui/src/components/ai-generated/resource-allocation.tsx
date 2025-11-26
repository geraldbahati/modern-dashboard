/**
 * ResourceAllocation - Visualizes team workload and capacity
 *
 * @example
 * <ResourceAllocation data={mockResourceData} />
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { cn } from "@workspace/ui/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { Users, Briefcase, AlertCircle } from "lucide-react";

interface ResourceData {
  workload: {
    name: string;
    assigned: number;
    capacity: number;
    image: string | null;
  }[];
  projectDistribution: {
    subject: string;
    A: number; // Current Project
    fullMark: number;
  }[];
  availability: {
    id: string;
    name: string;
    role: string;
    image: string | null;
    status: "available" | "busy" | "overloaded";
    currentTask: string | null;
  }[];
}

interface ResourceAllocationProps {
  data: ResourceData;
  className?: string;
}

export function ResourceAllocation({
  data,
  className,
}: ResourceAllocationProps) {
  const workloadConfig = {
    assigned: {
      label: "Assigned Tasks",
      color: "hsl(var(--primary))",
    },
    capacity: {
      label: "Total Capacity",
      color: "hsl(var(--muted))",
    },
  } satisfies ChartConfig;

  const distributionConfig = {
    A: {
      label: "Resource Allocation",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "busy":
        return "bg-yellow-500";
      case "overloaded":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Workload Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Team Workload</CardTitle>
            <CardDescription>
              Assigned tasks vs. capacity per member
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={workloadConfig}
              className="h-[350px] w-full"
            >
              <BarChart
                accessibilityLayer
                data={data.workload}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <XAxis type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar
                  dataKey="capacity"
                  fill="var(--color-capacity)"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="assigned"
                  fill="var(--color-assigned)"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
                {/* Re-rendering assigned on top of capacity for "progress bar" effect if not stacked */}
                {/* Actually, let's just show assigned. Capacity can be a reference line or background bar.
                     For simplicity in this stacked chart, let's just show assigned vs remaining capacity.
                  */}
              </BarChart>
              {/* 
                Better approach for "Capacity vs Assigned":
                Two bars? Or one bar with background?
                Let's try a simple BarChart where "assigned" is the value.
                And we can use a custom shape or just simple bars for now.
                
                Let's switch to a simple BarChart of "Utilization %" maybe?
                Or just "Assigned Tasks" count.
              */}
            </ChartContainer>
            {/* Fallback to a custom list view for better control over "Capacity" visualization */}
            <div className="mt-6 space-y-4">
              {data.workload.map((member) => (
                <div key={member.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.image || undefined} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.name}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {member.assigned} / {member.capacity} tasks
                    </span>
                  </div>
                  <Progress
                    value={(member.assigned / member.capacity) * 100}
                    className={cn(
                      "h-2",
                      member.assigned > member.capacity
                        ? "text-destructive"
                        : ""
                    )}
                    // We need to style the indicator color based on value, but Progress component might not support it directly via props.
                    // Usually handled via class on the indicator, but shadcn Progress is simple.
                    // Let's just leave it default primary for now.
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Skill Distribution</CardTitle>
            <CardDescription>
              Resource allocation by technical domain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={distributionConfig}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <RadarChart data={data.projectDistribution}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <Radar
                  dataKey="A"
                  fill="var(--color-A)"
                  fillOpacity={0.6}
                  dot={{
                    r: 4,
                    fillOpacity: 1,
                  }}
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Availability List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Availability</CardTitle>
          <CardDescription>Current status of team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.availability.map((member) => (
              <div
                key={member.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={member.image || undefined} />
                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                      getStatusColor(member.status)
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium leading-none">
                    {member.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                  {member.currentTask && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      <Briefcase className="h-3 w-3" />
                      <span className="truncate max-w-[150px]">
                        {member.currentTask}
                      </span>
                    </div>
                  )}
                  {member.status === "overloaded" && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-destructive font-medium">
                      <AlertCircle className="h-3 w-3" />
                      Overloaded
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
