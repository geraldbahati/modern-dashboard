/**
 * RiskAssessment - Visualizes project risks with a matrix
 *
 * @example
 * <RiskAssessment risks={mockRisks} />
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
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";
import { AlertTriangle, ArrowRight, ShieldAlert, Info } from "lucide-react";

interface Risk {
  id: string;
  title: string;
  description: string;
  probability: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  mitigation: string;
  status: "active" | "mitigated" | "closed";
}

interface RiskAssessmentProps {
  risks: Risk[];
  className?: string;
}

export function RiskAssessment({ risks, className }: RiskAssessmentProps) {
  const [selectedRisk, setSelectedRisk] = React.useState<Risk | null>(null);

  // Helper to filter risks for a specific cell in the matrix
  const getRisksForCell = (
    probability: "low" | "medium" | "high",
    impact: "low" | "medium" | "high"
  ) => {
    return risks.filter(
      (r) => r.probability === probability && r.impact === impact
    );
  };

  const getSeverityColor = (
    probability: "low" | "medium" | "high",
    impact: "low" | "medium" | "high"
  ) => {
    const score =
      (probability === "high" ? 3 : probability === "medium" ? 2 : 1) *
      (impact === "high" ? 3 : impact === "medium" ? 2 : 1);

    if (score >= 6) return "bg-destructive/90 hover:bg-destructive"; // High Risk (Red)
    if (score >= 3) return "bg-yellow-500/90 hover:bg-yellow-500"; // Medium Risk (Yellow)
    return "bg-green-500/90 hover:bg-green-500"; // Low Risk (Green)
  };

  const MatrixCell = ({
    probability,
    impact,
  }: {
    probability: "low" | "medium" | "high";
    impact: "low" | "medium" | "high";
  }) => {
    const cellRisks = getRisksForCell(probability, impact);
    const colorClass = getSeverityColor(probability, impact);

    return (
      <div
        className={cn(
          "relative h-24 w-full border p-2 transition-all hover:scale-[1.02] cursor-pointer rounded-md",
          colorClass,
          selectedRisk &&
            cellRisks.find((r) => r.id === selectedRisk.id) &&
            "ring-4 ring-primary ring-offset-2"
        )}
        onClick={() => setSelectedRisk(cellRisks[0] || null)}
      >
        <div className="absolute top-1 right-2 text-xs font-bold text-white/90">
          {cellRisks.length > 0 ? cellRisks.length : ""}
        </div>
        {cellRisks.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {cellRisks.slice(0, 3).map((risk) => (
              <div
                key={risk.id}
                className="h-2 w-2 rounded-full bg-white/80"
                title={risk.title}
              />
            ))}
            {cellRisks.length > 3 && (
              <span className="text-[10px] text-white font-medium">
                +{cellRisks.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("grid gap-6 lg:grid-cols-3", className)}>
      {/* Risk Matrix */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Risk Matrix</CardTitle>
          <CardDescription>
            Visual distribution of risks by probability and impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative flex flex-col items-center justify-center p-4">
            {/* Y-Axis Label */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-bold text-muted-foreground tracking-widest">
              PROBABILITY
            </div>

            <div className="w-full pl-8 pb-8">
              <div className="grid grid-cols-3 gap-2">
                {/* Row: High Probability */}
                <MatrixCell probability="high" impact="low" />
                <MatrixCell probability="high" impact="medium" />
                <MatrixCell probability="high" impact="high" />

                {/* Row: Medium Probability */}
                <MatrixCell probability="medium" impact="low" />
                <MatrixCell probability="medium" impact="medium" />
                <MatrixCell probability="medium" impact="high" />

                {/* Row: Low Probability */}
                <MatrixCell probability="low" impact="low" />
                <MatrixCell probability="low" impact="medium" />
                <MatrixCell probability="low" impact="high" />
              </div>
            </div>

            {/* X-Axis Label */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm font-bold text-muted-foreground tracking-widest pl-8">
              IMPACT
            </div>

            {/* Axis Ticks (Visual only) */}
            <div className="absolute left-6 top-[15%] text-xs text-muted-foreground">
              High
            </div>
            <div className="absolute left-6 top-[50%] text-xs text-muted-foreground">
              Med
            </div>
            <div className="absolute left-6 top-[85%] text-xs text-muted-foreground">
              Low
            </div>

            <div className="absolute bottom-6 left-[15%] text-xs text-muted-foreground">
              Low
            </div>
            <div className="absolute bottom-6 left-[50%] text-xs text-muted-foreground">
              Med
            </div>
            <div className="absolute bottom-6 left-[85%] text-xs text-muted-foreground">
              High
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Details Panel */}
      <div className="space-y-6">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Risk Details
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[400px] space-y-4">
            {selectedRisk ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant={
                        selectedRisk.status === "active"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {selectedRisk.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ID: {selectedRisk.id}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg">{selectedRisk.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedRisk.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-muted rounded-md">
                    <span className="block text-xs text-muted-foreground">
                      Probability
                    </span>
                    <span className="font-medium capitalize">
                      {selectedRisk.probability}
                    </span>
                  </div>
                  <div className="p-2 bg-muted rounded-md">
                    <span className="block text-xs text-muted-foreground">
                      Impact
                    </span>
                    <span className="font-medium capitalize">
                      {selectedRisk.impact}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-md">
                  <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-1">
                    <Info className="h-4 w-4" /> Mitigation Strategy
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    {selectedRisk.mitigation}
                  </p>
                </div>

                <Button className="w-full" variant="outline">
                  View Full Report <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <AlertTriangle className="h-12 w-12 mb-4 opacity-20" />
                <p>Select a cell in the matrix or a risk to view details.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* High Priority Risks List */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Critical Risks</CardTitle>
          <CardDescription>
            Risks requiring immediate attention (High Probability & High Impact)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {risks
              .filter((r) => r.probability === "high" && r.impact === "high")
              .map((risk) => (
                <div
                  key={risk.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedRisk(risk)}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <div>
                      <div className="font-medium">{risk.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {risk.mitigation}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    Details
                  </Button>
                </div>
              ))}
            {risks.filter(
              (r) => r.probability === "high" && r.impact === "high"
            ).length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No critical risks identified. Great job!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
