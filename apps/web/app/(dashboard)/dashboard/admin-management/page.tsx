import { Suspense } from "react";
import { Metadata } from "next";
import { Plus } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { DashboardHeader } from "../_components/dashboard-header";
import { DataTable } from "../_components/data-table/data-table";
import { AdminsMetrics } from "./_components/admins-metrics";
import { Admin, columns } from "./_components/admins-table-columns";
import { AdminsTableToolbar } from "./_components/admins-table-toolbar";
import { AdminsTableSkeleton } from "./_components/admins-table-skeleton";

export const metadata: Metadata = {
  title: "Admin Management",
  description: "Manage admin users and their access",
};

async function getData(): Promise<Admin[]> {
  // Mock data
  return [
    {
      id: "1",
      name: "Demo Tester",
      email: "admin+ufpf5ze0@example.com",
      phone: "",
      role: "Super Admin",
      createdDate: "17/11/2025",
    },
    {
      id: "2",
      name: "David Wilson",
      email: "david.wilson@admin.com",
      phone: "+1555900100",
      role: "Viewer",
      createdDate: "17/11/2025",
    },
    {
      id: "3",
      name: "Lisa Anderson",
      email: "lisa.anderson@admin.com",
      phone: "+1555110220",
      role: "Viewer",
      createdDate: "17/11/2025",
    },
    {
      id: "4",
      name: "James Garcia",
      email: "james.garcia@admin.com",
      phone: "+1555330440",
      role: "Viewer",
      createdDate: "17/11/2025",
    },
    {
      id: "5",
      name: "Maria Martinez",
      email: "maria.martinez@admin.com",
      phone: "+1555550660",
      role: "Viewer",
      createdDate: "17/11/2025",
    },
    {
      id: "6",
      name: "Robert Thomas",
      email: "robert.thomas@admin.com",
      phone: "+1555770880",
      role: "Viewer",
      createdDate: "17/11/2025",
    },
    {
      id: "7",
      name: "Jennifer Taylor",
      email: "jennifer.taylor@admin.com",
      phone: "+1555990010",
      role: "Viewer",
      createdDate: "17/11/2025",
    },
    {
      id: "8",
      name: "William Moore",
      email: "william.moore@admin.com",
      phone: "+1555112233",
      role: "Viewer",
      createdDate: "17/11/2025",
    },
    {
      id: "9",
      name: "John Smith",
      email: "john.smith@admin.com",
      phone: "+1555100200",
      role: "Viewer",
      createdDate: "17/11/2025",
    },
    {
      id: "10",
      name: "Sarah Jones",
      email: "sarah.jones@admin.com",
      phone: "+1555300400",
      role: "Viewer",
      createdDate: "17/11/2025",
    },
    {
      id: "11",
      name: "Michael Brown",
      email: "michael.brown@admin.com",
      phone: "+1555400500",
      role: "Viewer",
      createdDate: "17/11/2025",
    },
    {
      id: "12",
      name: "Emily Davis",
      email: "emily.davis@admin.com",
      phone: "+1555600700",
      role: "Viewer",
      createdDate: "17/11/2025",
    },
  ];
}

export default async function AdminsManagementPage() {
  const data = await getData();

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <DashboardHeader
        title="Admin Management"
        description="Manage admin users and their access"
      >
        <Button className="h-8 gap-1">
          <Plus className="size-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Admin
          </span>
        </Button>
      </DashboardHeader>

      <AdminsMetrics />

      <div className="space-y-4">
        <div className="rounded-md border bg-card">
          <div className="p-4">
            <Suspense fallback={<AdminsTableSkeleton />}>
              <DataTable
                data={data}
                columns={columns}
                customToolbar={AdminsTableToolbar}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
