import { Suspense } from "react";
import { Metadata } from "next";
import { Plus } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { DashboardHeader } from "../_components/dashboard-header";
import { DataTable } from "../_components/data-table/data-table";
import { UsersMetrics } from "./_components/users-metrics";
import { columns, User } from "./_components/users-table-columns";
import { UsersTableToolbar } from "./_components/users-table-toolbar";
import { UsersTableSkeleton } from "./_components/users-table-skeleton";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage platform users and accounts",
};

async function getData(): Promise<User[]> {
  // Mock data
  return [
    {
      id: "1",
      name: "Gerald Bahati",
      email: "gerald@gmail.com",
      phone: "555-123-4567",
      status: "Unverified",
      joinedDate: "17/11/2025",
    },
    {
      id: "2",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      status: "Verified",
      joinedDate: "15/11/2025",
    },
    {
      id: "3",
      name: "Lisa Anderson",
      email: "lisa.anderson@example.com",
      phone: "+1555753951",
      status: "Verified",
      joinedDate: "14/11/2025",
    },
    {
      id: "4",
      name: "Jennifer Lee",
      email: "jennifer.lee@example.com",
      phone: "+1555258369",
      status: "Verified",
      joinedDate: "13/11/2025",
    },
    {
      id: "5",
      name: "Patricia Moore",
      email: "patricia.moore@example.com",
      phone: "+1555963852",
      status: "Unverified",
      joinedDate: "07/11/2025",
    },
    {
      id: "6",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1987654321",
      status: "Verified",
      joinedDate: "06/11/2025",
    },
    {
      id: "7",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      phone: "+1555135791",
      status: "Verified",
      joinedDate: "05/11/2025",
    },
    {
      id: "8",
      name: "William Rodriguez",
      email: "william.rodriguez@example.com",
      phone: "+1555357159",
      status: "Verified",
      joinedDate: "30/10/2025",
    },
    {
      id: "9",
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      phone: "+1555123456",
      status: "Verified",
      joinedDate: "28/10/2025",
    },
    {
      id: "10",
      name: "Charles Wilson",
      email: "charles.wilson@example.com",
      phone: "+1555741852",
      status: "Verified",
      joinedDate: "28/10/2025",
    },
    {
      id: "11",
      name: "Charles Wilson",
      email: "charles.wilson@example.com",
      phone: "+1555741852",
      status: "Verified",
      joinedDate: "28/10/2025",
    },
  ];
}

export default async function UsersPage() {
  const data = await getData();

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <DashboardHeader
        title="All Users"
        description="Manage platform users and accounts"
      >
        <Button className="h-8 gap-1">
          <Plus className="size-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Create User
          </span>
        </Button>
      </DashboardHeader>

      <UsersMetrics />

      <div className="space-y-4">
        <div className="rounded-md border bg-card">
          <div className="p-4">
            <Suspense fallback={<UsersTableSkeleton />}>
              <DataTable
                data={data}
                columns={columns}
                customToolbar={UsersTableToolbar}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
