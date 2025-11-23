import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import { TopBar } from "./_components/topbar";
import { AppSidebar } from "./_components/app-sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen w-full">
        <TopBar />
        <div className="flex flex-1 pt-[5.25rem]">
          <AppSidebar />
          <SidebarInset>
            <div className="flex-1 p-4">{children}</div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
