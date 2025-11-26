/**
 * PredictiveAnalytics - AI-driven project forecasts
 *
 * @example
 * <PredictiveAnalytics data={mockPredictionData} />
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
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";

import { cn } from "@workspace/ui/lib/utils";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface PredictionData {
  forecast: {
    date: string;
    actual: number | null;
    predicted: number | null;
    lowerBound: number | null;
    upperBound: number | null;
  }[];
  insights: {
    id: string;
    type: "positive" | "negative" | "neutral";
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
  }[];
  drivers: {
    name: string;
    impact: number; // -100 to 100
  }[];
  summary: {
    predictedCompletionDate: Date;
    confidenceScore: number;
    riskLevel: "low" | "medium" | "high";
  };
}

interface PredictiveAnalyticsProps {
  data: PredictionData;
  className?: string;
}

export function PredictiveAnalytics({
  data,
  className,
}: PredictiveAnalyticsProps) {
  const chartConfig = {
    actual: {
      label: "Actual Progress",
      color: "hsl(var(--primary))",
    },
    predicted: {
      label: "Forecast",
      color: "hsl(var(--blue-500))",
    },
    bound: {
      label: "Confidence Interval",
      color: "hsl(var(--blue-500))",
    },
  } satisfies ChartConfig;

  const driversConfig = {
    impact: {
      label: "Impact",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Predicted Completion
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {data.summary.predictedCompletionDate.toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on current velocity
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.confidenceScore}%
            </div>
            <p className="text-xs text-muted-foreground">
              Prediction accuracy score
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <AlertTriangle
              className={cn(
                "h-4 w-4",
                data.summary.riskLevel === "high"
                  ? "text-destructive"
                  : data.summary.riskLevel === "medium"
                    ? "text-yellow-500"
                    : "text-green-500"
              )}
            />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold capitalize",
                data.summary.riskLevel === "high"
                  ? "text-destructive"
                  : data.summary.riskLevel === "medium"
                    ? "text-yellow-500"
                    : "text-green-500"
              )}
            >
              {data.summary.riskLevel}
            </div>
            <p className="text-xs text-muted-foreground">
              Overall project risk
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Forecast Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Completion Forecast</CardTitle>
            <CardDescription>
              Projected progress with 95% confidence interval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <ComposedChart
                data={data.forecast}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                {/* Confidence Interval Area */}
                <defs>
                  <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-predicted)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-predicted)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="none"
                  fill="var(--color-bound)"
                  fillOpacity={0.1}
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="none"
                  fill="var(--background)"
                  fillOpacity={1}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="var(--color-actual)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="var(--color-predicted)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Insights Panel */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.insights.map((insight) => (
                <div
                  key={insight.id}
                  className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-1">
                    {insight.type === "positive" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : insight.type === "negative" ? (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    ) : (
                      <Brain className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium leading-none">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {insight.description}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] h-5 px-1.5",
                        insight.impact === "high"
                          ? "border-destructive text-destructive"
                          : "border-muted-foreground text-muted-foreground"
                      )}
                    >
                      {insight.impact} impact
                    </Badge>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full text-xs">
                View All Insights <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Key Drivers */}
      <Card>
        <CardHeader>
          <CardTitle>Key Drivers</CardTitle>
          <CardDescription>
            Factors influencing the current prediction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={driversConfig} className="h-[200px]">
            <BarChart
              layout="vertical"
              data={data.drivers}
              margin={{ top: 0, right: 0, left: 40, bottom: 0 }}
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
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="impact"
                fill="var(--color-impact)"
                radius={[0, 4, 4, 0]}
                barSize={20}
              >
                {data.drivers.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.impact > 0
                        ? "hsl(var(--green-500))"
                        : "hsl(var(--destructive))"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
