import { Metadata } from "next";

import { DataTable } from "../_components/data-table/data-table";
import { columns, Payment } from "./columns";

export const metadata: Metadata = {
  title: "Tasks",
  description: "A task and issue tracker build using Tanstack Table.",
};

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "489e1d42",
      amount: 125,
      status: "processing",
      email: "example@gmail.com",
    },
    {
      id: "628ed52f",
      amount: 200,
      status: "success",
      email: "success@example.com",
    },
    {
      id: "528ed52f",
      amount: 50,
      status: "failed",
      email: "failed@example.com",
    },
    // Add more dummy data for pagination testing
    ...Array.from({ length: 20 }).map((_, i) => ({
      id: `id-${i}`,
      amount: Math.floor(Math.random() * 500),
      status: ["pending", "processing", "success", "failed"][
        Math.floor(Math.random() * 4)
      ] as Payment["status"],
      email: `user${i}@example.com`,
    })),
  ];
}

export default async function DemoPage() {
  const data = await getData();

  return (
    <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of your tasks for this month!
          </p>
        </div>
      </div>
      <DataTable data={data} columns={columns} searchKey="email" />
    </div>
  );
}
