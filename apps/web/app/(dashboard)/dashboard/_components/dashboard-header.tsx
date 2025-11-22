import { Button } from "@workspace/ui/components/button";
import { Calendar, ChevronDown, Download } from "lucide-react";
import { AppBreadcrumb } from "./app-breadcrumb";

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <AppBreadcrumb />
        <h1 className="text-2xl font-bold tracking-tight mt-2">Overview</h1>
        <p className="text-muted-foreground text-sm">
          Monitor key metrics and manage your platform
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Calendar className="size-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            This Month
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Download className="size-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Export
          </span>
        </Button>
      </div>
    </div>
  );
}
