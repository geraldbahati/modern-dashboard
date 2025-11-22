"use client";

import * as React from "react";
import {
  Bot,
  Folder,
  Home,
  LogOut,
  Settings,
  Shield,
  UserCog,
  Users,
  Component,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar";

// Menu items.
const navMain = [
  {
    title: "Overview",
    url: "#",
    icon: Home,
  },
  {
    title: "AI Assistant",
    url: "#",
    icon: Bot,
    isActive: true,
  },
  {
    title: "Users",
    url: "#",
    icon: Users,
  },
  {
    title: "Projects",
    url: "#",
    icon: Folder,
  },
];

const navAdmin = [
  {
    title: "Admin Management",
    url: "#",
    icon: UserCog,
  },
  {
    title: "Admin Roles",
    url: "#",
    icon: Shield,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

const navDemos = [
  {
    title: "UI Component",
    url: "#",
    icon: Component,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="top-[5.25rem] h-[calc(100svh-5.25rem)] pl-4 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+theme(spacing.6)+2px)]"
      {...props}
    >
      <div
        className="absolute inset-0 pointer-events-none rounded-lg ml-4 mt-2"
        style={{
          zIndex: 20,
          background:
            "radial-gradient(800px 2900px at 0% 0%, rgba(205, 205, 205, 0.04) 0%, rgba(205, 205, 205, 0) 30%, transparent 70%)",
        }}
      />
      <SidebarContent className="relative z-30">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px]">MAIN</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className="text-muted-foreground"
                >
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    tooltip={item.title}
                    className="pl-4"
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px]">ADMIN</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navAdmin.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className="text-muted-foreground"
                >
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="pl-4"
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px]">DEMOS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navDemos.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className="text-muted-foreground"
                >
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="pl-4"
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="relative z-30">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Logout">
              <a href="#">
                <LogOut />
                <span>Logout</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
