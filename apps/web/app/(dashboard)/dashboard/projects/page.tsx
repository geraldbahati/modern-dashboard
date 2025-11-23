import { Suspense } from "react";
import { Metadata } from "next";
import { Plus } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { DashboardHeader } from "../_components/dashboard-header";
import { DataTable } from "../_components/data-table/data-table";
import { ProjectsMetrics } from "./_components/projects-metrics";
import { columns, Project } from "./_components/projects-table-columns";
import { ProjectsTableToolbar } from "./_components/projects-table-toolbar";
import { ProjectsTableSkeleton } from "./_components/projects-table-skeleton";

export const metadata: Metadata = {
  title: "Projects",
  description: "Manage and track all your projects",
};

async function getData(): Promise<Project[]> {
  // Mock data
  return [
    {
      id: "1",
      name: "E-Commerce Platform",
      description: "Complete online store with payment int...",
      status: "Ready",
      environment: "Production",
      lastUpdated: "11/17/2025",
    },
    {
      id: "2",
      name: "Mobile App (iOS & Android)",
      description: "Cross-platform mobile application with ...",
      status: "Ready",
      environment: "Production",
      lastUpdated: "11/17/2025",
    },
    {
      id: "3",
      name: "Dashboard Analytics",
      description: "Real-time business intelligence dashbo...",
      status: "In Progress",
      environment: "Development",
      lastUpdated: "11/17/2025",
    },
    {
      id: "4",
      name: "API Gateway Service",
      description: "Microservices architecture with GraphQL...",
      status: "Ready",
      environment: "Production",
      lastUpdated: "11/17/2025",
    },
    {
      id: "5",
      name: "Database Migration",
      description: "PostgreSQL to MongoDB migration with...",
      status: "Ready",
      environment: "Staging",
      lastUpdated: "11/17/2025",
    },
    {
      id: "6",
      name: "Content Management System",
      description: "Headless CMS with multi-language sup...",
      status: "Ready",
      environment: "Production",
      lastUpdated: "11/17/2025",
    },
    {
      id: "7",
      name: "AI Chatbot Integration",
      description: "Customer service chatbot with NLP cap...",
      status: "In Progress",
      environment: "Development",
      lastUpdated: "11/17/2025",
    },
    {
      id: "8",
      name: "Payment Gateway",
      description: "Multi-currency payment processing sys...",
      status: "Ready",
      environment: "Production",
      lastUpdated: "11/17/2025",
    },
    {
      id: "9",
      name: "Video Streaming Platform",
      description: "Live and on-demand video streaming se...",
      status: "In Progress",
      environment: "Staging",
      lastUpdated: "11/17/2025",
    },
    {
      id: "10",
      name: "Social Media Integration",
      description: "Multi-platform social media manageme...",
      status: "Ready",
      environment: "Production",
      lastUpdated: "11/17/2025",
    },
  ];
}

export default async function ProjectsPage() {
  const data = await getData();

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <DashboardHeader
        title="Projects"
        description="Manage and track all your projects"
      >
        <Button className="h-8 gap-1">
          <Plus className="size-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Create Project
          </span>
        </Button>
      </DashboardHeader>

      <ProjectsMetrics />

      <div className="space-y-4">
        <div className="rounded-md border bg-card">
          <div className="p-4">
            <Suspense fallback={<ProjectsTableSkeleton />}>
              <DataTable
                data={data}
                columns={columns}
                customToolbar={ProjectsTableToolbar}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
