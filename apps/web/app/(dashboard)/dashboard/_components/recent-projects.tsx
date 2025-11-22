"use client";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardCard } from "@workspace/ui/components/dashboard-card";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { columns, Project } from "./recent-projects-columns";
import { Code, Smartphone, LayoutDashboard, Cloud } from "lucide-react";
import { useState } from "react";

const data: Project[] = [
  {
    id: "1",
    name: "E-Commerce Platform",
    description: "Complete online store with payment integration",
    status: "Ready",
    lastUpdated: "11/17/2025",
    icon: Code,
  },
  {
    id: "2",
    name: "Mobile App (iOS & Android)",
    description: "Cross-platform mobile application with push notifications",
    status: "Ready",
    lastUpdated: "11/17/2025",
    icon: Smartphone,
  },
  {
    id: "3",
    name: "Dashboard Analytics",
    description: "Real-time business intelligence dashboard",
    status: "In Progress",
    lastUpdated: "11/17/2025",
    icon: LayoutDashboard,
  },
  {
    id: "4",
    name: "API Gateway Service",
    description: "Microservices architecture with GraphQL",
    status: "Ready",
    lastUpdated: "11/17/2025",
    icon: Cloud,
  },
  // Adding more dummy data for pagination demo
  {
    id: "5",
    name: "User Authentication",
    description: "OAuth2 and JWT implementation",
    status: "Ready",
    lastUpdated: "11/16/2025",
    icon: Code,
  },
  {
    id: "6",
    name: "Payment Gateway",
    description: "Stripe and PayPal integration",
    status: "Failed",
    lastUpdated: "11/15/2025",
    icon: Code,
  },
];

export default function RecentProjects() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 4,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  return (
    <DashboardCard className="p-0 overflow-hidden min-h-[450px]">
      <div className="p-6 flex items-center justify-between border-b border-border/50">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Recent Projects
          </h3>
          <p className="text-sm text-muted-foreground">
            Overview of active development projects
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-border/50"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-xs font-semibold text-muted-foreground h-10"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/30 border-border/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/10">
        <div className="text-xs text-muted-foreground">
          Showing{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{" "}
          to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {/* Simple pagination numbers for demo */}
            {Array.from({ length: table.getPageCount() }, (_, i) => (
              <Button
                key={i}
                variant={
                  table.getState().pagination.pageIndex === i
                    ? "default"
                    : "outline"
                }
                size="icon"
                className="h-8 w-8 text-xs"
                onClick={() => table.setPageIndex(i)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DashboardCard>
  );
}

export function RecentProjectsSkeleton() {
  return (
    <DashboardCard className="p-0 overflow-hidden h-full">
      <div className="p-6 flex items-center justify-between border-b border-border/50">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="p-0">
        <div className="space-y-4 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-8 w-8 rounded-md" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}
