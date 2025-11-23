import { Suspense } from "react";
import { Metadata } from "next";
import { Plus } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { DashboardHeader } from "../_components/dashboard-header";
import { DataTable } from "../_components/data-table/data-table";
import { AdminRolesMetrics } from "./_components/admin-roles-metrics";
import { AdminRole, columns } from "./_components/admin-roles-table-columns";
import { AdminRolesTableToolbar } from "./_components/admin-roles-table-toolbar";
import { AdminRolesTableSkeleton } from "./_components/admin-roles-table-skeleton";

export const metadata: Metadata = {
  title: "Admin Roles",
  description: "Define and manage roles and permissions",
};

async function getData(): Promise<AdminRole[]> {
  // Mock data
  return [
    {
      id: "1",
      name: "Admin",
      guardName: "web",
      createdDate: "11/17/2025",
      updatedDate: "11/17/2025",
    },
    {
      id: "2",
      name: "Editor",
      guardName: "web",
      createdDate: "11/17/2025",
      updatedDate: "11/17/2025",
    },
    {
      id: "3",
      name: "Manager",
      guardName: "web",
      createdDate: "11/17/2025",
      updatedDate: "11/17/2025",
    },
    {
      id: "4",
      name: "Super Admin",
      guardName: "web",
      createdDate: "11/17/2025",
      updatedDate: "11/17/2025",
    },
    {
      id: "5",
      name: "Viewer",
      guardName: "web",
      createdDate: "11/17/2025",
      updatedDate: "11/17/2025",
    },
  ];
}

export default async function AdminRolesPage() {
  const data = await getData();

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <DashboardHeader
        title="Admin Roles"
        description="Define and manage roles and permissions"
      >
        <Button className="h-8 gap-1">
          <Plus className="size-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Role
          </span>
        </Button>
      </DashboardHeader>

      <AdminRolesMetrics />

      <div className="space-y-4">
        <div className="rounded-md border bg-card">
          <div className="p-4">
            <Suspense fallback={<AdminRolesTableSkeleton />}>
              <DataTable
                data={data}
                columns={columns}
                customToolbar={AdminRolesTableToolbar}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
